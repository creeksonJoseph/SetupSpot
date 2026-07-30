"""Admin database operations and pre-computed stats queries."""
from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.user import User
from models.setup import Setup
from models.comment import Comment
from models.collection import Collection
from models.feedback import Feedback


def get_dashboard_stats(db: Session) -> dict:
    """Pre-compute summary analytics on backend."""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_setups = db.query(func.count(Setup.id)).scalar() or 0
    total_comments = db.query(func.count(Comment.id)).scalar() or 0
    total_collections = db.query(func.count(Collection.id)).scalar() or 0
    total_feedback = db.query(func.count(Feedback.id)).scalar() or 0

    recent_users_count_7d = (
        db.query(func.count(User.id))
        .filter(User.created_at >= seven_days_ago)
        .scalar()
        or 0
    )
    recent_setups_count_7d = (
        db.query(func.count(Setup.id))
        .filter(Setup.created_at >= seven_days_ago)
        .scalar()
        or 0
    )


    return {
        "total_users": total_users,
        "total_setups": total_setups,
        "total_comments": total_comments,
        "total_collections": total_collections,
        "total_feedback": total_feedback,
        "recent_users_count_7d": recent_users_count_7d,
        "recent_setups_count_7d": recent_setups_count_7d,
    }



def list_users_with_stats(db: Session) -> list:
    """List all registered users with setup counts for admin dashboard."""
    users = db.query(User).order_by(User.id.desc()).all()
    result = []
    for u in users:
        setup_count = db.query(func.count(Setup.id)).filter(Setup.user_id == u.id).scalar() or 0
        result.append({
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "is_admin": u.is_admin or (u.email.lower() == "charanajoseph@gmail.com"),
            "setup_count": setup_count,
            "created_at": u.created_at,
        })
    return result


def toggle_user_admin_role(db: Session, target_user_id: int) -> User:
    """Toggle admin role for a user."""
    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        raise ValueError("User not found")
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return user
