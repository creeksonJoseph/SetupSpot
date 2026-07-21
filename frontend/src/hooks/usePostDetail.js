import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';

export function usePostDetail(id) {
  const authFetch = useAuthFetch();

  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [selectedItemForCollection, setSelectedItemForCollection] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);

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
        author: data.user?.username || 'Unknown',
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

  const toggleFavorite = useCallback(async (itemId, isFavorited) => {
    if (!setup) return;
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await authFetch('/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_id: setup.id }),
      });

      if (response.ok) {
        setSetup((prevSetup) => (prevSetup ? {
          ...prevSetup,
          items: prevSetup.items.map((item) =>
            item.id === itemId
              ? { ...item, is_favorited: !isFavorited }
              : item
          ),
        } : null));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [setup, authFetch]);

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
    toggleFavorite,
    refetch: fetchSetup,
  };
}
