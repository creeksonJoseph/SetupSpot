"""
Orphaned Image Cleanup Script — removes temporary / orphaned images from Cloudinary
that are older than 24 hours and not associated with any setup post in the database.
"""
from datetime import datetime, timezone, timedelta
import os
import sys
import cloudinary
import cloudinary.api
import cloudinary.uploader

# Ensure backend root is on sys.path when invoked from root or GitHub Actions
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.cloudinary_client import init_cloudinary
from core.database import SessionLocal
from models.setup import Setup


def cleanup_orphaned_images():
    print("Starting Cloudinary orphaned image cleanup...")

    # 1. Initialize Cloudinary SDK
    init_cloudinary()

    # 2. Query Database for active setup image URLs
    db = SessionLocal()
    try:
        active_setups = db.query(Setup.image_url).all()
        active_urls = {s.image_url for s in active_setups if s.image_url}
        print(f"Found {len(active_urls)} active setup images in database.")
    finally:
        db.close()

    # 3. List images in Cloudinary 'setupspot' folder
    try:
        res = cloudinary.api.resources(
            type="upload",
            prefix="setupspot/",
            max_results=500,
        )
        cloudinary_resources = res.get("resources", [])
        print(f"Retrieved {len(cloudinary_resources)} resources from Cloudinary 'setupspot/' folder.")
    except Exception as exc:
        print(f"Error fetching Cloudinary resources: {exc}")
        sys.exit(1)

    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)
    deleted_count = 0

    # 4. Check each Cloudinary resource
    for item in cloudinary_resources:
        public_id = item.get("public_id")
        secure_url = item.get("secure_url")
        url = item.get("url")
        created_at_str = item.get("created_at")  # Format e.g., '2026-07-25T14:00:00Z'

        if not public_id:
            continue

        # Parse creation time
        try:
            created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        except Exception:
            created_at = datetime.now(timezone.utc)

        # Check if orphaned (not in DB) and older than 24 hours
        is_active = (secure_url in active_urls) or (url in active_urls)
        is_old_enough = created_at < cutoff_time

        if not is_active and is_old_enough:
            print(f"Deleting orphaned image: {public_id} (Created: {created_at_str})")
            try:
                cloudinary.uploader.destroy(public_id)
                deleted_count += 1
            except Exception as destroy_err:
                print(f"Failed to delete {public_id}: {destroy_err}")

    print(f"Cleanup complete. Total orphaned images deleted: {deleted_count}")


if __name__ == "__main__":
    cleanup_orphaned_images()
