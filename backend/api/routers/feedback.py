"""Feedback API Router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.admin import FeedbackCreate, FeedbackOut
from core.database import get_db
from models.user import User
from services import feedback_service

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackOut, status_code=201)
def submit_feature_suggestion(
    body: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a feature suggestion or feedback."""
    return feedback_service.submit_feedback(
        db, current_user=current_user, message=body.message, category=body.category
    )


@router.get("", response_model=list[FeedbackOut])
def list_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all submitted feature suggestions for admin dashboard."""
    return feedback_service.list_feedback_for_admin(db, current_user)
