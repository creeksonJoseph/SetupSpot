"""Admin database operations and pre-computed stats queries."""
import time
from datetime import datetime, timedelta
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from models.user import User
from models.setup import Setup
from models.comment import Comment
from models.collection import Collection
from models.feedback import Feedback


def get_dashboard_stats(db: Session) -> dict:
    """Pre-compute summary analytics on backend."""
    start_time = time.perf_counter()

    # Dynamic DB Health Ping
    try:
        db.execute(text("SELECT 1")).scalar()
        db_status = "Connected & Healthy"
    except Exception:
        db_status = "Degraded"

    # Dynamic Admin Email
    admin_user = db.query(User).filter(User.is_admin == True).first()
    admin_email = admin_user.email if admin_user else "charanajoseph@gmail.com"

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

    recent_feedback = (
        db.query(Feedback)
        .order_by(Feedback.id.desc())
        .limit(5)
        .all()
    )
    feedback_dtos = [
        {
            "id": fb.id,
            "user_id": fb.user_id,
            "username": fb.user.username if fb.user else "Anonymous",
            "user_email": fb.user.email if fb.user else "unknown",
            "category": fb.category,
            "message": fb.message,
            "status": fb.status or "pending",
            "created_at": fb.created_at.isoformat() if fb.created_at else None,
        }
        for fb in recent_feedback
    ]

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "db_status": db_status,
        "admin_email": admin_email,
        "latency_ms": f"{elapsed_ms} ms",
        "total_users": total_users,
        "total_setups": total_setups,
        "total_comments": total_comments,
        "total_collections": total_collections,
        "total_feedback": total_feedback,
        "recent_users_count_7d": recent_users_count_7d,
        "recent_setups_count_7d": recent_setups_count_7d,
        "recent_feedback": feedback_dtos,
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


from sqlalchemy.orm import Session, joinedload, selectinload


def list_all_setups(db: Session) -> list:
    """List all setups for admin portal ultra-fast with joinedload."""
    setups = (
        db.query(Setup)
        .options(joinedload(Setup.user), selectinload(Setup.items))
        .order_by(Setup.id.desc())
        .all()
    )
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
    """List all collections for admin portal ultra-fast with joinedload."""
    collections = (
        db.query(Collection)
        .options(joinedload(Collection.user), selectinload(Collection.items))
        .order_by(Collection.id.desc())
        .all()
    )
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
    """Delete a user and 100% cascade cleanup all associated records."""
    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        return False

    from models.favorite import Favorite
    from models.like import Like
    from models.item import Item
    from models.feedback import Feedback

    # 1. Delete feedback submissions
    db.query(Feedback).filter(Feedback.user_id == target_user_id).delete(synchronize_session=False)

    # 2. Delete user's favorites & likes on any setup
    db.query(Favorite).filter(Favorite.user_id == target_user_id).delete(synchronize_session=False)
    db.query(Like).filter(Like.user_id == target_user_id).delete(synchronize_session=False)

    # 3. Delete user's comments on any setup
    db.query(Comment).filter(Comment.user_id == target_user_id).delete(synchronize_session=False)

    # 4. Delete user's setups (triggers cascade delete-orphan on setup items, comments, likes, favorites)
    user_setups = db.query(Setup).filter(Setup.user_id == target_user_id).all()
    for s in user_setups:
        db.delete(s)

    # 5. Delete user's collections (triggers cascade delete on collection items)
    user_collections = db.query(Collection).filter(Collection.user_id == target_user_id).all()
    for c in user_collections:
        db.delete(c)

    # 6. Delete standalone user items
    db.query(Item).filter(Item.user_id == target_user_id).delete(synchronize_session=False)

    # 7. Delete user account record
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


def bulk_delete_users(db: Session, user_ids: list[int]) -> int:
    """Bulk delete users by ID list."""
    count = 0
    for uid in user_ids:
        if delete_user(db, uid):
            count += 1
    return count


def bulk_delete_setups(db: Session, setup_ids: list[int]) -> int:
    """Bulk delete setups by ID list."""
    count = 0
    for sid in setup_ids:
        if delete_setup(db, sid):
            count += 1
    return count


def bulk_delete_collections(db: Session, collection_ids: list[int]) -> int:
    """Bulk delete collections by ID list."""
    count = 0
    for cid in collection_ids:
        if delete_collection(db, cid):
            count += 1
    return count


