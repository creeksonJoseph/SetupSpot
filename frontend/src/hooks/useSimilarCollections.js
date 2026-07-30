import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';

/**
 * Custom hook to fetch backend-computed similar collections for a given collection ID.
 * Returns: { similar, loading, refetch }
 */
export function useSimilarCollections(collectionId) {
  const authFetch = useAuthFetch();
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSimilar = useCallback(async () => {
    if (!collectionId) {
      setSimilar([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`/collections/${collectionId}/similar`);
      if (!res.ok) throw new Error('Failed to fetch similar collections');
      const data = await res.json();
      setSimilar(data);
    } catch (err) {
      console.error('useSimilarCollections error:', err);
      setSimilar([]);
    } finally {
      setLoading(false);
    }
  }, [collectionId, authFetch]);

  useEffect(() => {
    fetchSimilar();
  }, [fetchSimilar]);

  return { similar, loading, refetch: fetchSimilar };
}
