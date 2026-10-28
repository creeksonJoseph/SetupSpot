# SetupSpot — Architecture & AI Guidance Document

> **Notice for Future LLMs & Developers**: This document details the core architectural principles, layer boundaries, and key design decisions of SetupSpot. **You MUST adhere strictly to these patterns when modifying or adding features.**

---

## 1. Core Architectural Philosophy

SetupSpot follows a strict separation of concerns on both the backend and frontend:

1. **Backend**: **Layered Architecture (Router → Service → Repository/Transaction → Model)**. Each layer has a single responsibility. Modifying one layer must never break another.
2. **Frontend**: **Custom Hook Abstraction Pattern (Page/Component UI ↔ Custom Hook State)**. Pages and components are pure, presentational UI layers. All state, data fetching, business logic, and side-effects MUST be encapsulated inside dedicated custom hooks.

---

## 2. Backend Architecture (Layered Approach)

```
[ HTTP Request ]
       │
       ▼
┌──────────────┐  - HTTP parsing, route endpoints, query/body validation
│ Router Layer │  - NO business logic, NO direct SQL queries
└──────┬───────┘
       │
       ▼
┌──────────────┐  - Business rules, validation, orchestrations
│ Service Layer│  - NO FastAPI request objects or HTTP status codes
└──────┬───────┘
       │
       ▼
┌──────────────┐  - Raw database operations, CRUD transactions, queries
│ Repo Layer   │  - Interacts directly with SQLAlchemy models
└──────┬───────┘
       │
       ▼
┌──────────────┐  - SQLAlchemy ORM mappings & schema definitions
│ Model Layer  │
└──────────────┘
```

### Layer Rules & Boundaries

#### A. Routers (`backend/api/routers/`)
- **Role**: Define FastAPI endpoint routes, handle HTTP request/response payloads, parse path/query parameters, and return JSON responses or HTTP status errors.
- **Rule**: Never execute direct SQL queries or complex business logic inside a router endpoint. Route handlers should delegate immediately to a service function.
- **Example**: `backend/api/routers/setups.py`, `backend/api/routers/early_upload.py`.

#### B. Services (`backend/services/`)
- **Role**: Contain core business logic, parameter processing, validation checks, Cloudinary uploads, and service-level orchestration.
- **Rule**: Services accept standard Python types or domain models. They MUST NOT depend on FastAPI `Request` objects or route dependencies, ensuring they remain reusable in background CLI scripts or unit tests.
- **Example**: `backend/services/setup_service.py`, `backend/services/mobile_upload_service.py`.

#### C. Repositories / Transactions (`backend/transactions/`)
- **Role**: Direct database interaction layer (SQLAlchemy `Session` operations). Contains functions for querying, creating, updating, or deleting records.
- **Rule**: Repositories must remain purely focused on database persistence and retrieval.
- **Example**: `backend/transactions/setup_repo.py`, `backend/transactions/like_repo.py`, `backend/transactions/favorite_repo.py`.

#### D. Models (`backend/models/`)
- **Role**: Database ORM model definitions (User, Setup, Item, Favorite, Like, Comment, Collection).
- **Example**: `backend/models/setup.py`, `backend/models/user.py`.

---

## 3. Frontend Architecture (Hook-Driven UI)

```
┌─────────────────────────────────────────────────────────┐
│                    Pages & Components                   │
│   (e.g., FavouritesPage.jsx, ExplorePage.jsx, Create)   │
│  - Pure presentational JSX & Tailwind styling           │
│  - Receives state & handlers from custom hooks           │
└────────────────────────────┬────────────────────────────┘
                             │ Consumes hook
                             ▼
┌─────────────────────────────────────────────────────────┐
│                       Custom Hooks                      │
│   (e.g., useFavorites.js, useSetups.js, useAccount.js)   │
│  - Encapsulates useState, useEffect, API calls          │
│  - Manages localStorage hydration, WebSocket, & state   │
└─────────────────────────────────────────────────────────┘
```

### Layer Rules & Boundaries

#### A. Presentational Components & Pages (`frontend/src/Pages/`, `frontend/src/components/`)
- **Role**: Render UI markup, manage layout, apply Tailwind CSS styles, and trigger handler callbacks.
- **Rule**: NO `.jsx` file (neither Page nor Component) may contain inline `fetch()`, `authFetch()`, or `useEffect` API request handlers. All data fetching and business logic MUST be delegated to custom hooks in `frontend/src/hooks/`.

#### B. Custom Hooks (`frontend/src/hooks/`)
- **Role**: Single source of truth for component logic. Handles data fetching (`useAuthFetch`), state management (`useState`), side-effects (`useEffect`), optimistic UI updates, local storage hydration, and WebSocket connections.
- **Rule**: Every page, sub-section, or component requiring asynchronous data has a corresponding hook (e.g., `useFavorites.js`, `useSimilarCollections.js`, `useCreateSetup.js`, `usePhoneUploadSocket.js`, `usePostDetail.js`).

#### C. Context Providers (`frontend/src/context/`)
- **Role**: Global app state that spans across routes (`AuthContext` for user session, `ToastContext` for global toast notifications).

---

## 4. Key Architectural Decisions & Design Patterns

