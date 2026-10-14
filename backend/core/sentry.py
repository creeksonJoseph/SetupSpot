"""Sentry monitoring and telemetry initialization with intelligent filtering."""
import logging
from typing import Any

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from core.config import settings

logger = logging.getLogger(__name__)


def before_send(event: dict[str, Any], hint: dict[str, Any]) -> dict[str, Any] | None:
    """Filter out user-caused 4xx client errors from Sentry ingestion.
    
    Inspects hint['exc_info'] to identify client-side errors:
    - Starlette/FastAPI HTTPException with status_code < 500 (e.g. 400, 401, 403, 404, 409, 429)
    - FastAPI RequestValidationError (422 schema validation failures)
    - Custom domain exceptions carrying an HTTP status_code < 500
    
    Returns None to drop the event, suppressing false alerts for expected client errors.
    """
    if "exc_info" in hint and hint["exc_info"]:
        _, exc_value, _ = hint["exc_info"]

        # FastApi / Starlette HTTPExceptions with 4xx status codes
        if isinstance(exc_value, (HTTPException, StarletteHTTPException)):
            if getattr(exc_value, "status_code", 500) < 500:
                return None

        # FastAPI Pydantic schema validation failures (422)
        if isinstance(exc_value, RequestValidationError):
            return None

        # Any custom domain exceptions with status_code < 500
        status_code = getattr(exc_value, "status_code", None)
        if isinstance(status_code, int) and status_code < 500:
            return None

    return event


def init_sentry() -> bool:
    """Initialize Sentry SDK with tracing and profiling before FastAPI app creation.
    
    If SENTRY_DSN is unset or empty, Sentry remains inactive without disrupting local dev.
    """
    dsn = (settings.SENTRY_DSN or "").strip()
    if not dsn:
        logger.info("SENTRY_DSN is unset or empty. Sentry telemetry is inactive.")
        return False

    sentry_sdk.init(
        dsn=dsn,
        environment=getattr(settings, "ENVIRONMENT", "development"),
        send_default_pii=True,
        enable_logs=True,
        traces_sample_rate=1.0,
        profile_session_sample_rate=1.0,
        profile_lifecycle="trace",
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            StarletteIntegration(transaction_style="endpoint"),
        ],
        before_send=before_send,
    )
    logger.info("Sentry SDK initialized successfully (DSN configured, 4xx filtering enabled).")
    return True
