"""Feedback service layer with email notification dispatch."""
import logging
from sqlalchemy.orm import Session
from models.user import User
from transactions import feedback_repo

ADMIN_EMAIL = "charanajoseph@gmail.com"
logger = logging.getLogger("setupspot.feedback")


def send_feedback_email(user_email: str, username: str, message: str, category: str):
    """Simulate or dispatch SMTP email to charanajoseph@gmail.com."""
    logger.info(
        f"[FEEDBACK EMAIL DISPATCH TO {ADMIN_EMAIL}]\n"
        f"From: {username} ({user_email})\n"
        f"Category: {category}\n"
        f"Message:\n{message}\n"
        f"------------------------------------------------"
    )
    # Print clean formatted notification in server logs
    print(f"\n==================================================")
    print(f"📧 NEW FEATURE SUGGESTION FOR ADMIN ({ADMIN_EMAIL})")
    print(f"From: {username} <{user_email}>")
    print(f"Category: {category}")
    print(f"Message: {message}")
    print(f"==================================================\n")


def submit_feedback(db: Session, current_user: User, message: str, category: str = "feature_suggestion"):
    item = feedback_repo.create_feedback(
        db, user_id=current_user.id, message=message, category=category
    )
    send_feedback_email(
        user_email=current_user.email,
        username=current_user.username,
        message=message,
        category=category,
    )
    return item


def list_feedback_for_admin(db: Session, current_user: User):
    from services.admin_service import is_admin_user
    if not is_admin_user(current_user):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")
    return feedback_repo.list_all_feedback(db)
