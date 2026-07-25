"""Comment service — business rules for setup comments.

Knows about: transactions.comment_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.comment import Comment
from transactions import comment_repo


def list_for_setup(db: Session, setup_id: int) -> list[dict]:
    """Return all comments for a setup as serializable dicts."""
    comments = comment_repo.get_by_setup(db, setup_id)
    return [_serialize(c) for c in comments]


def add(db: Session, user_id: int, setup_id: int, body: str) -> dict:
    """Create a new comment and return it serialized."""
    body = body.strip()
    if not body:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Comment body cannot be empty.",
        )
    comment = comment_repo.create(db, user_id=user_id, setup_id=setup_id, body=body)
    return _serialize(comment)


def delete(db: Session, user_id: int, comment_id: int) -> None:
    """Delete a comment if it belongs to the requesting user."""
    comment = comment_repo.get_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your comment")
    comment_repo.delete(db, comment)


def _serialize(comment: Comment) -> dict:
    return {
        "id": comment.id,
        "body": comment.body,
        "author": comment.user.username,
        "author_avatar": comment.user.avatar_url,
        "created_at": comment.created_at,
    }
