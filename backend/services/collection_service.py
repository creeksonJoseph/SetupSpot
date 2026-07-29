"""Collection service — business rules for collections.

Knows about: transactions.collection_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.collection import Collection
from models.item import Item
from transactions import collection_repo


def format_collection_dto(collection: Collection) -> dict:
    items_out = []
    cover_images = []

    for item in collection.items:
        setup_img = item.setup.image_url if item.setup else None
        setup_title = item.setup.name if item.setup else None
        author_username = item.setup.user.username if (item.setup and item.setup.user) else None

        if setup_img and setup_img not in cover_images and len(cover_images) < 4:
            cover_images.append(setup_img)

        items_out.append({
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "link": item.link,
            "description": item.description,
            "setup_id": item.setup_id,
            "setup_title": setup_title,
            "setup_image_url": setup_img,
            "author_username": author_username,
        })

    return {
        "id": collection.id,
        "name": collection.name,
        "user_id": collection.user_id,
        "item_count": len(collection.items),
        "cover_images": cover_images,
        "items": items_out,
    }


def list_for_user(db: Session, user_id: int) -> list[dict]:
    collections = collection_repo.get_by_user(db, user_id)
    return [format_collection_dto(c) for c in collections]


def get_or_404(db: Session, collection_id: int) -> Collection:
    collection = collection_repo.get_by_id(db, collection_id)
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return collection


def get_dto_or_404(db: Session, collection_id: int) -> dict:
    collection = get_or_404(db, collection_id)
    return format_collection_dto(collection)


def create(db: Session, name: str, user_id: int) -> dict:
    clean_name = name.strip()
    existing = (
        db.query(Collection)
        .filter(Collection.user_id == user_id, Collection.name.ilike(clean_name))
        .first()
    )
    if existing:
        full_collection = collection_repo.get_by_id(db, existing.id)
        return format_collection_dto(full_collection)

    created = collection_repo.create(db, name=clean_name, user_id=user_id)
    full_collection = collection_repo.get_by_id(db, created.id)
    return format_collection_dto(full_collection)



def rename(db: Session, collection_id: int, name: str, user_id: int) -> dict:
    collection = get_or_404(db, collection_id)
    if collection.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your collection")
    updated = collection_repo.update_name(db, collection, name)
    return format_collection_dto(updated)


def add_item(db: Session, collection_id: int, item_id: int, user_id: int) -> dict:
    collection = get_or_404(db, collection_id)
    if collection.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your collection")

    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    updated = collection_repo.add_item(db, collection, item)
    return format_collection_dto(updated)


def remove_item(db: Session, collection_id: int, item_id: int, user_id: int) -> dict:
    collection = get_or_404(db, collection_id)
    if collection.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your collection")

    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    updated = collection_repo.remove_item(db, collection, item)
    return format_collection_dto(updated)


def delete(db: Session, collection_id: int, user_id: int) -> None:
    collection = get_or_404(db, collection_id)
    if collection.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your collection")
    collection_repo.delete(db, collection)

