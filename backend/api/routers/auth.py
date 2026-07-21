"""Auth router — registration and login only."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from core.database import get_db
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, email=body.email, username=body.username, password=body.password)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, email=body.email, password=body.password)
