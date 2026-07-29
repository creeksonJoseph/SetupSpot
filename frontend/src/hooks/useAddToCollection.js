/**
 * useAddToCollection — logic for the "Add to Collection" modal in PostDetailPage.
 *
 * Handles: fetching the user's collections, creating a new collection,
 * and adding an item to a selected collection.
 *
 * PostDetailPage passes this hook's return values down to the modal component,
 * keeping the modal itself as pure render.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';

export function useAddToCollection({ isOpen }) {
  const authFetch = useAuthFetch();

  const [collections, setCollections]           = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [newCollectionName, setNewCollectionName]   = useState('');
  const [showCreateNew, setShowCreateNew]           = useState(false);
  const [loading, setLoading]                       = useState(false);

  // Fetch collections and reset form whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;

    setSelectedCollection('');
    setNewCollectionName('');
    setShowCreateNew(false);

    (async () => {
      try {
        const res  = await authFetch('/collections');
        const data = await res.json();
        setCollections(data);
        if (data.length === 0) setShowCreateNew(true);
      } catch (err) {
        console.error('useAddToCollection: error fetching collections', err);
      }
    })();
  }, [isOpen, authFetch]);

  const createCollection = useCallback(async () => {
    if (!newCollectionName.trim() || loading) return;
    setLoading(true);
    try {
      const res = await authFetch('/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setCollections((prev) => {
          if (prev.some((c) => c.id === created.id)) return prev;
          return [...prev, created];
        });
        setSelectedCollection(created.id.toString());
        setShowCreateNew(false);
        setNewCollectionName('');
      }
    } catch (err) {
      console.error('useAddToCollection: error creating collection', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, newCollectionName, loading]);

  const addItemToCollection = useCallback(async (itemId, onClose) => {
    if (!selectedCollection || !itemId || loading) return;
    setLoading(true);
    try {
      await authFetch(`/collections/${selectedCollection}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      });
      onClose();
    } catch (err) {

      console.error('useAddToCollection: error adding item', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, selectedCollection]);

  return {
    collections,
    selectedCollection,
    setSelectedCollection,
    newCollectionName,
    setNewCollectionName,
    showCreateNew,
    setShowCreateNew,
    loading,
    createCollection,
    addItemToCollection,
  };
}
