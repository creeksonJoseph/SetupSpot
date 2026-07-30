"""Feedback database operations."""
from sqlalchemy.orm import Session
from models.feedback import Feedback
from models.user import User


def create_feedback(db: Session, user_id: int, message: str, category: str = "feature_suggestion") -> Feedback:
    item = Feedback(user_id=user_id, message=message, category=category)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_all_feedback(db: Session) -> list:
    results = (
        db.query(Feedback, User)
        .join(User, Feedback.user_id == User.id)
        .order_by(Feedback.id.desc())
        .all()
    )
    list_out = []
    for fb, u in results:
        list_out.append({
            "id": fb.id,
            "user_id": fb.user_id,
            "username": u.username,
            "user_email": u.email,
            "message": fb.message,
            "category": fb.category,
            "status": fb.status,
            "created_at": fb.created_at,
        })
    return list_out
