"""Cloudinary SDK initialisation.

Import this module once at startup (done in main.py).
All uploads are performed via cloudinary.uploader — never import this file
to access the client object; just import cloudinary directly after this runs.
"""
import cloudinary

from core.config import settings


def init_cloudinary() -> None:
    """Configure the Cloudinary SDK with credentials from settings."""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
