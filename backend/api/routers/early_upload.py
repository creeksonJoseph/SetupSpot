"""
Early Upload Router — accepts an image upload from the Create Setup form the instant
the user selects a file (before they fill in any details or click Submit).

Uploads to Cloudinary's 'setupspot/' folder so the existing orphan-cleanup cron job
(`scripts/cleanup_orphaned_images.py`) can automatically delete any images that were
never associated with a submitted post.

Kept intentionally separate from `mobile_upload.py` so the two paths can evolve
independently without risking regressions in each other.
"""
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from api.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/api", tags=["early-upload"])


@router.post("/early-upload", status_code=200)
async def handle_early_upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Early-upload endpoint. Called the moment a user selects an image on the
    Create Setup page — before they have filled in any post details.

    Returns a hosted Cloudinary URL that the frontend persists to localStorage
    as part of the draft state. The 'setupspot/' folder prefix ensures the
    weekly orphan-cleanup cron picks up any images whose posts were never submitted.
    """
    # 1. Validate file type
    if not file or not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image.",
        )

    # 2. Upload to Cloudinary — same folder the orphan-cleanup cron scans
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="setupspot",
            resource_type="image",
        )
        image_url = result["secure_url"]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Image upload failed: {exc}",
        ) from exc

    return {"image_url": image_url}
