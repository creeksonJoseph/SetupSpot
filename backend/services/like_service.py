"""Like service — toggle setup-level likes.

Knows about: transactions.like_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
from sqlalchemy.orm import Session

from transactions import like_repo


def toggle(db: Session, user_id: int, setup_id: int) -> dict:
    """Toggle a like for a setup. Returns {liked: bool, like_count: int}."""
    existing = like_repo.get_by_user_and_setup(db, user_id, setup_id)
    if existing:
        like_repo.delete(db, existing)
        liked = False
    else:
        like_repo.create(db, user_id=user_id, setup_id=setup_id)
        liked = True

    count = like_repo.count_by_setup(db, setup_id)
    return {"liked": liked, "like_count": count}


def get_state(db: Session, user_id: int | None, setup_id: int) -> dict:
    """Return like state and count for a setup."""
    count = like_repo.count_by_setup(db, setup_id)
    liked = False
    if user_id is not None:
        liked = like_repo.get_by_user_and_setup(db, user_id, setup_id) is not None
    return {"liked": liked, "like_count": count}
