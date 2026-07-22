"""Collection repository — all collection-related DB operations."""
from sqlalchemy.orm import Session

from models.collection import Collection


def get_by_user(db: Session, user_id: int) -> list[Collection]:
    return db.query(Collection).filter(Collection.user_id == user_id).all()


def get_all(db: Session) -> list[Collection]:
    return db.query(Collection).all()


def get_by_id(db: Session, collection_id: int) -> Collection | None:
    return db.query(Collection).filter(Collection.id == collection_id).first()


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


def delete(db: Session, collection: Collection) -> None:
    db.delete(collection)
    db.commit()
