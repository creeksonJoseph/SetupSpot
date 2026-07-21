"""Auth service — password hashing and token issuance.

Knows about: passlib, core.security, transactions.user_repo
Does NOT know about: HTTP, FastAPI, request objects.
"""
from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from core.security import create_access_token
from models.user import User
from transactions import user_repo

_pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def register(db: Session, email: str, username: str, password: str) -> dict:
    """Create a new user and return an access token."""
    if user_repo.get_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    hashed = hash_password(password)
    user = user_repo.create(db, email=email, username=username, password_hash=hashed)
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "username": user.username}


def login(db: Session, email: str, password: str) -> dict:
    """Verify credentials and return an access token."""
    user = user_repo.get_by_email(db, email)
    if not user or not verify_password(password, user._password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "username": user.username}


def get_current_user(db: Session, user_id: int) -> User:
    """Resolve a user_id from a JWT to a User row."""
    user = user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
