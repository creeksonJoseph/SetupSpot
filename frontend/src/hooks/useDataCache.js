/**
 * useDataCache — In-memory, stale-while-revalidate (SWR) style cache
 * for any auth-aware API endpoint.
 *
 * Behaviour:
 *  - First visit:   loading = true  → fetch → cache → render.
 *  - Re-visit (within TTL): data returned immediately from cache (loading = false),
 *    then silently revalidates in the background so data stays fresh.
 *  - Re-visit (after TTL): treats cache as stale; loading = true while re-fetching.
 *
 * The cache is module-level (singleton) so it persists across route
 * changes without needing a Context provider. It is wiped on hard refresh.
 *
 * @param {string} cacheKey      — cache key (typically the URL path, e.g. '/setups')
 * @param {() => Promise<any>} fetcher  — async function that performs the actual request and returns data
 * @param {Object} [options]
 * @param {number} [options.ttl=60000]  — milliseconds before cached data is considered stale (default: 60s)
 * @returns {{ data: any, loading: boolean, error: string|null, invalidate: () => void }}
 */
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Module-level singleton cache ────────────────────────────────────────────
// Shape: { [cacheKey]: { data: any, timestamp: number } }
const cache = {};

// In-flight promise dedup: prevents multiple simultaneous fetches for the same key
// when several components mount at once before any has resolved.
const inFlight = {};
// ─────────────────────────────────────────────────────────────────────────────

export function useDataCache(cacheKey, fetcher, { ttl = 60_000 } = {}) {
  const cached = cache[cacheKey];
  const isFresh = cached && Date.now() - cached.timestamp < ttl;

  // If we have fresh cache, initialise with it to avoid a loading flash on revisit
  const [data, setData] = useState(isFresh ? cached.data : null);
  const [loading, setLoading] = useState(!isFresh);
  const [error, setError] = useState(null);

  // Keep a stable ref to the fetcher so the effect doesn't re-run on every render
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

  const doFetch = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);

      // Deduplicate: if there's already a request in flight for this key, wait for it
      if (!inFlight[cacheKey]) {
        inFlight[cacheKey] = fetcherRef.current().finally(() => {
          delete inFlight[cacheKey];
        });
      }

      try {
        const result = await inFlight[cacheKey];
        cache[cacheKey] = { data: result, timestamp: Date.now() };
        setData(result);
      } catch (err) {
        console.error(`[useDataCache] fetch failed for "${cacheKey}":`, err);
        setError(err.message ?? 'Failed to load data');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [cacheKey]
  );

  useEffect(() => {
    const entry = cache[cacheKey];
    const entryIsFresh = entry && Date.now() - entry.timestamp < ttl;

    if (entryIsFresh) {
      // Data already set from initial state; silently revalidate in background
      doFetch(/* silent = */ true);
    } else {
      // No cache or stale — show loading state
      doFetch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ttl]);

  /** Manually bust the cache for this key (call after a write mutation). */
  const invalidate = useCallback(() => {
    delete cache[cacheKey];
    doFetch(false);
  }, [cacheKey, doFetch]);

  return { data, loading, error, invalidate };
}
