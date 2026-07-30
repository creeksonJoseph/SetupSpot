import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';

/**
 * Fetch any collection by ID — public, no auth required.
 * Used by the PublicCollectionPage to view someone else's collection.
 */
export function usePublicCollection(collectionId) {
  const authFetch = useAuthFetch();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!collectionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/collections/${collectionId}`);
      if (!res.ok) throw new Error('Collection not found');
      const data = await res.json();
      setCollection(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionId, authFetch]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { collection, loading, error, refetch: fetch };
}