### 1. Early Upload & Draft State Pattern
- **Problem**: Storing raw `File` objects or large Base64 strings in `localStorage` crashes browser storage or breaks object URLs on page refresh.
- **Solution**:
  - The moment an image is selected, it is immediately uploaded via `/api/early-upload` to Cloudinary.
  - The returned image URL is stored in lightweight `localStorage` draft state scoped per user (`setup_draft_{userId}`).
  - On page refresh, the draft state hydrates instantly with the Cloudinary image URL preserved.

### 2. Real-Time Phone Camera Upload (WebSockets + QR Code)
- **Architecture**:
  - **Desktop**: Initiates session (`/ws/upload/{session_id}`), generating a live QR code URL (`/mobile-upload?session={session_id}`).
  - **Mobile**: Scans QR code, opens upload view, sends photo payload.
  - **Backend**: `mobile_upload_service.py` receives photo, notifies desktop socket, and gracefully terminates the session connection.
- **UI State Safeguards**:
  - Stale QR code mask: Blurs dead QR codes immediately upon socket disconnection to prevent users from scanning expired sessions.
  - Contextual Reconnect: Provides a 60-second idle timer before switching to manual regenerate mode.
  - Mobile Catch: Expired sessions present clear guidance instructing mobile users to look back at their desktop screen for a fresh QR code.

### 3. Orphan Image Cleanup Strategy
- **Behavior**: Cloudinary image deletion is verified asynchronously against active SQL database records (`cleanup_orphaned_images.py`).
- **Rule**: Cleanup logic verifies URL existence in `setups.image_url`, `items.image_url`, or `users.avatar_url` before executing deletion, avoiding dependency on static folder naming or tags.

### 4. Unclipped Portal Modals for Card Components
- **Issue**: Standard dropdowns inside cards styled with `overflow-hidden` get clipped by card boundaries.
- **Solution**: Share menus and overlay modals (e.g., `ShareMenu.jsx`) render as `fixed` position overlays with backdrop blurs outside card `overflow-hidden` constraints, ensuring full visibility across all screen sizes and column heights.

### 5. Responsive CSS Multi-Column Masonry
- Explore and Favourites pages use Tailwind CSS multi-column rules (`columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4`) combined with `break-inside-avoid` on child cards to create native masonry layouts.

### 6. Compact UI Spacing & Ergonomic Viewport Fitting
- **Rule**: Avoid excessive, wasteful whitespace, oversized gaps, and unnecessary vertical padding (`py-12`, `mb-12`, over-spaced form fields).
- **Goal**: UI pages, form cards, and settings panels MUST be kept compact, ergonomic, and designed to fit comfortably within the viewport without forcing unnecessary vertical scrolling.

### 7. Component Abstraction for Multi-Tab & Complex Pages
- **Rule**: Pages (`frontend/src/Pages/`) MUST NOT contain long, inline JSX blocks for sub-views, forms, or tabs.
- **Solution**: Abstract sub-sections, tabs, and cards into dedicated presentation components placed in feature-specific directories under `frontend/src/components/<feature>/` (e.g. `components/settings/ProfileTab.jsx`, `components/settings/SecurityTab.jsx`, `components/account/UserProfileHeader.jsx`).

### 8. Mandated Skeleton UI Loaders (No Generic Loading Spinners)
- **Rule**: Every single page (`frontend/src/Pages/`) and async component MUST have a dedicated, content-matching **Skeleton UI loader** (e.g., `SetupGridSkeleton`, `CollectionGridSkeleton`, `AdminDashboardSkeleton`, `PostDetailSkeleton`, `UserProfileSkeleton`).
- **Goal**: Generic loading spinners (`<Loader2 />`, `animate-spin`) are strictly prohibited for full-page or section loading. Skeleton loaders must be displayed instantly while data is loading to ensure a premium, zero-CLS (Cumulative Layout Shift), perceived-instant user experience.

---

## 5. Guidelines for Future LLMs & Developers

1. **Do Not Put Data Fetching or API Calls in JSX Files**: NEVER perform raw `fetch()`, `authFetch()`, or `useEffect` API calls directly inside ANY `.jsx` file — whether it is a Page (`frontend/src/Pages/`) or a Component (`frontend/src/components/`). ALWAYS create or consume a dedicated custom hook in `frontend/src/hooks/` for state management and API interactions.
2. **Maintain Backend Layering**: Never query database models directly inside router files (`backend/api/routers/`). Router → Service → Repository.
3. **Preserve Compatibility**: When updating services or endpoints, preserve existing return contracts and optional parameter fallbacks.
4. **No Blocking Operations**: Ensure all database and socket handling on the backend remains async/non-blocking.
5. **Always Verify Visual Layouts**: Ensure dropdowns, popovers, and modals render without clipping inside layout containers.
6. **Avoid Unnecessary Spacing & Excessive Padding**: Keep margins, gaps, and vertical paddings compact (`p-4` to `p-5`, `space-y-3` to `space-y-4`, `gap-4` to `gap-5`). Never over-space components or force users to scroll unnecessarily to view standard forms and cards.
7. **Abstract Complex Views into Modular Components**: Avoid writing long inline code in page files. Extract tabs, forms, headers, and list views into dedicated components in `frontend/src/components/<feature>/`.
8. **Mandatory Skeleton UI for All Pages**: EVERY new page created MUST have a corresponding Skeleton UI component created in `frontend/src/components/CardSkeleton.jsx` (or a dedicated skeleton file) to be displayed during data fetching instead of generic loading spinners.



