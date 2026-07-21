"""Users router — current user profile."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.user import UserOut, UserSetupOut
from core.database import get_db
from models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile and their setups."""
    return UserOut(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        setups=[
            UserSetupOut(id=s.id, title=s.name, image=s.image_url)
            for s in current_user.setups
        ],
    )
