import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException

from core.errors import AppException, register_exception_handlers
from core.sentry import before_send, init_sentry


class SamplePayload(BaseModel):
    name: str
    age: int


@pytest.fixture
def test_app():
    """Create an isolated test FastAPI application with registered exception handlers."""
    app = FastAPI(title="TestApp")
    register_exception_handlers(app, cors_origins=["https://setupspot.tech"])

    @app.get("/test-404")
    def route_404():
        raise HTTPException(status_code=404, detail="Resource not found")

    @app.get("/test-400")
    def route_400():
        raise HTTPException(status_code=400, detail="Invalid parameter provided")

    @app.get("/test-403")
    def route_403():
        raise HTTPException(status_code=403, detail="Forbidden action")

    @app.get("/test-409")
    def route_409():
        raise HTTPException(status_code=409, detail="Resource conflict")

    @app.post("/test-422")
    def route_422(payload: SamplePayload):
        return {"status": "ok", "data": payload.model_dump()}

    @app.get("/test-domain-400")
    def route_domain_400():
        raise AppException("Domain rule violation", status_code=400, code="DOMAIN_ERROR")

    @app.get("/api/sentry-debug")
    def route_sentry_debug():
        _ = 1 / 0
        return {"status": "ok"}

    @app.get("/test-explicit-500")
    def route_explicit_500():
        raise HTTPException(status_code=500, detail="Database connection timed out")

    return app


@pytest.fixture
def client(test_app):
    return TestClient(test_app, raise_server_exceptions=False)


# ── 1. Verification of 4xx Client Error Handling & Clean JSON ─────────────────

def test_404_returns_standard_json_without_sentry_capture(client):
    with patch("sentry_sdk.capture_exception") as mock_capture:
        response = client.get("/test-404")
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["code"] == "NOT_FOUND"
        assert data["message"] == "Resource not found"
        assert data["detail"] == "Resource not found"
        mock_capture.assert_not_called()


def test_400_returns_standard_json_without_sentry_capture(client):
    with patch("sentry_sdk.capture_exception") as mock_capture:
        response = client.get("/test-400")
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert data["code"] == "BAD_REQUEST"
        assert data["message"] == "Invalid parameter provided"
        assert data["detail"] == "Invalid parameter provided"
        mock_capture.assert_not_called()


def test_422_returns_standard_json_without_sentry_capture(client):
    with patch("sentry_sdk.capture_exception") as mock_capture:
        # Send empty body to route expecting name and age
        response = client.post("/test-422", json={})
        assert response.status_code == 422
        data = response.json()
        assert data["success"] is False
        assert data["code"] == "VALIDATION_ERROR"
        assert "Validation failed" in data["message"]
        assert "Validation failed" in data["detail"]
        mock_capture.assert_not_called()


def test_custom_domain_app_exception_4xx(client):
    with patch("sentry_sdk.capture_exception") as mock_capture:
        response = client.get("/test-domain-400")
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert data["code"] == "DOMAIN_ERROR"
        assert data["message"] == "Domain rule violation"
        assert data["detail"] == "Domain rule violation"
        mock_capture.assert_not_called()


# ── 2. Verification of 5xx Unhandled & Explicit Server Errors ──────────────────

def test_500_sentry_debug_triggers_sentry_and_returns_safe_json(client):
    with patch("sentry_sdk.capture_exception") as mock_capture:
        response = client.get("/api/sentry-debug")
        assert response.status_code == 500
        data = response.json()
        assert data["success"] is False
        assert data["code"] == "INTERNAL_SERVER_ERROR"
        assert data["message"] == "An unexpected server error occurred. Please try again in a moment."
        assert data["detail"] == "An unexpected server error occurred. Please try again in a moment."
        # Ensure internal ZeroDivisionError traceback is never leaked in JSON
        assert "ZeroDivisionError" not in response.text
        assert "division by zero" not in response.text
        # Verify Sentry captured the exception
        mock_capture.assert_called_once()
        args, _ = mock_capture.call_args
        assert isinstance(args[0], ZeroDivisionError)


def test_500_explicit_http_exception_triggers_sentry_and_hides_internals(client):
    with patch("sentry_sdk.capture_exception") as mock_capture:
        response = client.get("/test-explicit-500")
        assert response.status_code == 500
        data = response.json()
        assert data["success"] is False
        assert data["code"] == "INTERNAL_SERVER_ERROR"
        assert data["message"] == "An unexpected server error occurred. Please try again in a moment."
        # Ensure raw sensitive detail is hidden from client response
        assert "Database connection timed out" not in response.text
        mock_capture.assert_called_once()


