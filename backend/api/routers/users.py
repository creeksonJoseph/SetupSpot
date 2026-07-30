from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.auth import ChangePasswordRequest
from api.schemas.user import UserOut, UpdateProfileRequest, PublicUserOut
from core.database import get_db
from models.user import User
from services import auth_service, user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return user_service.get_user_profile(current_user)


@router.get("/{username}", response_model=PublicUserOut)
def get_public_profile(username: str, db: Session = Depends(get_db)):
    """Public profile endpoint — returns posts and collections, no email or favorites."""
    profile = user_service.get_public_profile(db, username)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile



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
