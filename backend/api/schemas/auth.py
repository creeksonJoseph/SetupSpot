"""Pydantic schemas for auth requests and responses."""
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr | None = None
    otp: str | None = None
    new_password: str
    token: str | None = None


class ChangePasswordRequest(BaseModel):
    otp: str
    new_password: str
