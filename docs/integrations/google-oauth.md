# Integration: Google OAuth / Identity Services (GSI)

Google Identity Services (GSI / One Tap) allows users to log in or register for SetupSpot using their Google Account with one click.

---

## 🔌 Connection & Client Wiring

- **Frontend Wiring**: [`frontend/src/components/GoogleAuthButton.jsx`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/components/GoogleAuthButton.jsx)
  - Loads Google GSI script dynamically from `https://accounts.google.com/gsi/client`.
  - Initializes `window.google.accounts.id.initialize({ client_id, callback })`.
  - Renders Google Sign-In button and returns Google ID token (`credential`).
- **Backend Wiring**: [`backend/api/routers/auth.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/api/routers/auth.py#L59) -> [`backend/services/auth_service.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/services/auth_service.py#L204)
  - Receives `credential` via `POST /auth/google`.
  - Validates token against Google's `https://oauth2.googleapis.com/tokeninfo?id_token={credential}` endpoint via Python `urllib.request`.

---

## 🔑 Environment Variables Required

| Variable Name | Description | Where Read |
| :--- | :--- | :--- |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth Client ID | [`GoogleAuthButton.jsx`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/components/GoogleAuthButton.jsx#L12) |
| `GOOGLE_CLIENT_ID` | Backend Google OAuth Client ID validation | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L15) |
| `GOOGLE_CLIENT_SECRET` | Backend Google Client Secret | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L16) |

---

## 🔄 Data Flow

1. User clicks Google Sign-In button on Frontend.
2. Google GSI library issues an ID token JWT (`credential`).
3. Frontend sends `POST /auth/google` with `{ "credential": "<token>" }`.
4. Backend sends GET request to Google `tokeninfo` endpoint.
5. Google returns user metadata (`email`, `name`, `sub`).
6. Backend checks if User exists in DB. If not, auto-registers user with dummy password hash (`google-oauth-{email}`).
7. Backend signs SetupSpot JWT token and sets `access_token` HTTP-only cookie.

---

## 🛡️ Failure Behavior & Fallbacks

- **Script Blocked / Failed Load**: If Google GSI script fails to load (e.g. ad-blocker), `GoogleAuthButton` renders an error message and falls back to standard Email/Password inputs.
- **Invalid Credential**: If Google `tokeninfo` returns non-200 or missing email, backend raises `HTTP 401 Unauthorized`.

---

## 💡 Gotchas

- **Authorized Origins**: Google OAuth requires exact match in Google Cloud Console Credentials under *Authorized JavaScript origins* (`http://localhost:5173` for dev, `https://setupspot.tech` for prod).
- **Federated Passwords**: Auto-created Google users receive a synthetic password hash (`google-oauth-{email}`). If they later attempt standard password login, they must use the Forgot Password OTP flow to set an explicit password.
