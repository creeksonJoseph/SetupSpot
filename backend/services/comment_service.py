"""Comment service — business rules for setup comments.

Knows about: transactions.comment_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.comment import Comment
from transactions import comment_repo


def list_for_setup(db: Session, setup_id: int, current_user_id: int | None = None) -> list[dict]:
    """Return all comments for a setup as serializable dicts."""
    comments = comment_repo.get_by_setup(db, setup_id)
    comment_ids = [c.id for c in comments]
    liked_set = set()
    if current_user_id and comment_ids:
        liked_set = comment_repo.get_user_liked_comment_ids(db, current_user_id, comment_ids)

    return [_serialize(c, is_liked=(c.id in liked_set)) for c in comments]


def add(db: Session, user_id: int, setup_id: int, body: str, parent_id: int | None = None) -> dict:
    """Create a new comment or reply and return it serialized."""
    body = body.strip()
    if not body:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Comment body cannot be empty.",
        )

    if parent_id is not None:
        parent_comment = comment_repo.get_by_id(db, parent_id)
        if not parent_comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found")
        if parent_comment.setup_id != setup_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent comment belongs to a different setup")

    comment = comment_repo.create(db, user_id=user_id, setup_id=setup_id, body=body, parent_id=parent_id)

    # Invalidate setup detail cache so comment_count updates
    from core import redis_client
    redis_client.invalidate_setup_detail(setup_id)

    return _serialize(comment, is_liked=False)


def toggle_like(db: Session, user_id: int, comment_id: int) -> dict:
    """Toggle like on a comment."""
    comment = comment_repo.get_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    existing = comment_repo.get_comment_like(db, user_id, comment_id)
    if existing:
        comment_repo.unlike_comment(db, user_id, comment_id)
        is_liked = False
    else:
        comment_repo.like_comment(db, user_id, comment_id)
        is_liked = True

    db.refresh(comment)
    like_count = len(comment.likes)
    return {"id": comment_id, "is_liked": is_liked, "like_count": like_count}


def delete(db: Session, user_id: int, comment_id: int) -> None:
    """Delete a comment if it belongs to the requesting user."""
    comment = comment_repo.get_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your comment")

    setup_id = comment.setup_id
    comment_repo.delete(db, comment)

    # Invalidate setup detail cache so comment_count updates
    from core import redis_client
    redis_client.invalidate_setup_detail(setup_id)


def _serialize(comment: Comment, is_liked: bool = False) -> dict:
    like_count = len(comment.likes) if comment.likes is not None else 0
    reply_count = len(comment.replies) if comment.replies is not None else 0
    return {
        "id": comment.id,
        "body": comment.body,
        "author": comment.user.username,
        "author_avatar": comment.user.avatar_url,
        "parent_id": comment.parent_id,
        "like_count": like_count,
        "is_liked": is_liked,
        "reply_count": reply_count,
        "created_at": comment.created_at,
    }
