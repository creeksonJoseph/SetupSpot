# Frontend System Design & Performance Architecture

This document details the frontend performance strategies, rendering optimizations, and data-fetching patterns implemented in **SetupSpot** (`frontend/`).

---

## 1. Progressive Rendering & React Suspense Boundaries

### Motivation & Concept
Instead of blocking an entire page while fetching heavy secondary datasets (e.g. similar setup recommendations or comments), the UI renders critical hero content first. Data-heavy subtrees are wrapped in React `<Suspense>` boundaries paired with skeleton components.

### Implementation Pattern (Spotify Model)
On the setup detail view ([`PostDetailPage.jsx`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/Pages/PostDetailPage.jsx)), the screen layout container is rendered immediately. Each of the three columns operates and renders its fallback skeleton or content independently:

```jsx
{/* Left Column: Hero Image & Social Bar */}
{!setup ? <SetupHeroSkeleton /> : <SetupImageCanvas setup={setup} />}

{/* Middle Column: Equipment Breakdown */}
{!setup ? <ItemsListSkeleton count={5} /> : <SetupItemList items={setup.items} />}

{/* Right Column: Recommended Similar Setups (Fetches in parallel behind Suspense) */}
<Suspense fallback={<SimilarSetupsSkeleton count={6} />}>
  <SimilarSetups currentSetupId={id} />
</Suspense>
```

---

## 2. Skeleton Screen System

To prevent layout shifts (CLS) and provide immediate visual feedback, custom animated skeletons were added to [`CardSkeleton.jsx`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/components/CardSkeleton.jsx):

- `SetupHeroSkeleton`: Simulates the hero image canvas and author action bar.
- `ItemsListSkeleton`: Simulates equipment list accordion rows with price tags.
- `SimilarSetupsSkeleton`: Simulates multi-column recommendation cards.
- `CommentsSkeleton`: Simulates comment input composer and threaded user comments.
- `SetupGridSkeleton`: Simulates the main explore masonry grid.

---

## 3. In-Memory Stale-While-Revalidate (SWR) Caching

### Architecture ([`useDataCache.js`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/hooks/useDataCache.js))
To eliminate loading flashes when users navigate back and forth between routes (e.g., Explore ↔ Detail), a singleton in-memory SWR cache layer was introduced.

- **First Access**: Initial state is empty → triggers fetch → renders skeleton → caches result.
- **Revisit within TTL (60s)**: Returns cached data **instantly (0ms delay)**, while asynchronously revalidating in the background.
- **Request Deduplication**: Uses an `inFlight` promise lookup table to ensure identical simultaneous requests (e.g. multiple components mounting concurrently) only execute a single HTTP fetch.

---

## 4. Browser Rendering & DOM Containment (`content-visibility`)

### Problem
Masonry layouts with hundreds of setup cards cause long layout and paint times during initial render and scrolling. Traditional virtualization (`react-window`) breaks multi-column CSS `columns-*` layouts.

### Solution ([`SetupCard.jsx`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/components/explore/SetupCard.jsx))
We leveraged native modern browser CSS containment properties:

```jsx
<div
  className="break-inside-avoid mb-4 relative group"
  style={{
    contentVisibility: 'auto',
    containIntrinsicSize: 'auto 300px',
  }}
>
  {/* Card Content */}
</div>
```

- **`contentVisibility: 'auto'`**: Tells the browser rendering engine to skip layout, style calculation, and paint for off-screen cards until they approach the viewport.
- **`containIntrinsicSize: 'auto 300px'`**: Provides a placeholder intrinsic height so scrollbar geometry and masonry column balance remain accurate before rendering.

---

## 5. Build Chunking & Code-Splitting Strategy

### Bundle Optimization ([`vite.config.js`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/vite.config.js))
Default single-bundle builds force users to re-download heavy third-party libraries every time application code changes.

We configured Rollup manual chunking:

```js
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('react-dom') || id.includes('react/')) return 'react-vendor';
          if (id.includes('react-router')) return 'router';
          if (id.includes('motion') || id.includes('framer')) return 'motion';
          if (id.includes('algoliasearch') || id.includes('@algolia')) return 'algolia';
          return 'vendor';
        }
      }
    }
  }
}
```

### Result
- `react-vendor` (~220 KB) is cached long-term by browsers and CDN.
- Route updates only download small application chunk files (e.g., `PostDetailPage.js` ~46 KB).

---

## 6. Server-Side Cursor Pagination & ETag Handling

### Integration ([`useSetups.js`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/hooks/useSetups.js) & [`ExplorePage.jsx`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/frontend/src/Pages/ExplorePage.jsx))
- **Cursor Paginated Fetching**: `useSetups` tracks the ID of the last item in the list (`cursor`). As the user scrolls near the bottom of the page, `IntersectionObserver` invokes `loadMore()`, appending the next page of 48 items from `/setups?cursor=<id>&limit=48`.
- **304 Not Modified Handling**: `useSetups` sends `If-None-Match: <etag>` header on revalidation. If data is unchanged, server responds with `HTTP 304` (zero JSON payload), and the hook reuses existing cache without UI re-renders.
