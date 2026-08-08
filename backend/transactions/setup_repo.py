"""Setup repository — all setup-related DB operations.

N+1 fix: all query functions that need related data use joinedload /
selectinload so SQLAlchemy fetches related rows in bulk (one extra query
per relationship) instead of one query per row.

Before: list_setups called s.user.username inside a loop → N+1 queries
After:  joinedload(Setup.user) → single JOIN, always 1 query total
"""
import json

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload

from models.setup import Setup


def get_page(db: Session, cursor: int | None = None, limit: int = 48) -> list[Setup]:
    """Return `limit` setups newest-first, optionally starting after `cursor` (setup ID).

    Cursor pagination pattern:
      - cursor=None  → first page: newest `limit` setups
      - cursor=<id>  → next page: setups with id < cursor, newest-first

    Uses the ix_setups_created_at index for O(log n) seek regardless of depth.
    Unlike OFFSET, performance does not degrade as the user scrolls deeper.
    """
    q = (
        db.query(Setup)
        .options(
            joinedload(Setup.user),        # single JOIN — author names
            selectinload(Setup.likes),     # batch IN query for like state
            selectinload(Setup.favorites), # batch IN query for favorite state
        )
        .order_by(Setup.created_at.desc(), Setup.id.desc())
    )
    if cursor is not None:
        # Seek past the last seen row using a keyset/cursor condition.
        # This relies on the ix_setups_created_at index for an O(log n) seek.
        q = q.filter(Setup.id < cursor)
    return q.limit(limit).all()


def get_all(db: Session) -> list[Setup]:
    """Return all setups newest-first, eagerly loading related data.

    One query with a JOIN on users + two IN-batch queries for items and likes.
    Previously this caused N+1 queries (one extra SELECT per setup for username).
    """
    return (
        db.query(Setup)
        .options(
            joinedload(Setup.user),          # single JOIN — avoids N author lookups
            selectinload(Setup.items),       # one batch IN query for all items
            selectinload(Setup.likes),       # one batch IN query for like counts
            selectinload(Setup.favorites),   # one batch IN query for favorite checks
            selectinload(Setup.comments),    # one batch IN query for comment counts
        )
        .order_by(Setup.created_at.desc())
        .all()
    )


def get_by_id(db: Session, setup_id: int) -> Setup | None:
    """Return a single setup with all related data eagerly loaded."""
    return (
        db.query(Setup)
        .options(
            joinedload(Setup.user),
            selectinload(Setup.items),
            selectinload(Setup.likes),
            selectinload(Setup.favorites),
            selectinload(Setup.comments),
        )
        .filter(Setup.id == setup_id)
        .first()
    )


def get_by_user(db: Session, user_id: int) -> list[Setup]:
    """Return all setups by a user, newest first."""
    return (
        db.query(Setup)
        .options(
            joinedload(Setup.user),
            selectinload(Setup.likes),
            selectinload(Setup.favorites),
        )
        .filter(Setup.user_id == user_id)
        .order_by(Setup.created_at.desc())
        .all()
    )


def count_likes(db: Session, setup_id: int) -> int:
    """Return like count via a scalar subquery — avoids loading all Like rows."""
    from models.like import Like
    return db.query(func.count(Like.id)).filter(Like.setup_id == setup_id).scalar() or 0


def count_comments(db: Session, setup_id: int) -> int:
    """Return comment count via a scalar subquery."""
    from models.comment import Comment
    return db.query(func.count(Comment.id)).filter(Comment.setup_id == setup_id).scalar() or 0


def create(db: Session, name: str, image_url: str, user_id: int) -> Setup:
    setup = Setup(name=name, image_url=image_url, user_id=user_id)
    db.add(setup)
    db.commit()
    db.refresh(setup)
    return setup


def update_annotations(db: Session, setup: Setup, annotation_metadata: list) -> Setup:
    setup.annotations = json.dumps(annotation_metadata)
    db.commit()
    db.refresh(setup)
    return setup


def delete(db: Session, setup: Setup) -> None:
    db.delete(setup)
    db.commit()
