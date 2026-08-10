# ==============================================================================
# SetupSpot Backend Dockerfile
# Multi-stage build leveraging uv for fast, reliable, reproducible builds
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM python:3.13-slim AS builder

# Install uv binary from official Astral image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Enable bytecode compilation for faster app startup
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Copy project configuration files first to optimize Docker layer caching
COPY pyproject.toml uv.lock ./

# Install project dependencies without installing the project source itself
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

# Copy application source code
COPY . /app

# Finalize uv environment sync
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# ------------------------------------------------------------------------------
# Stage 2: Final Runtime Image
# ------------------------------------------------------------------------------
FROM python:3.13-slim AS runner

WORKDIR /app

# Production environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

# Create a non-privileged system user and group
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/sh -m appuser

# Copy virtual environment and application code from builder stage
COPY --from=builder --chown=appuser:appgroup /app/.venv /app/.venv
COPY --from=builder --chown=appuser:appgroup /app /app

# Switch to non-root user
USER appuser

# Expose backend port
EXPOSE 5000

# Health check targeting FastAPI /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

# Production command using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--proxy-headers", "--forwarded-allow-ips", "*"]
