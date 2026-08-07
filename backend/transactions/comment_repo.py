"""Comment repository — all comment-related DB operations."""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.comment import Comment
from models.comment_like import CommentLike


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


def create(db: Session, user_id: int, setup_id: int, body: str, parent_id: int | None = None) -> Comment:
    comment = Comment(
        user_id=user_id,
        setup_id=setup_id,
        body=body,
        parent_id=parent_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def delete(db: Session, comment: Comment) -> None:
    db.delete(comment)
    db.commit()


def get_comment_like(db: Session, user_id: int, comment_id: int) -> CommentLike | None:
    return (
        db.query(CommentLike)
        .filter(CommentLike.user_id == user_id, CommentLike.comment_id == comment_id)
        .first()
    )


def like_comment(db: Session, user_id: int, comment_id: int) -> CommentLike:
    existing = get_comment_like(db, user_id, comment_id)
    if existing:
        return existing

    like = CommentLike(user_id=user_id, comment_id=comment_id, created_at=datetime.now(timezone.utc))
    db.add(like)
    db.commit()
    db.refresh(like)
    return like


def unlike_comment(db: Session, user_id: int, comment_id: int) -> bool:
    existing = get_comment_like(db, user_id, comment_id)
    if not existing:
        return False

    db.delete(existing)
    db.commit()
    return True


def get_user_liked_comment_ids(db: Session, user_id: int, comment_ids: list[int]) -> set[int]:
    if not comment_ids:
        return set()
    likes = (
        db.query(CommentLike.comment_id)
        .filter(CommentLike.user_id == user_id, CommentLike.comment_id.in_(comment_ids))
        .all()
    )
    return {l[0] for l in likes}
