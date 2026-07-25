"""
Mobile Upload Service — orchestrates mobile image validation, session TTL verification,
Cloudinary upload, and real-time WebSocket notification to desktop.
"""
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status
from core.ws_manager import ws_manager


async def process_mobile_upload(file: UploadFile, session_id: str) -> dict:
    """
    Validates mobile upload file & session TTL (10 min max),
    saves image to Cloudinary, and notifies the waiting desktop client via WebSocket.
    """
    # 1. Enforce 10-minute Server-Side Session TTL
    if not ws_manager.is_session_valid(session_id, max_ttl_seconds=600):
        ws_manager.disconnect(session_id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="QR upload session has expired (10-minute limit). Please generate a new QR code on your desktop screen.",
        )

    # 2. File type validation
    if not file or not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File uploaded must be an image",
        )

    # 3. Save to Cloudinary
    try:
        upload_result = cloudinary.uploader.upload(file.file, folder="setupspot")
        image_url = upload_result.get("secure_url")
    except Exception as exc:
        print(f"Cloudinary upload error in mobile_upload_service: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image to cloud storage",
        ) from exc

    # 4. Push image URL to desktop WebSocket connection
    sent = await ws_manager.send_image_url(session_id, image_url)
    if not sent:
        print(f"Warning: Desktop WebSocket for session '{session_id}' was not connected or missed message.")

    return {
        "status": "ok",
        "message": "Photo uploaded successfully! Check your desktop screen.",
        "image_url": image_url,
    }
