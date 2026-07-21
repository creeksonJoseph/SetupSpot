"""Favorites router — one endpoint per HTTP method."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.favorite import FavoriteOut, FavoriteRequest, FavoriteSetupOut
from core.database import get_db
from models.user import User
from services import favorite_service

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteOut])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all favorite records for the current user."""
    return favorite_service.list_for_user(db, current_user.id)


@router.get("/list", response_model=list[FavoriteSetupOut])
def list_favorited_setups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return full setup details for all of the current user's favorites."""
    return favorite_service.list_favorited_setups(db, current_user.id)


@router.post("", response_model=FavoriteOut, status_code=201)
def add_favorite(
    body: FavoriteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return favorite_service.add(db, user_id=current_user.id, setup_id=body.setup_id)


@router.delete("", status_code=200)
def remove_favorite(
    body: FavoriteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite_service.remove(db, user_id=current_user.id, setup_id=body.setup_id)
    return {"message": "Favorite deleted"}
