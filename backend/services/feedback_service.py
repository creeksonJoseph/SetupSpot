"""Feedback service layer with email notification dispatch."""
import logging
from sqlalchemy.orm import Session
from models.user import User
from models.feedback import Feedback
from transactions import feedback_repo


ADMIN_EMAIL = "charanajoseph@gmail.com"
logger = logging.getLogger("setupspot.feedback")


def send_feedback_email(user_email: str, username: str, message: str, category: str):
    """Dispatch real Resend email notification to charanajoseph@gmail.com."""
    import resend
    from core.config import settings

    logger.info(
        f"[FEEDBACK EMAIL DISPATCH TO {ADMIN_EMAIL}]\n"
        f"From: {username} ({user_email})\n"
        f"Category: {category}\n"
        f"Message:\n{message}\n"
        f"------------------------------------------------"
    )

    if settings.RESEND_API_KEY:
        try:
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": "noreply@setupspot.tech",
                "to": ADMIN_EMAIL,
                "subject": f"💡 New SetupSpot Feedback from @{username}",
                "html": f"""
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #0F172A; max-width: 600px; border: 1px solid #E2E8F0; border-radius: 16px;">
                        <h2 style="color: #0066ff; margin-bottom: 4px;">New User Feedback</h2>
                        <p style="font-size: 13px; color: #64748B; margin-top: 0;">Sent directly from SetupSpot</p>
                        <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 16px 0;" />
                        <p style="font-size: 14px;"><strong>From:</strong> @{username} (<code>{user_email}</code>)</p>
                        <p style="font-size: 14px;"><strong>Category:</strong> <span style="background-color: #EFF6FF; color: #1E40AF; padding: 4px 10px; border-radius: 8px; font-weight: bold; font-size: 12px;">{category.replace('_', ' ').title()}</span></p>
                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px; font-size: 14px; line-height: 1.6; margin-top: 12px; color: #334155;">
                            "{message}"
                        </div>
                        <p style="margin-top: 20px; font-size: 13px; color: #64748B;">
                            Reply to user: <a href="mailto:{user_email}" style="color: #0066ff; font-weight: bold; text-decoration: none;">{user_email}</a>
                        </p>
                    </div>
                """,
            })
            logger.info(f"[FEEDBACK EMAIL SENT VIA RESEND TO {ADMIN_EMAIL}]")
        except Exception as err:
            logger.error(f"[FEEDBACK EMAIL FAILED TO SEND VIA RESEND] error={err}")



def format_feedback_out(item: Feedback, user: User) -> dict:
    return {
        "id": item.id,
        "user_id": item.user_id,
        "username": user.username,
        "user_email": user.email,
        "message": item.message,
        "category": item.category,
        "status": item.status,
        "created_at": item.created_at,
    }


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
    return format_feedback_out(item, current_user)


def list_feedback_for_admin(db: Session, current_user: User):
    from services.admin_service import is_admin_user
    if not is_admin_user(current_user):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")
    return feedback_repo.list_all_feedback(db)

