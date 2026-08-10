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
    setup_name: str,
    items_data: list[dict],
    user_id: int,
    file_obj=None,
    pre_uploaded_url: str | None = None,
) -> Setup:
    """
    Persist a setup + its annotated items. Supports two image paths:

    - Early Upload path (preferred): pass ``pre_uploaded_url`` with the
      Cloudinary URL returned by ``POST /api/early-upload``. No second
      Cloudinary upload is performed — the already-hosted URL is stored
      directly in the database.

    - Legacy path: pass ``file_obj`` (a raw file-like object). The image
      is uploaded to Cloudinary on the fly. Kept for backwards compatibility.
    """
    if pre_uploaded_url:
        image_url = pre_uploaded_url
    elif file_obj is not None:
        image_url = _upload_image(file_obj)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a file upload or a pre-uploaded image URL must be provided.",
        )

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

    # Invalidate explore feed cache so the new setup appears on next request
    from core import redis_client
    redis_client.invalidate_explore_setups()

    # ↓ Algolia indexing and pgvector embedding are intentionally NOT called here.
    # They are dispatched as FastAPI BackgroundTasks in the router so the HTTP
    # response returns the moment the DB write commits (≈100ms faster on cold start).
    return setup


def update_setup(
    db: Session,
    setup_id: int,
    user_id: int,
    setup_name: str,
    items_data: list[dict],
) -> Setup:
    """
    Update an existing setup's title and annotated items.
    Note: Setup image cannot be changed once posted.
    """
    setup = setup_repo.get_by_id(db, setup_id)
    if not setup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setup not found")
    if setup.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to edit this setup")

    setup.name = setup_name

    # Remove existing items and replace with new item list
    item_repo.delete_by_setup_id(db, setup_id)

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

    # Invalidate Redis caches
    from core import redis_client
    redis_client.invalidate_explore_setups()
    redis_client.invalidate_setup_detail(setup_id)

    return setup


def background_index_setup(setup_id: int, db_url: str) -> None:
    """Background task: index a newly created setup into Algolia and generate its
    pgvector embedding. Runs *after* the HTTP response has been sent.

    We recreate a fresh DB session here because the request session is closed
    by the time this task executes.
    """
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url, pool_pre_ping=True)
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        setup = setup_repo.get_by_id(db, setup_id)
        if not setup:
            return

        # 1. Algolia (search index)
        try:
            algolia_service.index_setup(setup)
        except Exception as exc:
            print(f"[BG] Algolia indexing failed for setup {setup_id}: {exc}")

        # 2. pgvector embedding (BAAI/bge-small-en-v1.5, 384 dims)
        try:
            from services import recommendation_service
            recommendation_service.embed_and_save_setup(db, setup_id)
        except Exception as exc:
            print(f"[BG] Embedding failed for setup {setup_id}: {exc}")
    finally:
        db.close()
        engine.dispose()


def background_delete_from_algolia(setup_id: int) -> None:
    """Background task: remove a deleted setup from the Algolia index."""
    try:
        algolia_service.delete_setup(setup_id)
    except Exception as exc:
        print(f"[BG] Algolia delete failed for setup {setup_id}: {exc}")


def get_setup_detail(db: Session, setup_id: int) -> Setup:
    """Return a single setup or raise 404."""
    setup = setup_repo.get_by_id(db, setup_id)
    if not setup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setup not found")
    return setup


def delete_setup(db: Session, setup_id: int, user_id: int) -> None:
    """Delete a setup if it belongs to the requesting user.

    Algolia removal happens in a background task in the router — the DB delete
    commits immediately so the setup disappears from the feed instantly.
    """
    setup = setup_repo.get_by_id(db, setup_id)
    if not setup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setup not found")
    if setup.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your setup")
    setup_repo.delete(db, setup)

    # Invalidate caches
    from core import redis_client
    redis_client.invalidate_explore_setups()
    redis_client.invalidate_setup_detail(setup_id)


