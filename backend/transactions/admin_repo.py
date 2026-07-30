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


def list_all_setups(db: Session) -> list:
    """List all setups for admin portal."""
    setups = db.query(Setup).order_by(Setup.id.desc()).all()
    out = []
    for s in setups:
        out.append({
            "id": s.id,
            "name": s.name,
            "image_url": s.image_url,
            "author": s.user.username if s.user else "Unknown",
            "author_id": s.user_id,
            "item_count": len(s.items) if s.items else 0,
            "created_at": s.created_at,
        })
    return out


def list_all_collections(db: Session) -> list:
    """List all collections for admin portal."""
    collections = db.query(Collection).order_by(Collection.id.desc()).all()
    out = []
    for c in collections:
        out.append({
            "id": c.id,
            "name": c.name,
            "owner": c.user.username if c.user else "Unknown",
            "owner_id": c.user_id,
            "item_count": len(c.items) if c.items else 0,
            "created_at": c.created_at,
        })
    return out


def delete_user(db: Session, target_user_id: int) -> bool:
    """Delete a user and cascade cleanup associated records."""
    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        return False
    # Explicit cascade cleanup to prevent FK constraint issues
    from models.favorite import Favorite
    from models.like import Like
    from models.item import Item
    db.query(Favorite).filter(Favorite.user_id == target_user_id).delete(synchronize_session=False)
    db.query(Like).filter(Like.user_id == target_user_id).delete(synchronize_session=False)
    db.query(Comment).filter(Comment.user_id == target_user_id).delete(synchronize_session=False)
    db.query(Item).filter(Item.user_id == target_user_id).delete(synchronize_session=False)
    db.query(Collection).filter(Collection.user_id == target_user_id).delete(synchronize_session=False)
    db.query(Setup).filter(Setup.user_id == target_user_id).delete(synchronize_session=False)
    db.delete(user)
    db.commit()
    return True


def delete_setup(db: Session, setup_id: int) -> bool:
    """Delete a setup as admin."""
    setup = db.query(Setup).filter(Setup.id == setup_id).first()
    if not setup:
        return False
    db.delete(setup)
    db.commit()
    return True


def delete_collection(db: Session, collection_id: int) -> bool:
    """Delete a collection as admin."""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        return False
    db.delete(collection)
    db.commit()
    return True

