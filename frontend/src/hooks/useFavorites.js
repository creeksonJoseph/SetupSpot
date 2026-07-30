import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';
import { useToast } from '../context/ToastContext';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [activeShareSetup, setActiveShareSetup] = useState(null);

  const authFetch = useAuthFetch();
  const { showToast } = useToast();

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

  const removeFavorite = useCallback(
    async (setupId) => {
      setRemovingId(setupId);

      // Give visual feedback for smooth animation before removing from state
      setTimeout(async () => {
        let originalFavorites;
        setFavorites((prev) => {
          originalFavorites = prev;
          return prev.filter((fav) => fav.id !== setupId);
        });

        try {
          const response = await authFetch('/favorites', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setup_id: setupId }),
          });
          if (!response.ok) {
            throw new Error('Failed to remove favorite');
          }
        } catch (err) {
          console.error('Error removing favorite:', err);
          if (originalFavorites) {
            setFavorites(originalFavorites);
          }
          showToast('Could not remove setup from favorites, try again.', 'error');
        } finally {
          setRemovingId(null);
        }
      }, 150);
    },
    [authFetch, showToast]
  );

  const handleShare = useCallback(async (e, setup) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/setup/${setup.id}`;
    const shareData = {
      title: setup.title,
      text: `Check out this setup: ${setup.title} by ${setup.author}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled native share sheet
      }
    } else {
      setActiveShareSetup(setup);
    }
  }, []);

  const closeShare = useCallback(() => {
    setActiveShareSetup(null);
  }, []);

  return {
    favorites,
    loading,
    error,
    removingId,
    activeShareSetup,
    removeFavorite,
    handleShare,
    closeShare,
    refetch: fetchFavorites,
  };
}
