/**
 * useSetups — fetches all setups from the public /setups endpoint.
 *
 * Works for both authenticated and anonymous users:
 *   - Authenticated: isFavorited flag is populated by the backend
 *   - Anonymous: isFavorited is always false
 *
 * The token is included when available so authenticated users still get
 * their favourites — but the request succeeds without a token too.
 */
import { useState, useEffect, useCallback } from 'react';
import { API, FALLBACK_API } from './api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useSetups() {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuth();
  const { showToast } = useToast();

  const fetchSetups = useCallback(async () => {
    setLoading(true);
    setError(null);

    const headers = auth?.access_token
      ? { Authorization: `Bearer ${auth.access_token}` }
      : {};

    const tryFetch = async (baseUrl) => {
      const res = await fetch(`${baseUrl}/setups`, { headers });
      if (!res.ok) throw new Error('Failed to fetch setups');
      return res.json();
    };

    try {
      const data = await tryFetch(API);
      setSetups(data);
    } catch (err) {
      if (API !== FALLBACK_API) {
        try {
          const data = await tryFetch(FALLBACK_API);
          setSetups(data);
          return;
        } catch { /* fall through to error state */ }
      }
      console.error('Error fetching setups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [auth?.access_token]);

  useEffect(() => {
    fetchSetups();
  }, [fetchSetups]);

  const toggleFavorite = useCallback(async (setupId, isFavorited) => {
    if (!auth?.access_token) {
      return false;
    }

    // Optimistically toggle state immediately (TikTok / Instagram style)
    setSetups((prev) =>
      prev.map((s) =>
        s.id === setupId ? { ...s, isFavorited: !isFavorited } : s,
      ),
    );

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.access_token}`,
      };
      const method = isFavorited ? 'DELETE' : 'POST';

      const tryToggle = async (baseUrl) => {
        const res = await fetch(`${baseUrl}/favorites`, {
          method,
          headers,
          body: JSON.stringify({ setup_id: setupId }),
        });
        return res;
      };

      let response;
      try {
        response = await tryToggle(API);
      } catch {
        response = await tryToggle(FALLBACK_API);
      }

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      if (method === 'POST') {
        const data = await response.json();
        if (data?.already_favorited) {
          showToast('Setup already saved to favourites', 'info');
        } else {
          showToast('Setup saved to favourites!', 'success');
        }
      } else {
        showToast('Removed setup from favourites', 'info');
      }

    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert state update on error
      setSetups((prev) =>
        prev.map((s) =>
          s.id === setupId ? { ...s, isFavorited: isFavorited } : s,
        ),
      );
      showToast('Could not save setup, try again.', 'error');
    }
  }, [auth?.access_token, showToast]);

  return {
    setups,
    loading,
    error,
    toggleFavorite,
    refetch: fetchSetups,
  };
}
