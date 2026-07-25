"""Likes router — setup-level like toggle."""
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.like import LikeRequest, LikeToggleOut
from core.database import get_db
from models.user import User
from services import like_service

router = APIRouter(prefix="/likes", tags=["likes"])


@router.post("", response_model=LikeToggleOut)
def toggle_like(
    body: LikeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle a like on a setup. Returns new like state and count."""
    return like_service.toggle(db, user_id=current_user.id, setup_id=body.setup_id)
