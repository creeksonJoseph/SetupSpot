"""Comment repository — all comment-related DB operations."""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.comment import Comment


def get_by_setup(db: Session, setup_id: int) -> list[Comment]:
    return (
        db.query(Comment)
        .filter(Comment.setup_id == setup_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


def count_by_setup(db: Session, setup_id: int) -> int:
    return db.query(Comment).filter(Comment.setup_id == setup_id).count()


def get_by_id(db: Session, comment_id: int) -> Comment | None:
    return db.query(Comment).filter(Comment.id == comment_id).first()


def create(db: Session, user_id: int, setup_id: int, body: str) -> Comment:
    comment = Comment(
        user_id=user_id,
        setup_id=setup_id,
        body=body,
        created_at=datetime.now(timezone.utc),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def delete(db: Session, comment: Comment) -> None:
    db.delete(comment)
    db.commit()
