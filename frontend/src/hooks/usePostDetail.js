import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthFetch } from './useAuthFetch';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function usePostDetail(id) {
  const authFetch = useAuthFetch();
  const { auth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [selectedItemForCollection, setSelectedItemForCollection] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const [authModalState, setAuthModalState] = useState({ isOpen: false, actionName: '' });

  const isLoggedIn = Boolean(auth?.token || auth?.user);

  const triggerAuthModal = useCallback((actionName = 'continue') => {
    setAuthModalState({ isOpen: true, actionName });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalState({ isOpen: false, actionName: '' });
  }, []);

  const checkAuth = useCallback(() => {
    if (!auth?.token && !auth?.user) {
      showToast('Please log in or sign up to interact', 'info');
      navigate('/login');
      return false;
    }
    return true;
  }, [auth, navigate, showToast]);

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
        is_favorited: data.is_favorited ?? false,
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
    if (!isLoggedIn) {
      triggerAuthModal('add gear to collections');
      return;
    }
    setSelectedItemForCollection(item);
    setIsModalOpen(true);
  }, [isLoggedIn, triggerAuthModal]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemForCollection(null);
  }, []);

  /** Toggle setup-level like (separate from Favorites). */
  const toggleLike = useCallback(async () => {
    if (!isLoggedIn) {
      triggerAuthModal('like setups');
      return;
    }
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
  }, [isLoggedIn, triggerAuthModal, setup, authFetch, showToast]);

  /** Save setup to Favourites (separate from Like). */
  const toggleFavorite = useCallback(async () => {
    if (!isLoggedIn) {
      triggerAuthModal('save setups to favourites');
      return;
    }
    if (!setup) return;

    const isFavorited = setup.is_favorited ?? false;
    setSetup((prev) => prev ? { ...prev, is_favorited: !isFavorited } : null);

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await authFetch('/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_id: setup.id }),
      });
      if (!res.ok) throw new Error('Failed to toggle favorite');

      if (method === 'POST') {
        const data = await res.json();
        if (data?.already_favorited) {
          showToast('Setup already saved to favourites', 'info');
        } else {
          showToast('Setup saved to favourites!', 'success');
        }
      } else {
        showToast('Removed setup from favourites', 'info');
      }
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
    authModalState,
    triggerAuthModal,
    closeAuthModal,
    refetch: fetchSetup,
  };
}
