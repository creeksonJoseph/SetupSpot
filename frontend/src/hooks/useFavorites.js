import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authFetch = useAuthFetch();

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch('/favorites/list');
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();
      setFavorites(data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (setupId) => {
    try {
      await authFetch('/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_id: setupId }),
      });
      setFavorites((prev) => prev.filter((fav) => fav.id !== setupId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  }, [authFetch]);

  return {
    favorites,
    loading,
    error,
    removeFavorite,
    refetch: fetchFavorites,
  };
}
