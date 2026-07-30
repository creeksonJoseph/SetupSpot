"""Admin API Router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from api.schemas.admin import AdminDashboardStats, AdminUserOut
from core.database import get_db
from models.user import User
from services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=AdminDashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pre-computed admin dashboard metrics."""
    return admin_service.get_dashboard_summary(db, current_user)


@router.get("/users", response_model=list[AdminUserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all registered users with setup counts."""
    return admin_service.list_users(db, current_user)


@router.delete("/comments/{comment_id}", status_code=200)
def admin_delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin global comment deletion."""
    return admin_service.admin_delete_comment(db, comment_id, current_user)


@router.delete("/users/{user_id}", status_code=200)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin user deletion."""
    return admin_service.admin_delete_user(db, target_user_id=user_id, current_user=current_user)


@router.get("/setups", status_code=200)
def list_setups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all setups for admin portal."""
    return admin_service.list_setups(db, current_user)


@router.delete("/setups/{setup_id}", status_code=200)
def admin_delete_setup(
    setup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin setup deletion."""
    return admin_service.admin_delete_setup(db, setup_id=setup_id, current_user=current_user)


@router.get("/collections", status_code=200)
def list_collections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all collections for admin portal."""
    return admin_service.list_collections(db, current_user)


@router.delete("/collections/{collection_id}", status_code=200)
def admin_delete_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin collection deletion."""
    return admin_service.admin_delete_collection(db, collection_id=collection_id, current_user=current_user)

