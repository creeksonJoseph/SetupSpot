"""Setup service — orchestrates Cloudinary upload and setup + item persistence.

Knows about: cloudinary, transactions.setup_repo, transactions.item_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
import json

import cloudinary.uploader
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from models.setup import Setup
from services import algolia_service
from transactions import setup_repo
from transactions import item_repo


def _upload_image(file_obj) -> str:
    """Upload a file-like object to Cloudinary and return its secure URL."""
    try:
        result = cloudinary.uploader.upload(
            file_obj,
            upload_preset=settings.CLOUDINARY_UPLOAD_PRESET,
            folder="setups",
            resource_type="image",
        )
        return result["secure_url"]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Image upload failed: {exc}",
        )


def _parse_price(raw: str | float | None) -> float:
    """Safely convert a price value (possibly '$1,299.99') to a float."""
    try:
        return float(str(raw or "0").replace("$", "").replace(",", ""))
    except ValueError:
        return 0.0


def create_setup(
    db: Session,
    file_obj,
    setup_name: str,
    items_data: list[dict],
    user_id: int,
) -> Setup:
    """Upload image, persist setup + items, write annotations. Returns the saved Setup."""
    image_url = _upload_image(file_obj)

    setup = setup_repo.create(db, name=setup_name, image_url=image_url, user_id=user_id)

    annotation_metadata = []
    for item_data in items_data:
        item = item_repo.create(
            db,
            name=item_data.get("name", "Unnamed Item"),
            price=_parse_price(item_data.get("price")),
            link=item_data.get("link"),
            description=item_data.get("description", ""),
            setup_id=setup.id,
            user_id=user_id,
        )
        annotation_metadata.append(
            {"item_id": item.id, "x": item_data.get("x"), "y": item_data.get("y")}
        )

    db.commit()
    setup = setup_repo.update_annotations(db, setup, annotation_metadata)

    # Sync to Algolia (non-blocking — errors are logged, not raised)
    algolia_service.index_setup(setup)

    # Generate pgvector embedding (fastembed BAAI/bge-small model)
    try:
        from services import recommendation_service
        recommendation_service.embed_and_save_setup(db, setup.id)
    except Exception as exc:
        print(f"Error generating embedding for setup {setup.id}: {exc}")

    # Invalidate explore feed cache
    from core import redis_client
    redis_client.invalidate_explore_setups()

    return setup


def get_setup_detail(db: Session, setup_id: int) -> Setup:
    """Return a single setup or raise 404."""
    setup = setup_repo.get_by_id(db, setup_id)
    if not setup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setup not found")
    return setup


def delete_setup(db: Session, setup_id: int, user_id: int) -> None:
    """Delete a setup if it belongs to the requesting user."""
    setup = setup_repo.get_by_id(db, setup_id)
    if not setup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setup not found")
    if setup.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your setup")
    algolia_service.delete_setup(setup_id)
    setup_repo.delete(db, setup)

    # Invalidate caches
    from core import redis_client
    redis_client.invalidate_explore_setups()
    redis_client.invalidate_setup_detail(setup_id)


def list_setups_for_user(db: Session, requesting_user_id: int | None = None) -> list[dict]:
    """Return all setups enriched with favourite flag. Works for anonymous users (no favourites). Caches in Upstash Redis (10m TTL)."""
    from transactions.favorite_repo import get_by_user as get_favorites
    from core import redis_client

    # 1. Check Upstash Redis cache
    cached_feed = redis_client.get_cached_explore_setups()
    if cached_feed is not None and isinstance(cached_feed, list):
        favorited_ids: set[int] = set()
        if requesting_user_id is not None:
            favorites = get_favorites(db, requesting_user_id)
            favorited_ids = {f.setup_id for f in favorites}

        return [
            {
                **s,
                "isFavorited": s.get("id") in favorited_ids if requesting_user_id else s.get("isFavorited", False),
            }
            for s in cached_feed
        ]

    # 2. Database query on cache miss
    all_setups = setup_repo.get_all(db)
    raw_feed = []
    for s in all_setups:
        raw_feed.append({
            "id": s.id,
            "title": s.name,
            "image": s.image_url,
            "author": f"@{s.user.username}",
            "isFavorited": False,
        })

    # Cache for 10 minutes (600s)
    redis_client.set_cached_explore_setups(raw_feed, ttl=600)

    # Enrich with user favorites
    if requesting_user_id is not None:
        favorites = get_favorites(db, requesting_user_id)
        favorited_ids = {f.setup_id for f in favorites}
        for item in raw_feed:
            item["isFavorited"] = item["id"] in favorited_ids

    return raw_feed


def serialize_setup_detail(setup: Setup, requesting_user_id: int | None = None) -> dict:
    """Build the detailed setup response. Caches in Upstash Redis (15m TTL)."""
    from transactions import like_repo, comment_repo
    from core import redis_client

    # 1. Check Upstash Redis cache
    cached_detail = redis_client.get_cached_setup_detail(setup.id)
    if cached_detail is not None and isinstance(cached_detail, dict):
        is_liked = False
        if requesting_user_id is not None:
            is_liked = any(l.user_id == requesting_user_id for l in setup.likes)
        return {**cached_detail, "is_liked": is_liked}

    try:
        annotations = json.loads(setup.annotations) if setup.annotations else []
    except json.JSONDecodeError:
        annotations = []

    items_map = {item.id: item for item in setup.items}
    annotated_items = []
    for ann in annotations:
        item = items_map.get(ann.get("item_id"))
        if item:
            annotated_items.append({
                "id": item.id,
                "name": item.name,
                "price": item.price,
                "link": item.link,
                "description": item.description,
                "item_image_url": item.image_url if hasattr(item, "image_url") else None,
                "x": ann["x"],
                "y": ann["y"],
            })

    like_count = len(setup.likes)
    comment_count = len(setup.comments)
    is_liked = False
    if requesting_user_id is not None:
        is_liked = any(l.user_id == requesting_user_id for l in setup.likes)

    payload = {
        "id": setup.id,
        "name": setup.name,
        "image_url": setup.image_url,
        "user_id": setup.user_id,
        "author_username": setup.user.username,
        "author_avatar": setup.user.avatar_url,
        "like_count": like_count,
        "is_liked": False,
        "comment_count": comment_count,
        "items": annotated_items,
    }

    # Save to Redis cache for 15 minutes (900s)
    redis_client.set_cached_setup_detail(setup.id, payload, ttl=900)

    payload["is_liked"] = is_liked
    return payload
