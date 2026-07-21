import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';

export function useSetups() {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authFetch = useAuthFetch();

  const fetchSetups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/setups');
      if (!res.ok) throw new Error('Failed to fetch setups');
      const data = await res.json();
      setSetups(data);
    } catch (err) {
      console.error('Error fetching setups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchSetups();
  }, [fetchSetups]);

  const toggleFavorite = useCallback(async (setupId, isFavorited) => {
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await authFetch('/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_id: setupId }),
      });

      if (response.ok) {
        setSetups((prevSetups) =>
          prevSetups.map((setup) =>
            setup.id === setupId
              ? { ...setup, isFavorited: !isFavorited }
              : setup
          )
        );
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [authFetch]);

  return {
    setups,
    loading,
    error,
    toggleFavorite,
    refetch: fetchSetups,
  };
}