# ── 3. Verification of before_send Sentry Filtering Hook ─────────────────────

def test_before_send_suppresses_4xx_http_exceptions():
    dummy_event = {"event_id": "test_event"}
    
    # 404 HTTPException
    hint_404 = {"exc_info": (HTTPException, HTTPException(status_code=404, detail="Not Found"), None)}
    assert before_send(dummy_event, hint_404) is None

    # 400 StarletteHTTPException
    hint_400 = {"exc_info": (StarletteHTTPException, StarletteHTTPException(status_code=400, detail="Bad Request"), None)}
    assert before_send(dummy_event, hint_400) is None

    # 403 HTTPException
    hint_403 = {"exc_info": (HTTPException, HTTPException(status_code=403, detail="Forbidden"), None)}
    assert before_send(dummy_event, hint_403) is None


def test_before_send_suppresses_request_validation_errors():
    dummy_event = {"event_id": "test_event"}
    val_err = RequestValidationError(errors=[{"loc": ("body", "field"), "msg": "Field required", "type": "missing"}])
    hint_val = {"exc_info": (RequestValidationError, val_err, None)}
    assert before_send(dummy_event, hint_val) is None


def test_before_send_suppresses_custom_4xx_domain_exceptions():
    dummy_event = {"event_id": "test_event"}
    app_err = AppException("Conflict", status_code=409, code="CONFLICT")
    hint_app = {"exc_info": (AppException, app_err, None)}
    assert before_send(dummy_event, hint_app) is None


def test_before_send_allows_500_and_system_crashes():
    dummy_event = {"event_id": "test_event"}

    # ZeroDivisionError
    hint_crash = {"exc_info": (ZeroDivisionError, ZeroDivisionError("division by zero"), None)}
    assert before_send(dummy_event, hint_crash) == dummy_event

    # Explicit 500 HTTPException
    hint_500 = {"exc_info": (HTTPException, HTTPException(status_code=500, detail="Internal Error"), None)}
    assert before_send(dummy_event, hint_500) == dummy_event


# ── 4. Verification of Sentry Initialization Flow ────────────────────────────

def test_init_sentry_inactive_when_dsn_unset(monkeypatch):
    monkeypatch.setattr("core.config.settings.SENTRY_DSN", None)
    assert init_sentry() is False


def test_init_sentry_inactive_when_dsn_empty(monkeypatch):
    monkeypatch.setattr("core.config.settings.SENTRY_DSN", "")
    assert init_sentry() is False


def test_init_sentry_initializes_with_correct_parameters(monkeypatch):
    test_dsn = "https://public@sentry.example.com/12345"
    monkeypatch.setattr("core.config.settings.SENTRY_DSN", test_dsn)
    monkeypatch.setattr("core.config.settings.ENVIRONMENT", "production")

    with patch("sentry_sdk.init") as mock_init:
        result = init_sentry()
        assert result is True
        mock_init.assert_called_once()
        _, kwargs = mock_init.call_args

        assert kwargs["dsn"] == test_dsn
        assert kwargs["send_default_pii"] is True
        assert kwargs["enable_logs"] is True
        assert kwargs["traces_sample_rate"] == 1.0
        assert kwargs["profile_session_sample_rate"] == 1.0
        assert kwargs["profile_lifecycle"] == "trace"
        assert kwargs["before_send"] == before_send
        assert len(kwargs["integrations"]) == 2


# ── 5. Integration Test Against Real FastAPI App Instance (main.app) ──────────

def test_real_main_app_sentry_debug_route():
    from main import app as real_app
    test_client = TestClient(real_app, raise_server_exceptions=False)
    with patch("sentry_sdk.capture_exception") as mock_capture:
        res = test_client.get("/api/sentry-debug")
        assert res.status_code == 500
        data = res.json()
        assert data["success"] is False
        assert data["code"] == "INTERNAL_SERVER_ERROR"
        assert data["message"] == "An unexpected server error occurred. Please try again in a moment."
        assert data["detail"] == "An unexpected server error occurred. Please try again in a moment."
        mock_capture.assert_called_once()
        args, _ = mock_capture.call_args
        assert isinstance(args[0], ZeroDivisionError)


def test_real_main_app_404_route():
    from main import app as real_app
    test_client = TestClient(real_app, raise_server_exceptions=False)
    with patch("sentry_sdk.capture_exception") as mock_capture:
        res = test_client.get("/api/non-existent-endpoint-xyz-123")
        assert res.status_code == 404
        data = res.json()
        assert data["success"] is False
        assert data["code"] == "NOT_FOUND"
        mock_capture.assert_not_called()

