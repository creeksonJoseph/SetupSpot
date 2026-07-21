"""Collections router — one endpoint per HTTP method."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.collection import CollectionCreateRequest, CollectionOut, CollectionUpdateRequest
from core.database import get_db
from models.user import User
from services import collection_service

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("", response_model=list[CollectionOut])
def list_collections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return collection_service.list_for_user(db, current_user.id)


@router.post("", response_model=CollectionOut, status_code=201)
def create_collection(
    body: CollectionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return collection_service.create(db, name=body.name, user_id=current_user.id)


@router.get("/{collection_id}", response_model=CollectionOut)
def get_collection(collection_id: int, db: Session = Depends(get_db)):
    return collection_service.get_or_404(db, collection_id)


@router.put("/{collection_id}", response_model=CollectionOut)
def update_collection(
    collection_id: int,
    body: CollectionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return collection_service.rename(db, collection_id=collection_id, name=body.name, user_id=current_user.id)


@router.delete("/{collection_id}", status_code=200)
def delete_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    collection_service.delete(db, collection_id=collection_id, user_id=current_user.id)
    return {"message": "Collection deleted"}
