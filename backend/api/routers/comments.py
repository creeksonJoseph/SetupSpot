"""Comments router — per-setup comments CRUD."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.comment import CommentIn, CommentOut
from core.database import get_db
from models.user import User
from services import comment_service

router = APIRouter(tags=["comments"])


@router.get("/setups/{setup_id}/comments", response_model=list[CommentOut])
def list_comments(setup_id: int, db: Session = Depends(get_db)):
    """List all comments for a setup (public)."""
    return comment_service.list_for_setup(db, setup_id)


@router.post("/setups/{setup_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    setup_id: int,
    body: CommentIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a comment to a setup (auth required)."""
    return comment_service.add(db, user_id=current_user.id, setup_id=setup_id, body=body.body)


@router.delete("/comments/{comment_id}", status_code=200)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete your own comment (auth required)."""
    comment_service.delete(db, user_id=current_user.id, comment_id=comment_id)
    return {"message": "Comment deleted"}
