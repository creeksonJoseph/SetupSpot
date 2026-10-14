# SetupSpot Backend API

FastAPI backend powering the SetupSpot desk-setup sharing platform.

## Features
- **FastAPI + Python 3.13 (`uv`)**
- **Production Error Handling & Sentry Monitoring**: See [Error Handling Documentation](../docs/error-handling.md)
- **Database**: PostgreSQL with `pgvector` & SQLAlchemy 2
- **Vector Search**: Semantic desk similarity recommendations using FastEmbed & pgvector
- **Search & Discovery**: Algolia instant search integration
- **Caching**: Multi-layer caching with Upstash Redis (REST API)
- **Media**: Cloudinary integration for image uploads and CDN delivery
- **Auth**: JWT cookies, password hashing, Email OTP (Resend), and Google One-Tap OAuth

---

## Getting Started

### 1. Install Dependencies
Using `uv`:
```bash
uv sync
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
Key Sentry variables:
```bash
SENTRY_DSN=https://450f2ab183fcbd70222b4d82ac5d59a2@o4512254075535360.ingest.de.sentry.io/4512254344822864
ENVIRONMENT=development
```

### 3. Run Development Server
```bash
uv run uvicorn main:app --reload --port 8000
```

### 4. Run Test Suite
```bash
uv run pytest -v
```

---

## Error Handling & Sentry Verification

- **Documentation**: Detailed guide at [`docs/error-handling.md`](../docs/error-handling.md)
- **Verification Endpoint**: `GET /api/sentry-debug` triggers a simulated division-by-zero error to verify that Sentry captures the exception and generates an issue in your Sentry dashboard while returning a safe sanitized 500 JSON payload to the user.