def list_setups_for_user(
    db: Session,
    requesting_user_id: int | None = None,
    cursor: int | None = None,
    limit: int = 48,
) -> list[dict]:
    """Return setups enriched with favourite flag, with cursor-based pagination.

    Cursor pagination — O(log n) index seek:
      cursor=None  → first page (newest `limit` setups)
      cursor=<id>  → next page (setups with id < cursor, newest-first)

    The first page is cached in Upstash Redis (10m TTL, key: explore_setups_feed).
    Subsequent pages are cached per-cursor (2m TTL) since they're less common.
    Works for anonymous users (no favourites) and authenticated users.
    """
    from transactions.favorite_repo import get_by_user as get_favorites
    from core import redis_client

    is_first_page = cursor is None
    redis_key = "explore_setups_feed" if is_first_page else f"explore_setups_cursor:{cursor}:limit:{limit}"
    ttl = 600 if is_first_page else 120  # 10m for first page, 2m for paginated pages

    # 1. Check Upstash Redis cache
    cached_feed = redis_client.get_json(redis_key)
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
    page_setups = setup_repo.get_page(db, cursor=cursor, limit=limit)
    raw_feed = [
        {
            "id": s.id,
            "title": s.name,
            "image": s.image_url,
            "author": f"@{s.user.username}",
            "isFavorited": False,
        }
        for s in page_setups
    ]

    # Cache this page
    redis_client.set_json(redis_key, raw_feed, ttl_seconds=ttl)

    # Enrich with user favorites
    if requesting_user_id is not None:
        favorites = get_favorites(db, requesting_user_id)
        favorited_ids = {f.setup_id for f in favorites}
        for item in raw_feed:
            item["isFavorited"] = item["id"] in favorited_ids

    return raw_feed


def serialize_setup_detail(setup: Setup, requesting_user_id: int | None = None, db: Session | None = None) -> dict:
    """Build the detailed setup response. Caches in Upstash Redis (15m TTL)."""
    from transactions import like_repo, comment_repo, favorite_repo
    from core import redis_client

    # 1. Check Upstash Redis cache
    cached_detail = redis_client.get_cached_setup_detail(setup.id)
    if cached_detail is not None and isinstance(cached_detail, dict):
        is_liked = False
        is_favorited = False
        if requesting_user_id is not None and db is not None:
            from transactions import like_repo, favorite_repo
            is_liked = like_repo.get_by_user_and_setup(db, requesting_user_id, setup.id) is not None
            is_favorited = favorite_repo.get_by_user_and_setup(db, requesting_user_id, setup.id) is not None
        elif requesting_user_id is not None:
            # Fallback: in-memory check if db not provided
            is_liked = any(l.user_id == requesting_user_id for l in setup.likes)
            is_favorited = any(f.user_id == requesting_user_id for f in setup.favorites)
        return {**cached_detail, "is_liked": is_liked, "is_favorited": is_favorited}

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

    like_count = setup_repo.count_likes(db, setup.id) if db is not None else len(setup.likes)
    comment_count = setup_repo.count_comments(db, setup.id) if db is not None else len(setup.comments)
    is_liked = False
    is_favorited = False
    if requesting_user_id is not None and db is not None:
        from transactions import like_repo, favorite_repo
        is_liked = like_repo.get_by_user_and_setup(db, requesting_user_id, setup.id) is not None
        is_favorited = favorite_repo.get_by_user_and_setup(db, requesting_user_id, setup.id) is not None
    elif requesting_user_id is not None:
        is_liked = any(l.user_id == requesting_user_id for l in setup.likes)
        is_favorited = any(f.user_id == requesting_user_id for f in setup.favorites)

    payload = {
        "id": setup.id,
        "name": setup.name,
        "image_url": setup.image_url,
        "user_id": setup.user_id,
        "author_username": setup.user.username,
        "author_avatar": setup.user.avatar_url,
        "like_count": like_count,
        "is_liked": False,
        "is_favorited": False,
        "comment_count": comment_count,
        "items": annotated_items,
    }

    # Save to Redis cache for 15 minutes (900s)
    redis_client.set_cached_setup_detail(setup.id, payload, ttl=900)

    payload["is_liked"] = is_liked
    payload["is_favorited"] = is_favorited
    return payload

