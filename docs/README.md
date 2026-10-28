# SetupSpot Developer Documentation — v1.0.0 (First Version)

SetupSpot is a full-stack, Pinterest-style web platform for sharing workspace setups with interactive shoppable product hotspots on photos. The application features real-time phone camera photo uploads via WebSockets, AI-powered semantic similarity recommendations using vector embeddings, instant search indexing, and multi-layer caching for high-performance browsing.

> [!NOTE]
> **Release Version**: `v1.0.0` (First Version). This repository contains the complete full-stack implementation: the **FastAPI backend** (in `backend/`) and the **React Vite frontend** (in `frontend/`).

---

## Documentation Map

- [Getting Started](getting-started.md) — Set up the backend, frontend, and external services locally.
- [System Architecture](architecture.md) — Runtime architecture, module map, and request tracing.
- [Architecture Guidance](architecture-guidance.md) — Layer boundaries and implementation patterns.
- [Design System](design-system.md) — Visual tokens, layouts, and reusable component guidance.
- [Security Architecture](security.md) — Authentication, authorization, CORS, and rate limiting.

## Verified Technology Stack

| Component Layer | Technology | Primary Package / Version | Source File Reference |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | `react` `^19.1.1`, `vite` `^7.1.7` | [`frontend/package.json`](../frontend/package.json#L19-L33) |
| **Frontend Styling** | Vanilla CSS + Tailwind CSS v4 | `@tailwindcss/vite` `^4.1.17` | [`frontend/package.json`](../frontend/package.json#L14-L22) |
| **Backend Framework** | FastAPI | `fastapi` `>=0.115.0`, `uvicorn` `>=0.32.0` | [`backend/pyproject.toml`](../backend/pyproject.toml#L8-L9) |
| **Python Environment** | Python 3.13 + `uv` | `requires-python = ">=3.13"` | [`backend/pyproject.toml`](../backend/pyproject.toml#L6) |
| **Database & ORM** | PostgreSQL + SQLAlchemy 2 | `psycopg2-binary`, `sqlalchemy` `>=2.0.36` | [`backend/core/database.py`](../backend/core/database.py#L1-L25) |
| **Vector Search** | `pgvector` + FastEmbed | `pgvector` `>=0.5.0`, `fastembed` `>=0.8.0` | [`backend/services/recommendation_service.py`](../backend/services/recommendation_service.py#L8-L22) |
| **Caching Layer** | Upstash Redis (REST API) | `upstash-redis` `>=1.7.0` | [`backend/core/redis_client.py`](../backend/core/redis_client.py#L1-L30) |
| **Image Management** | Cloudinary API | `cloudinary` `>=1.42.0` | [`backend/core/cloudinary_client.py`](../backend/core/cloudinary_client.py#L1-L15) |
| **Search Engine** | Algolia Search | `algoliasearch` `>=4.44.4` (Py) / `^5.56.0` (JS) | [`backend/services/algolia_service.py`](../backend/services/algolia_service.py#L1-L20) |
| **Transactional Email** | Resend API | `resend` `>=2.34.0` | [`backend/core/email.py`](../backend/core/email.py#L1-L25) |
| **Authentication** | JWT Cookies + Google OAuth | `python-jose`, `argon2-cffi`, `bcrypt` | [`backend/core/security.py`](../backend/core/security.py#L1-L35) |

---

## Suggested Reading Order for New Developers

1. [**Getting Started**](getting-started.md) — Local prerequisites, environment variables configuration, external sandbox setup, and running backend/frontend dev servers.
2. [**Architecture & Design Patterns**](architecture.md) — System architecture diagram, module map, layered request tracing, caching strategies, and background worker queues.
3. [**Security Architecture**](security.md) — Authentication flows (Password, Email OTP, Google OAuth), token handling, HTTP-only cookie lifecycle, CORS, rate-limiting, and code audit findings.
4. [**Error Handling & Sentry Monitoring**](error-handling.md) — Production error handling pipeline, 4xx vs 5xx separation, Sentry crash ingestion & APM profiling, and verification via `/api/sentry-debug`.
5. **Third-Party Service Integrations**:
   - [Sentry Error Monitoring](error-handling.md) — Error reporting, performance profiling, and alert suppression.
   - [Upstash Redis Integration](integrations/redis-upstash.md) — Feed caching, sliding-window rate limits, and token revocation blocklists.
   - [Google OAuth Integration](integrations/google-oauth.md) — Google One Tap (GSI) authentication & ID token validation.
   - [Cloudinary Image Service](integrations/cloudinary.md) — Image hosting, early photo uploads, and CDN delivery.
   - [Algolia Search Engine](integrations/algolia.md) — Instant client-side search & background indexing.
   - [Resend Email Gateway](integrations/resend.md) — OTP email delivery for signup & password reset.
   - [FastEmbed & pgvector Embeddings](integrations/fastembed-pgvector.md) — AI vector similarity search for desk setups.
