"""Favorite repository — all favorite-related DB operations."""
from sqlalchemy.orm import Session

from models.favorite import Favorite


def get_by_user(db: Session, user_id: int) -> list[Favorite]:
    return db.query(Favorite).filter(Favorite.user_id == user_id).all()


def get_by_user_and_setup(db: Session, user_id: int, setup_id: int) -> Favorite | None:
    return (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id, Favorite.setup_id == setup_id)
        .first()
    )


def create(db: Session, user_id: int, setup_id: int) -> Favorite:
    favorite = Favorite(user_id=user_id, setup_id=setup_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


def delete(db: Session, favorite: Favorite) -> None:
    db.delete(favorite)
    db.commit()
