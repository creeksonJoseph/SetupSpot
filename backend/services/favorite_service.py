"""Favorite service — business rules for favorites.

Knows about: transactions.favorite_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.favorite import Favorite
from transactions import favorite_repo


def list_for_user(db: Session, user_id: int) -> list[Favorite]:
    return favorite_repo.get_by_user(db, user_id)


def add(db: Session, user_id: int, setup_id: int) -> dict:
    existing = favorite_repo.get_by_user_and_setup(db, user_id, setup_id)
    if existing:
        return {
            "id": existing.id,
            "user_id": existing.user_id,
            "setup_id": existing.setup_id,
            "already_favorited": True,
        }
    created = favorite_repo.create(db, user_id=user_id, setup_id=setup_id)
    return {
        "id": created.id,
        "user_id": created.user_id,
        "setup_id": created.setup_id,
        "already_favorited": False,
    }



def remove(db: Session, user_id: int, setup_id: int) -> None:
    favorite = favorite_repo.get_by_user_and_setup(db, user_id, setup_id)
    if favorite:
        favorite_repo.delete(db, favorite)



def list_favorited_setups(db: Session, user_id: int) -> list[dict]:
    """Return full setup dicts for all of a user's favorited setups."""
    favorites = favorite_repo.get_by_user(db, user_id)
    return [
        {
            "id": fav.setup.id,
            "title": fav.setup.name,
            "image": fav.setup.image_url,
            "author": f"@{fav.setup.user.username}",
        }
        for fav in favorites
    ]
