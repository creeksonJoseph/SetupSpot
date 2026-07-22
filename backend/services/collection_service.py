"""Collection service — business rules for collections.

Knows about: transactions.collection_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.collection import Collection
from transactions import collection_repo


def list_for_user(db: Session, user_id: int) -> list[Collection]:
    return collection_repo.get_by_user(db, user_id)


def get_or_404(db: Session, collection_id: int) -> Collection:
    collection = collection_repo.get_by_id(db, collection_id)
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return collection


def create(db: Session, name: str, user_id: int) -> Collection:
    return collection_repo.create(db, name=name, user_id=user_id)


def rename(db: Session, collection_id: int, name: str, user_id: int) -> Collection:
    collection = get_or_404(db, collection_id)
    if collection.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your collection")
    return collection_repo.update_name(db, collection, name)


def delete(db: Session, collection_id: int, user_id: int) -> None:
    collection = get_or_404(db, collection_id)
    if collection.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your collection")
    collection_repo.delete(db, collection)
