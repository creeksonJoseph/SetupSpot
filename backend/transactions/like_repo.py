"""Like repository — all like-related DB operations."""
from sqlalchemy.orm import Session

from models.like import Like


def get_by_user_and_setup(db: Session, user_id: int, setup_id: int) -> Like | None:
    return (
        db.query(Like)
        .filter(Like.user_id == user_id, Like.setup_id == setup_id)
        .first()
    )


def count_by_setup(db: Session, setup_id: int) -> int:
    return db.query(Like).filter(Like.setup_id == setup_id).count()


def create(db: Session, user_id: int, setup_id: int) -> Like:
    like = Like(user_id=user_id, setup_id=setup_id)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like


def delete(db: Session, like: Like) -> None:
    db.delete(like)
    db.commit()
