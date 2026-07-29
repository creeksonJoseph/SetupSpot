from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.auth import ChangePasswordRequest
from api.schemas.user import UserOut, UpdateProfileRequest
from core.database import get_db
from models.user import User
from services import auth_service, user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return user_service.get_user_profile(current_user)


@router.patch("/me", response_model=UserOut)
def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return user_service.update_user_profile(
            db=db,
            user=current_user,
            username=body.username,
            bio=body.bio,
            avatar_url=body.avatar_url,
        )
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))




@router.patch("/me/password", status_code=200)
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_service.change_password(db, current_user, otp=body.otp, new_password=body.new_password)
    return {"message": "Password changed successfully"}
