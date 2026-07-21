import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';

export function useCollections() {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authFetch = useAuthFetch();

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch('/collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();

      const transformedCollections = data.map((collection) => ({
        id: collection.id,
        name: collection.name,
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=400&fit=crop",
        items: collection.items || [],
        blur: "blur-lg",
      }));

      setCollections(transformedCollections);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const toggleBlur = useCallback((collectionId) => {
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === collectionId) {
          const nextBlur = col.blur === 'blur-lg' ? 'blur-none' : 'blur-lg';
          return { ...col, blur: nextBlur };
        }
        return col;
      })
    );
  }, []);

  const removeItem = useCallback((collectionId, itemId) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId
          ? { ...col, items: col.items.filter((item) => item.id !== itemId) }
          : col
      )
    );
  }, []);

  const deleteCollection = useCallback(async (collectionId) => {
    try {
      const res = await authFetch(`/collections/${collectionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCollections((prev) => prev.filter((col) => col.id !== collectionId));
        setSelectedCollection(null);
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
    }
  }, [authFetch]);

  return {
    collections,
    loading,
    error,
    selectedCollection,
    setSelectedCollection,
    toggleBlur,
    removeItem,
    deleteCollection,
    refetch: fetchCollections,
  };
}
