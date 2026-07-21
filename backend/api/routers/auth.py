"""Auth router — registration, login, and OTP-based password reset."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from core.database import get_db
from models.user import User
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, email=body.email, username=body.username, password=body.password)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, email=body.email, password=body.password)


@router.post("/forgot-password", status_code=200)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service.request_password_reset(db, email=body.email)
    return {"message": "If that email exists, a 6-digit code has been sent. Check your spam folder."}


@router.post("/reset-password", status_code=200)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service.reset_password(
        db,
        email=body.email,
        otp=body.otp,
        new_password=body.new_password,
        token=body.token,
    )
    return {"message": "Password updated successfully"}


@router.post("/send-change-otp", status_code=200)
def send_change_otp(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service.send_change_password_otp(db, current_user)
    return {"message": "Verification code sent to your email. Check your spam folder."}
