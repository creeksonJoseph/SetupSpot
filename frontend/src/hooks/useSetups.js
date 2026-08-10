/**
 * useSetups — cursor-based paginated fetching from /setups.
 *
 * Pagination model:
 *   - On mount: fetch the first 48 setups (no cursor)
 *   - On loadMore(): fetch the next page using the ID of the last visible setup as cursor
 *   - hasMore: false when the server returns fewer items than the page size
 *
 * ETag support:
 *   - Sends If-None-Match on repeat requests. If the server responds 304,
 *     the cached data is reused — zero bytes transferred over the wire.
 *
 * SWR-style cache (module-level):
 *   - First-page data is cached in-memory (60s TTL) so re-visiting /explore
 *     is instant — no skeleton flash.
 */
import { useState, useCallback, useEffect } from 'react';
import { API } from './api';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 48;

// ── Module-level cache (survives route changes) ───────────────────────────────
// Shape: { [cacheKey]: { data: [], etag: string, timestamp: number } }
const pageCache = {};
// ─────────────────────────────────────────────────────────────────────────────

async function fetchPage(baseUrl, cursor, cachedEtag) {
  const url = new URL(`${baseUrl}/setups`);
  url.searchParams.set('limit', String(PAGE_SIZE));
  if (cursor != null) url.searchParams.set('cursor', String(cursor));

  const headers = {};
  if (cachedEtag) headers['If-None-Match'] = cachedEtag;

  const res = await fetch(url.toString(), { headers, credentials: 'include' });

  if (res.status === 304) {
    return { data: null, etag: cachedEtag, notModified: true };
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const etag = res.headers.get('ETag') ?? null;
  return { data, etag, notModified: false };
}

async function fetchWithFallback(cursor, cachedEtag) {
  return await fetchPage(API, cursor, cachedEtag);
}

export function useSetups() {
  const { isLoggedIn } = useCurrentUser();
  const { showToast } = useToast();

  // Separate cache key for auth vs anon so favorites populate correctly
  const cacheKey = `page1:${isLoggedIn ? 'auth' : 'anon'}`;

  const [setups, setSetups] = useState(() => pageCache[cacheKey]?.data ?? []);
  const [loading, setLoading] = useState(setups.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // ── Initial / first-page load ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadFirstPage = async () => {
      const cached = pageCache[cacheKey];
      const isFresh = cached && Date.now() - cached.timestamp < 60_000;

      if (isFresh) {
        // Use cached data immediately and revalidate silently in background
        setSetups(cached.data);
        setLoading(false);
      } else if (cached) {
        // Stale — show existing data immediately, then check if changed
        setSetups(cached.data);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const { data, etag, notModified } = await fetchWithFallback(
          null,
          cached?.etag ?? null,
        );

        if (cancelled) return;

        if (notModified) {
          // 304 — server confirmed nothing changed, bump timestamp
          if (cached) pageCache[cacheKey] = { ...cached, timestamp: Date.now() };
          setLoading(false);
          return;
        }

        pageCache[cacheKey] = { data, etag, timestamp: Date.now() };
        setSetups(data);
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        if (!cancelled) {
          console.error('[useSetups] Failed to load first page:', err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFirstPage();
    return () => { cancelled = true; };
  }, [cacheKey]);

  // ── Load next page ──────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    const cursor = setups[setups.length - 1]?.id;
    if (cursor == null) return;

    setLoadingMore(true);
    try {
      const { data, notModified } = await fetchWithFallback(
        cursor,
        null,
      );
      if (notModified || !data) return;

      setSetups(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newItems = data.filter(s => !existingIds.has(s.id));
        return [...prev, ...newItems];
      });
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error('[useSetups] Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [setups, loadingMore, hasMore]);

  // ── Invalidate & refetch ────────────────────────────────────────────────────
  const invalidate = useCallback(() => {
    delete pageCache[cacheKey];
    setSetups([]);
    setLoading(true);
    setHasMore(true);
  }, [cacheKey]);

  // ── Optimistic favorite toggle ──────────────────────────────────────────────
  const toggleFavorite = useCallback(async (setupId, isFavorited) => {
    if (!isLoggedIn) return false;

    setSetups(prev =>
      prev.map(s => s.id === setupId ? { ...s, isFavorited: !isFavorited } : s),
    );

    try {
      const method = isFavorited ? 'DELETE' : 'POST';

      const tryToggle = async (baseUrl) => {
        const res = await fetch(`${baseUrl}/favorites`, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setup_id: setupId }),
        });
        return res;
      };

      const response = await tryToggle(API);

      if (!response.ok) throw new Error('Failed to toggle favorite');

      if (method === 'POST') {
        const data = await response.json();
        showToast(data?.already_favorited ? 'Setup already saved to favourites' : 'Setup saved to favourites!', data?.already_favorited ? 'info' : 'success');
      } else {
        showToast('Removed setup from favourites', 'info');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setSetups(prev =>
        prev.map(s => s.id === setupId ? { ...s, isFavorited } : s),
      );
      showToast('Could not save setup, try again.', 'error');
    }
  }, [isLoggedIn, showToast]);

  return {
    setups,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    toggleFavorite,
    refetch: invalidate,
  };
}
