"""Users router — current user profile."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.auth import ChangePasswordRequest
from api.schemas.user import UserOut, UserSetupOut
from core.database import get_db
from models.user import User
from services import auth_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        setups=[
            UserSetupOut(id=s.id, title=s.name, image=s.image_url)
            for s in current_user.setups
        ],
    )


@router.patch("/me/password", status_code=200)
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_service.change_password(db, current_user, otp=body.otp, new_password=body.new_password)
    return {"message": "Password changed successfully"}
