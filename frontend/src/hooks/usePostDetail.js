import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';
import { useToast } from '../context/ToastContext';

export function usePostDetail(id) {
  const authFetch = useAuthFetch();
  const { showToast } = useToast();

  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [selectedItemForCollection, setSelectedItemForCollection] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const fetchSetup = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/setups/${id}`);
      if (!response.ok) throw new Error('Setup not found');
      const data = await response.json();

      const transformedData = {
        id: data.id,
        name: data.name,
        image_url: data.image_url,
        author: data.author_username || 'Unknown',
        author_avatar: data.author_avatar || null,
        like_count: data.like_count ?? 0,
        is_liked: data.is_liked ?? false,
        comment_count: data.comment_count ?? 0,
        items: data.items || [],
      };

      setSetup(transformedData);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to load setup data.');
    } finally {
      setLoading(false);
    }
  }, [id, authFetch]);

  useEffect(() => {
    fetchSetup();
  }, [fetchSetup]);

  const handleOpenSidebar = useCallback((item) => {
    setSelectedItemForDetail(item);
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedItemForDetail(null);
  }, []);

  const handleOpenModal = useCallback((item) => {
    setSelectedItemForCollection(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemForCollection(null);
  }, []);

  /** Toggle setup-level like (separate from Favorites). */
  const toggleLike = useCallback(async () => {
    if (!setup) return;

    // Optimistic update
    setSetup((prev) => prev ? {
      ...prev,
      is_liked: !prev.is_liked,
      like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1,
    } : null);

    try {
      const res = await authFetch('/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_id: setup.id }),
      });
      if (!res.ok) throw new Error('Failed to toggle like');
      const { liked, like_count } = await res.json();
      setSetup((prev) => prev ? { ...prev, is_liked: liked, like_count } : null);
    } catch (err) {
      console.error(err);
      // Revert
      setSetup((prev) => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1,
      } : null);
      showToast('Could not update like, try again.', 'error');
    }
  }, [setup, authFetch, showToast]);

  /** Save setup to Favourites (separate from Like). */
  const toggleFavorite = useCallback(async () => {
    if (!setup) return;

    const isFavorited = setup.is_favorited ?? false;
    setSetup((prev) => prev ? { ...prev, is_favorited: !isFavorited } : null);

    if (isFavorited) {
      showToast('Removed setup from favourites', 'info');
    } else {
      showToast('Setup saved to favourites!', 'success');
    }

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await authFetch('/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_id: setup.id }),
      });
      if (!res.ok) throw new Error('Failed to toggle favorite');
    } catch (err) {
      console.error(err);
      setSetup((prev) => prev ? { ...prev, is_favorited: isFavorited } : null);
      showToast('Could not save to favourites, try again.', 'error');
    }
  }, [setup, authFetch, showToast]);


  return {
    setup,
    loading,
    error,
    hoveredItemId,
    setHoveredItemId,
    isModalOpen,
    isSidebarOpen,
    selectedItemForDetail,
    selectedItemForCollection,
    handleOpenSidebar,
    handleCloseSidebar,
    handleOpenModal,
    handleCloseModal,
    toggleLike,
    toggleFavorite,
    commentsOpen,
    setCommentsOpen,
    refetch: fetchSetup,
  };
}
