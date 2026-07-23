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
    setup_repo.delete(db, setup)


def list_setups_for_user(db: Session, requesting_user_id: int) -> list[dict]:
    """Return all setups enriched with favourite flag for the requesting user."""
    from transactions.favorite_repo import get_by_user as get_favorites

    all_setups = setup_repo.get_all(db)
    favorites = get_favorites(db, requesting_user_id)
    favorited_ids = {f.setup_id for f in favorites}

    result = []
    for s in all_setups:
        result.append({
            "id": s.id,
            "title": s.name,
            "image": s.image_url,
            "author": f"@{s.user.username}",
            "isFavorited": s.id in favorited_ids,
        })
    return result


def serialize_setup_detail(setup: Setup) -> dict:
    """Build the detailed setup response (with annotated items)."""
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
                "x": ann["x"],
                "y": ann["y"],
            })

    return {
        "id": setup.id,
        "name": setup.name,
        "image_url": setup.image_url,
        "user_id": setup.user_id,
        "items": annotated_items,
    }
