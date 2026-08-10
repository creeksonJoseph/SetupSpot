"""Setups router — one endpoint per HTTP method."""
import json
from hashlib import md5

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, Query, Response, UploadFile
from sqlalchemy.orm import Session

from api.dependencies import get_current_user, get_optional_current_user
from api.schemas.setup import SetupDetailOut, SetupListItemOut, SetupUpdateIn
from core.config import settings
from core.database import get_db
from models.user import User
from services import setup_service

router = APIRouter(prefix="/setups", tags=["setups"])

def _etag_headers(response: Response, data: list | dict, public: bool, max_age: int, swr: int) -> None:
    """Attach Cache-Control and ETag headers to a response.

    ETag is a hash of the serialized payload. On repeat requests the client
    sends If-None-Match; FastAPI/Starlette will return 304 Not Modified if
    the ETag matches — zero body bytes sent over the wire.
    """
    payload_bytes = json.dumps(data, default=str).encode()
    etag = f'"{md5(payload_bytes).hexdigest()}"'
    response.headers["ETag"] = etag
    if public:
        response.headers["Cache-Control"] = f"public, max-age={max_age}, stale-while-revalidate={swr}"
    else:
        response.headers["Cache-Control"] = f"private, max-age={max_age}"


@router.get("", response_model=list[SetupListItemOut])
def list_setups(
    response: Response,
    cursor: int | None = Query(None, description="ID of the last seen setup for cursor-based pagination"),
    limit: int = Query(48, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    """Return setups, newest-first, with optional cursor pagination.

    Cursor pagination:
    - First page: omit `cursor`. Returns the `limit` newest setups.
    - Subsequent pages: pass `cursor=<id of last item in previous page>`.
      Returns the next `limit` setups older than that ID. O(log n) index
      seek regardless of how deep into the feed the user scrolls.

    Authenticated users get their isFavorited flag populated.
    """
    user_id = current_user.id if current_user else None
    data = setup_service.list_setups_for_user(db, user_id, cursor=cursor, limit=limit)

    is_public = user_id is None
    _etag_headers(response, data, public=is_public, max_age=60 if is_public else 30, swr=300)
    return data


@router.get("/{setup_id}", response_model=SetupDetailOut)
def get_setup(
    setup_id: int,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    """Return a single setup with annotated items and social counts."""
    setup = setup_service.get_setup_detail(db, setup_id)
    requesting_user_id = current_user.id if current_user else None
    data = setup_service.serialize_setup_detail(setup, requesting_user_id, db)

    is_public = requesting_user_id is None
    _etag_headers(response, data, public=is_public, max_age=300 if is_public else 60, swr=600)
    return data


@router.get("/{setup_id}/similar", response_model=list[SetupListItemOut])
def get_similar_setups(
    setup_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    """Return semantically similar setups computed via pgvector cosine similarity."""
    from services import recommendation_service

    requesting_user_id = current_user.id if current_user else None
    return recommendation_service.get_similar_setups(
        db, setup_id=setup_id, page=page, limit=limit, requesting_user_id=requesting_user_id
    )


@router.post("", response_model=SetupDetailOut, status_code=201)
def create_setup(
    background_tasks: BackgroundTasks,
    data: str = Form(...),
    file: UploadFile | None = File(None),
    image_url: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a setup with annotated items. Responds immediately after DB write.

    Post-response background tasks (fired after HTTP 201 is sent):
    - Algolia: index the new setup for search
    - pgvector: generate and store the embedding for similarity search

    Supports two image paths:
    - Early Upload (preferred): pass ``image_url`` (the Cloudinary URL returned
      by ``POST /api/early-upload``). The image is already hosted; no re-upload
      is performed.
    - Legacy: pass a raw ``file`` multipart field. The image is uploaded to
      Cloudinary during this request.
    """
    payload = json.loads(data)
    setup = setup_service.create_setup(
        db,
        setup_name=payload.get("setup_name", ""),
        items_data=payload.get("items", []),
        user_id=current_user.id,
        file_obj=file.file if file else None,
        pre_uploaded_url=image_url or None,
    )

    # Dispatch background tasks — these run after the 201 response is sent.
    background_tasks.add_task(
        setup_service.background_index_setup,
        setup_id=setup.id,
        db_url=settings.DATABASE_URL,
    )

    return setup_service.serialize_setup_detail(setup, requesting_user_id=current_user.id, db=db)


@router.put("/{setup_id}", response_model=SetupDetailOut)
def update_setup(
    setup_id: int,
    payload: SetupUpdateIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a setup's title and annotated items owned by the current user."""
    items_dicts = [item.model_dump() for item in payload.items]
    setup = setup_service.update_setup(
        db,
        setup_id=setup_id,
        user_id=current_user.id,
        setup_name=payload.setup_name,
        items_data=items_dicts,
    )

    # Re-index in Algolia and update pgvector embedding asynchronously
    background_tasks.add_task(
        setup_service.background_index_setup,
        setup_id=setup.id,
        db_url=settings.DATABASE_URL,
    )

    return setup_service.serialize_setup_detail(setup, requesting_user_id=current_user.id, db=db)


@router.delete("/{setup_id}", status_code=200)
def delete_setup(
    setup_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a setup owned by the current user. Algolia removal is async."""
    setup_service.delete_setup(db, setup_id=setup_id, user_id=current_user.id)

    # Remove from Algolia search index after the DB delete commits
    background_tasks.add_task(setup_service.background_delete_from_algolia, setup_id)

    return {"message": "Setup deleted"}
