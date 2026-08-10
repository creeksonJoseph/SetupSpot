# Integration: Algolia Search Engine

Algolia provides instant full-text search across all desk setup posts and tagged gear items on SetupSpot.

---

## 🔌 Connection & Client Wiring

- **Backend Sync Client**: [`backend/core/algolia_client.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/algolia_client.py)
  - Uses `algoliasearch.search.client.SearchClientSync` (v4 SDK).
  - Configured via `get_client()`.
- **Backend Service Logic**: [`backend/services/algolia_service.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/services/algolia_service.py)
  - `index_setup(setup)`: Indexes/updates setup record in Algolia index `setups`.
  - `delete_setup(setup_id)`: Removes setup record from Algolia.
- **Frontend Search Client**: [`frontend/src/hooks/useSearch.js`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/hooks/useSearch.js)
  - Uses `algoliasearch` v5 JS SDK (`liteClient`).
  - Performs client-side instant search directly against Algolia API.

---

## 🔑 Environment Variables Required

| Variable Name | Description | Where Read |
| :--- | :--- | :--- |
| `ALGOLIA_APP_ID` | Algolia Application ID | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L18) |
| `ALGOLIA_WRITE_API_KEY` | Backend Admin Write API Key | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L19) |
| `ALGOLIA_INDEX_NAME` | Primary Index Name (default: `setups`) | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L20) |
| `VITE_ALGOLIA_APP_ID` | Frontend Application ID | [`useSearch.js`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/hooks/useSearch.js#L10) |
| `VITE_ALGOLIA_SEARCH_KEY` | Frontend Search-Only Public API Key | [`useSearch.js`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/hooks/useSearch.js#L11) |
| `VITE_ALGOLIA_INDEX_NAME` | Frontend Index Name | [`useSearch.js`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/hooks/useSearch.js#L12) |

---

## 🔄 Data Flow

1. **Indexing Path**:
   - When a setup is created or updated (`POST /setups` / `PUT /setups/{id}`), FastAPI schedules `background_index_setup` as a background task.
   - `algolia_service.index_setup(setup)` constructs search record payload containing `objectID`, `name`, `image_url`, `author`, `items`, and calls `client.save_object(...)`.
2. **Search Query Path**:
   - User types query in frontend Search page (`SearchPage.jsx`).
   - `useSearch` issues client-side query directly to `https://{ALGOLIA_APP_ID}-dsn.algolia.net`.
   - Returns matching setup cards instantly without touching backend server.

---

## 🛡️ Failure Behavior & Fallbacks

- **Indexing Errors**: Algolia calls in `setup_service.py` background tasks are wrapped in `try...except Exception`. If Algolia is offline or fails, the error is logged to console `[BG] Algolia indexing failed`, and database write remains successful.
- **Frontend Search Fallback**: If Algolia credentials are missing or query fails, `useSearch` returns empty results array `[]` and sets error status.

---

## 💡 Gotchas

- **Asynchronous Indexing**: Search index updates occur in background tasks *after* HTTP 201 response is sent. There may be a ~500ms delay before a newly posted setup appears in instant search results.
- **Public Key Security**: Frontend uses `VITE_ALGOLIA_SEARCH_KEY` (search-only key). Never expose `ALGOLIA_WRITE_API_KEY` in frontend code.
