import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';
import { useToast } from '../context/ToastContext';

export function useCollections() {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authFetch = useAuthFetch();
  const { showToast } = useToast();

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch('/collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      setCollections(data);

      // Keep selectedCollection in sync if open
      if (selectedCollection) {
        const updated = data.find((c) => c.id === selectedCollection.id);
        setSelectedCollection(updated || null);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, selectedCollection]);

  useEffect(() => {
    fetchCollections();
  }, []);

  const createCollection = useCallback(async (name) => {
    if (!name.trim()) return;
    try {
      const res = await authFetch('/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create collection');
      const created = await res.json();
      setCollections((prev) => [...prev, created]);
      showToast(`Collection "${name}" created!`, 'success');
      return created;
    } catch (err) {
      showToast(err.message || 'Error creating collection', 'error');
    }
  }, [authFetch, showToast]);

  const renameCollection = useCallback(async (collectionId, newName) => {
    if (!newName.trim()) return;
    try {
      const res = await authFetch(`/collections/${collectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to rename collection');
      const updated = await res.json();
      setCollections((prev) =>
        prev.map((c) => (c.id === collectionId ? updated : c))
      );
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(updated);
      }
      showToast('Collection renamed!', 'success');
    } catch (err) {
      showToast(err.message || 'Error renaming collection', 'error');
    }
  }, [authFetch, selectedCollection, showToast]);

  const removeItem = useCallback(async (collectionId, itemId) => {
    try {
      const res = await authFetch(`/collections/${collectionId}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove item');
      const updatedCollection = await res.json();

      setCollections((prev) =>
        prev.map((col) => (col.id === collectionId ? updatedCollection : col))
      );
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(updatedCollection);
      }
      showToast('Item removed from collection', 'info');
    } catch (err) {
      console.error('Error removing item:', err);
      showToast('Error removing item', 'error');
    }
  }, [authFetch, selectedCollection, showToast]);

  const deleteCollection = useCallback(async (collectionId) => {
    try {
      const res = await authFetch(`/collections/${collectionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCollections((prev) => prev.filter((col) => col.id !== collectionId));
        setSelectedCollection(null);
        showToast('Collection deleted!', 'info');
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      showToast('Error deleting collection', 'error');
    }
  }, [authFetch, showToast]);

  return {
    collections,
    loading,
    error,
    selectedCollection,
    setSelectedCollection,
    createCollection,
    renameCollection,
    removeItem,
    deleteCollection,
    refetch: fetchCollections,
  };
}

