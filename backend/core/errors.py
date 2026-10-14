"""Standardized error responses and exception handling for FastAPI."""
import http
import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import sentry_sdk
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)

# Map HTTP status codes to clean machine-readable error codes
STATUS_CODE_MAP: dict[int, str] = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    408: "REQUEST_TIMEOUT",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT",
}

SAFE_500_MESSAGE = "An unexpected server error occurred. Please try again in a moment."


class AppException(Exception):
    """Base domain exception with customizable status code and machine error code."""

    def __init__(
        self,
        message: str,
        status_code: int = 400,
        code: str | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code or STATUS_CODE_MAP.get(status_code, "CLIENT_ERROR")


def get_cors_headers(request: Request, allowed_origins: list[str] | None = None) -> dict[str, str]:
    """Generate CORS headers for exception responses."""
    origins = allowed_origins or [
        "https://setupspot.tech",
        "http://setupspot.tech",
        "https://www.setupspot.tech",
        "http://www.setupspot.tech",
        "https://api.setupspot.tech",
    ]
    request_origin = request.headers.get("origin", "")
    
    if request_origin and (
        request_origin in origins
        or request_origin.startswith("http://localhost:")
        or request_origin.startswith("http://127.0.0.1:")
    ):
        allow_origin = request_origin
    elif origins:
        allow_origin = origins[0]
    else:
        allow_origin = "*"

    return {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Credentials": "true",
    }


def register_exception_handlers(app: FastAPI, cors_origins: list[str] | None = None) -> None:
    """Register production exception handlers for 4xx client errors and 5xx crashes."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        cors = get_cors_headers(request, cors_origins)

        # 5xx Server Error handling (e.g. explicit raise HTTPException(500, ...))
        if exc.status_code >= 500:
            logger.error(
                "Explicit 5xx HTTP error [%s %s]: status=%d detail=%s",
                request.method,
                request.url.path,
                exc.status_code,
                exc.detail,
                exc_info=exc,
            )
            sentry_sdk.capture_exception(exc)
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "message": SAFE_500_MESSAGE,
                    "detail": SAFE_500_MESSAGE,
                    "code": STATUS_CODE_MAP.get(exc.status_code, "INTERNAL_SERVER_ERROR"),
                },
                headers=cors,
            )

        # 4xx Client Error handling (e.g. 400, 401, 403, 404, 409, 429)
        code = STATUS_CODE_MAP.get(
            exc.status_code,
            getattr(http.HTTPStatus(exc.status_code), "name", "CLIENT_ERROR"),
        )
        detail_msg = exc.detail if isinstance(exc.detail, str) else str(exc.detail or "Client error")
        logger.warning(
            "Client HTTP error [%s %s]: status=%d code=%s message=%s",
            request.method,
            request.url.path,
            exc.status_code,
            code,
            detail_msg,
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": detail_msg,
                "detail": detail_msg,
                "code": code,
            },
            headers=cors,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        cors = get_cors_headers(request, cors_origins)
        errors = exc.errors()

        if errors:
            parts = []
            for err in errors[:3]:
                loc = ".".join(str(p) for p in err.get("loc", []) if p != "body")
                msg = err.get("msg", "Invalid value")
                parts.append(f"{loc}: {msg}" if loc else msg)
            user_msg = f"Validation failed: {'; '.join(parts)}"
        else:
            user_msg = "Request validation failed"

        logger.warning(
            "Request validation failure [%s %s]: %s",
            request.method,
            request.url.path,
            user_msg,
        )

        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": user_msg,
                "detail": user_msg,
                "code": "VALIDATION_ERROR",
            },
            headers=cors,
        )

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        cors = get_cors_headers(request, cors_origins)

        if exc.status_code >= 500:
            logger.error(
                "Domain server error [%s %s]: status=%d code=%s message=%s",
                request.method,
                request.url.path,
                exc.status_code,
                exc.code,
                exc.message,
                exc_info=exc,
            )
            sentry_sdk.capture_exception(exc)
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "message": SAFE_500_MESSAGE,
                    "detail": SAFE_500_MESSAGE,
                    "code": STATUS_CODE_MAP.get(exc.status_code, "INTERNAL_SERVER_ERROR"),
                },
                headers=cors,
            )

        logger.warning(
            "Domain client error [%s %s]: status=%d code=%s message=%s",
            request.method,
            request.url.path,
            exc.status_code,
            exc.code,
            exc.message,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.message,
                "detail": exc.message,
                "code": exc.code,
            },
            headers=cors,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        cors = get_cors_headers(request, cors_origins)
        logger.error(
            "Unhandled server exception [%s %s]: %s",
            request.method,
            request.url.path,
            exc,
            exc_info=exc,
        )
        sentry_sdk.capture_exception(exc)

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": SAFE_500_MESSAGE,
                "detail": SAFE_500_MESSAGE,
                "code": "INTERNAL_SERVER_ERROR",
            },
            headers=cors,
        )
