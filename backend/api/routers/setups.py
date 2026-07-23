"""Setups router — one endpoint per HTTP method."""
import json

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.setup import SetupDetailOut, SetupListItemOut
from core.database import get_db
from models.user import User
from services import setup_service

router = APIRouter(prefix="/setups", tags=["setups"])


def get_optional_user(
    db: Session = Depends(get_db),
    token: str | None = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)),
) -> User | None:
    """Return the current user if a valid token is provided, else None."""
    if token is None:
        return None
    try:
        from api.dependencies import get_current_user_from_token
        return get_current_user_from_token(token, db)
    except Exception:
        return None


@router.get("", response_model=list[SetupListItemOut])
def list_setups(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """Return all setups. Authenticated users get their favourite flag; anonymous users get isFavorited=false."""
    user_id = current_user.id if current_user else None
    return setup_service.list_setups_for_user(db, user_id)


@router.get("/{setup_id}", response_model=SetupDetailOut)
def get_setup(setup_id: int, db: Session = Depends(get_db)):
    """Return a single setup with annotated items."""
    setup = setup_service.get_setup_detail(db, setup_id)
    return setup_service.serialize_setup_detail(setup)


@router.post("", response_model=SetupDetailOut, status_code=201)
def create_setup(
    file: UploadFile = File(...),
    data: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a setup image and create the setup with annotated items."""
    payload = json.loads(data)
    setup = setup_service.create_setup(
        db,
        file_obj=file.file,
        setup_name=payload.get("setup_name", ""),
        items_data=payload.get("items", []),
        user_id=current_user.id,
    )
    return setup_service.serialize_setup_detail(setup)


@router.delete("/{setup_id}", status_code=200)
def delete_setup(
    setup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a setup owned by the current user."""
    setup_service.delete_setup(db, setup_id=setup_id, user_id=current_user.id)
    return {"message": "Setup deleted"}
