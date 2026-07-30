"""Admin business logic service layer."""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from models.comment import Comment
from transactions import admin_repo

ADMIN_EMAIL = "charanajoseph@gmail.com"


def is_admin_user(user: User) -> bool:
    if not user:
        return False
    return bool(user.is_admin or (user.email and user.email.lower() == ADMIN_EMAIL.lower()))


def get_dashboard_summary(db: Session, current_user: User) -> dict:
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return admin_repo.get_dashboard_stats(db)


def list_users(db: Session, current_user: User) -> list:
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return admin_repo.list_users_with_stats(db)


def admin_delete_comment(db: Session, comment_id: int, current_user: User):
    """Admin override comment deletion."""
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted by admin"}
