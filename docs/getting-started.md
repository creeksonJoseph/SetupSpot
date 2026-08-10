# SetupSpot — Getting Started & Local Environment Setup

This guide provides step-by-step instructions for getting SetupSpot up and running locally from clone to a fully functional development environment.

---

## Prerequisites

Ensure you have the following installed on your local development machine:

- **Python**: `>= 3.13` ([python.org](https://python.org))
- **`uv` Package Manager**: Fast Python package installer ([astral.sh/uv](https://astral.sh/uv))
- **Node.js**: `>= 18.0.0` (LTS recommended)
- **npm**: `>= 9.0.0`
- **PostgreSQL**: PostgreSQL database instance (Neon DB recommended) with the `pgvector` extension enabled.

---

## Step-by-Step Installation

### 1. Clone Repository & Setup Backend

```bash
cd backend

# Create virtual environment and install backend dependencies using uv
uv sync
```

### 2. Configure Backend Environment Variables

Create `backend/.env` (based on `backend/core/config.py`):

```ini
# Database Connection (Neon / Postgres with pgvector extension)
DATABASE_URL=postgresql://user:password@localhost:5432/setupspot

# Security & JWT Token Signing
SECRET_KEY=change_this_to_a_secure_random_string_in_dev
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:5173

# Cloudinary (Image Uploads & Early Upload CDN)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=SetupSpot

# Upstash Redis (Feed Caching, Rate Limiting, OTP Tokens)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Algolia Search Engine
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_WRITE_API_KEY=your_algolia_write_api_key
ALGOLIA_INDEX_NAME=setups

# Resend Email Service (Signup OTP & Password Resets)
RESEND_API_KEY=re_your_resend_api_key

# Google OAuth / One Tap (Optional for local dev)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Setup Frontend Environment Variables

```bash
cd ../frontend

# Install Node dependencies
npm install
```

Create `frontend/.env`:

```ini
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_ALGOLIA_APP_ID=your_algolia_app_id
VITE_ALGOLIA_SEARCH_KEY=your_algolia_public_search_key
VITE_ALGOLIA_INDEX_NAME=setups
```

---

## External Sandbox & Credentials Setup Guide

### 1. Database (PostgreSQL + `pgvector`)
1. Create a free PostgreSQL instance on [Neon.tech](https://neon.tech).
2. Execute SQL query to enable `pgvector`: `CREATE EXTENSION IF NOT EXISTS vector;`.
3. Copy the database connection string into `DATABASE_URL`.

### 2. Cloudinary (Image Hosting)
1. Sign up for a free account at [Cloudinary.com](https://cloudinary.com).
2. Copy **Cloud Name**, **API Key**, and **API Secret** from Dashboard into `CLOUDINARY_*` env vars.
3. In Cloudinary Settings -> Upload -> Add upload preset named `SetupSpot` (Unsigned or Signed).

### 3. Upstash Redis (REST API Cache)
1. Create a Redis database at [Upstash.com](https://upstash.com).
2. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN** from the database details section.

### 4. Algolia Search Engine
1. Create an application on [Algolia.com](https://algolia.com).
2. Create an Index named `setups`.
3. Copy **Application ID** and **Admin API Key** into backend env `ALGOLIA_*`.
4. Copy **Search-Only API Key** into frontend env `VITE_ALGOLIA_SEARCH_KEY`.

### 5. Resend (Email Gateway)
1. Sign up at [Resend.com](https://resend.com).
2. Create an API key under API Keys tab.
3. Copy key into `RESEND_API_KEY`. (In dev mode without custom domain, Resend sends only to account owner email).

### 6. Google OAuth (One Tap / Google Identity Services)
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create OAuth 2.0 Client ID under Credentials.
3. Add Authorized JavaScript origins: `http://localhost:5173`.
4. Copy Client ID into `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID`.

---

## Running the Local Stack & Verification

### 1. Start Backend Dev Server

```bash
cd backend
uvicorn main:app --reload --port 5000
```

- Verify backend healthcheck: open [http://localhost:5000/health](http://localhost:5000/health) -> Should return `{"status": "ok"}`.
- Verify Swagger interactive docs: open [http://localhost:5000/docs](http://localhost:5000/docs).

### 2. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

- Access frontend app: open [http://localhost:5173](http://localhost:5173).
