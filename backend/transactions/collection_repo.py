"""Collection repository — all collection-related DB operations."""
from sqlalchemy.orm import Session, joinedload
from models.collection import Collection
from models.item import Item
from models.setup import Setup


def get_by_user(db: Session, user_id: int) -> list[Collection]:
    return (
        db.query(Collection)
        .options(
            joinedload(Collection.items)
            .joinedload(Item.setup)
            .joinedload(Setup.user)
        )
        .filter(Collection.user_id == user_id)
        .all()
    )


def get_by_id(db: Session, collection_id: int) -> Collection | None:
    return (
        db.query(Collection)
        .options(
            joinedload(Collection.items)
            .joinedload(Item.setup)
            .joinedload(Setup.user)
        )
        .filter(Collection.id == collection_id)
        .first()
    )


def create(db: Session, name: str, user_id: int) -> Collection:
    collection = Collection(name=name, user_id=user_id)
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


def update_name(db: Session, collection: Collection, name: str) -> Collection:
    collection.name = name
    db.commit()
    db.refresh(collection)
    return collection


def add_item(db: Session, collection: Collection, item: Item) -> Collection:
    if item not in collection.items:
        collection.items.append(item)
        db.commit()
        db.refresh(collection)
    return collection


def remove_item(db: Session, collection: Collection, item: Item) -> Collection:
    if item in collection.items:
        collection.items.remove(item)
        db.commit()
        db.refresh(collection)
    return collection


def delete(db: Session, collection: Collection) -> None:
    db.delete(collection)
    db.commit()

