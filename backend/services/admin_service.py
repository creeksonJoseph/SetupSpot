"""Admin business logic service layer."""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from models.comment import Comment
from transactions import admin_repo

ADMIN_EMAIL = "charanajoseph@gmail.com"


def is_admin_user(user: User) -> bool:
    if not user:
        return False
    return bool(user.is_admin or (user.email and user.email.lower() == ADMIN_EMAIL.lower()))


def get_dashboard_summary(db: Session, current_user: User) -> dict:
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return admin_repo.get_dashboard_stats(db)


def list_users(db: Session, current_user: User) -> list:
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return admin_repo.list_users_with_stats(db)


def admin_delete_comment(db: Session, comment_id: int, current_user: User):
    """Admin override comment deletion."""
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted by admin"}


def admin_delete_user(db: Session, target_user_id: int, current_user: User):
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    if current_user.id == target_user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin user account")

    # Collect setup IDs BEFORE the DB delete so we can purge Algolia after
    from models.setup import Setup
    setup_ids = [
        row[0]
        for row in db.query(Setup.id).filter(Setup.user_id == target_user_id).all()
    ]

    success = admin_repo.delete_user(db, target_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")

    # Remove all the user's setups + their own user record from Algolia
    from services import algolia_service
    from core import redis_client
    for sid in setup_ids:
        algolia_service.delete_setup(sid)
        redis_client.invalidate_setup_detail(sid)
    # Delete the user's own Algolia user record (objectID = "user_<id>")
    try:
        from core.algolia_client import get_client
        from core.config import settings
        get_client().delete_object(
            index_name=settings.ALGOLIA_INDEX_NAME,
            object_id=f"user_{target_user_id}",
        )
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error("Algolia: failed to delete user record %s — %s", target_user_id, exc)
    redis_client.invalidate_explore_setups()

    return {"message": "User deleted by admin"}


def list_setups(db: Session, current_user: User):
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return admin_repo.list_all_setups(db)


def admin_delete_setup(db: Session, setup_id: int, current_user: User):
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    success = admin_repo.delete_setup(db, setup_id)
    if not success:
        raise HTTPException(status_code=404, detail="Setup not found")

    # Sync with Algolia search index & Redis cache
    from services import algolia_service
    from core import redis_client
    algolia_service.delete_setup(setup_id)
    redis_client.invalidate_explore_setups()
    redis_client.invalidate_setup_detail(setup_id)

    return {"message": "Setup deleted by admin"}


def list_collections(db: Session, current_user: User):
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return admin_repo.list_all_collections(db)


def admin_delete_collection(db: Session, collection_id: int, current_user: User):
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    success = admin_repo.delete_collection(db, collection_id)
    if not success:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"message": "Collection deleted by admin"}


def admin_bulk_delete_users(db: Session, user_ids: list[int], current_user: User):
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    # Protect self from deletion
    clean_ids = [uid for uid in user_ids if uid != current_user.id]

    # Collect all setup IDs for these users BEFORE deletion
    from models.setup import Setup
    all_setup_ids = [
        row[0]
        for row in db.query(Setup.id).filter(Setup.user_id.in_(clean_ids)).all()
    ]

    count = admin_repo.bulk_delete_users(db, clean_ids)

    from services import algolia_service
    from core import redis_client
    from core.algolia_client import get_client
    from core.config import settings
    import logging
    _log = logging.getLogger(__name__)

    # Purge all deleted setups from Algolia
    for sid in all_setup_ids:
        algolia_service.delete_setup(sid)
        redis_client.invalidate_setup_detail(sid)

    # Purge the user records from Algolia
    for uid in clean_ids:
        try:
            get_client().delete_object(
                index_name=settings.ALGOLIA_INDEX_NAME,
                object_id=f"user_{uid}",
            )
        except Exception as exc:
            _log.error("Algolia: failed to delete user record %s — %s", uid, exc)

    redis_client.invalidate_explore_setups()
    return {"message": f"Successfully deleted {count} users"}


def admin_bulk_delete_setups(db: Session, setup_ids: list[int], current_user: User):
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    count = admin_repo.bulk_delete_setups(db, setup_ids)

    from services import algolia_service
    from core import redis_client
    for sid in setup_ids:
        algolia_service.delete_setup(sid)
        redis_client.invalidate_setup_detail(sid)
    redis_client.invalidate_explore_setups()

    return {"message": f"Successfully deleted {count} setups"}


def admin_bulk_delete_collections(db: Session, collection_ids: list[int], current_user: User):
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    count = admin_repo.bulk_delete_collections(db, collection_ids)
    return {"message": f"Successfully deleted {count} collections"}


