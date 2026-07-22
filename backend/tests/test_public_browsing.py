import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("CLOUDINARY_CLOUD_NAME", "test")
os.environ.setdefault("CLOUDINARY_API_KEY", "test")
os.environ.setdefault("CLOUDINARY_API_SECRET", "test")
os.environ.setdefault("CLOUDINARY_UPLOAD_PRESET", "SetupSpot")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("RESEND_API_KEY", "test")

from main import app
import api.routers.setups as setups_router


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(setups_router, "get_db", lambda: object())

    def fake_list_setups_for_user(db, requesting_user_id):
        return [
            {
                "id": 1,
                "title": "Demo setup",
                "image": "https://example.com/setup.jpg",
                "author": "@demo",
                "isFavorited": False,
            }
        ]

    monkeypatch.setattr("services.setup_service.list_setups_for_user", fake_list_setups_for_user)
    return TestClient(app)


def test_list_setups_is_public_without_auth(client):
    response = client.get("/setups")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["isFavorited"] is False
