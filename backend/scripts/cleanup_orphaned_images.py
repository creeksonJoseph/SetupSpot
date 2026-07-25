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
from sqlalchemy import Table, Column, String, MetaData

# Ensure backend root is on sys.path when invoked from root or GitHub Actions
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.cloudinary_client import init_cloudinary
from core.database import SessionLocal


def cleanup_orphaned_images():
    print("Starting Cloudinary orphaned image cleanup...")

    # 1. Initialize Cloudinary SDK
    init_cloudinary()

    # 2. Query Database using lightweight Table reflection (decoupled from ORM/pgvector models)
    db = SessionLocal()
    metadata = MetaData()
    setups_table = Table("setups", metadata, Column("image_url", String))
    items_table = Table("items", metadata, Column("image_url", String))
    users_table = Table("users", metadata, Column("avatar_url", String))

    try:
        active_setups = db.query(setups_table.c.image_url).all()
        active_items = db.query(items_table.c.image_url).all()
        active_users = db.query(users_table.c.avatar_url).all()

        active_urls = {
            url
            for sublist in (active_setups, active_items, active_users)
            for (url,) in sublist
            if url
        }
        print(f"Found {len(active_urls)} total active images/avatars in database.")
    finally:
        db.close()

    # 3. List all images in Cloudinary 'setupspot' folder using pagination cursor
    cloudinary_resources = []
    next_cursor = None

    try:
        while True:
            params = {
                "type": "upload",
                "prefix": "setupspot/",
                "max_results": 500,
            }
            if next_cursor:
                params["next_cursor"] = next_cursor

            res = cloudinary.api.resources(**params)
            resources = res.get("resources", [])
            cloudinary_resources.extend(resources)

            next_cursor = res.get("next_cursor")
            if not next_cursor:
                break

        print(f"Retrieved {len(cloudinary_resources)} total resources from Cloudinary 'setupspot/' folder.")
    except Exception as exc:
        print(f"Error fetching Cloudinary resources: {exc}")
        sys.exit(1)

    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)
    deleted_count = 0

    # 4. Check each Cloudinary resource safely
    for item in cloudinary_resources:
        public_id = item.get("public_id")
        secure_url = item.get("secure_url", "")
        url = item.get("url", "")
        created_at_str = item.get("created_at")

        if not public_id:
            continue

        # Parse creation time
        try:
            created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        except Exception:
            created_at = datetime.now(timezone.utc)

        # Safety check: active if exact URL match OR public_id contained in any DB image_url
        is_active = (
            (secure_url in active_urls)
            or (url in active_urls)
            or any(public_id in db_url for db_url in active_urls)
        )
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
