"""Auth router — registration, login, and OTP-based password reset."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    SignupSendOtpRequest,
    SignupVerifyOtpRequest,
    SignupCompleteRequest,
    SignupTokenResponse,
    TokenResponse,
)
from core.database import get_db
from models.user import User
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, email=body.email, username=body.username, password=body.password)


@router.post("/signup/send-otp", status_code=200)
def signup_send_otp(body: SignupSendOtpRequest, db: Session = Depends(get_db)):
    auth_service.signup_send_otp(db, email=body.email)
    return {"message": "Verification code sent. Check your spam folder."}


@router.post("/signup/verify-otp", response_model=SignupTokenResponse, status_code=200)
def signup_verify_otp(body: SignupVerifyOtpRequest):
    signup_token = auth_service.signup_verify_otp(email=body.email, otp=body.otp)
    return {"signup_token": signup_token}


@router.post("/signup/complete", response_model=TokenResponse, status_code=201)
def signup_complete(body: SignupCompleteRequest, db: Session = Depends(get_db)):
    return auth_service.signup_complete(db, signup_token=body.signup_token, username=body.username, password=body.password)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, email=body.email, password=body.password)


@router.post("/google", response_model=TokenResponse)
def google_login(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    return auth_service.google_login(db, credential=body.credential)


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
