import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthFetch } from "./useAuthFetch";

export function useSimilarSetups(currentSetupId) {
  const authFetch = useAuthFetch();
  const [recommendedSetups, setRecommendedSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const scrollContainerRef = useRef(null);

  // Fetch page chunk helper
  const fetchPage = useCallback(
    async (pageNum) => {
      if (!currentSetupId) return;
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await authFetch(`/setups/${currentSetupId}/similar?page=${pageNum}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          if (pageNum === 1) {
            setRecommendedSetups(data);
          } else {
            setRecommendedSetups((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const newItems = data.filter((s) => !existingIds.has(s.id));
              return [...prev, ...newItems];
            });
          }
          setHasMore(data.length === 8);
        }
      } catch (err) {
        console.error("Failed to fetch similar setups page:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentSetupId, authFetch]
  );

  // Reset and fetch page 1 when currentSetupId changes
  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true);
    setRecommendedSetups([]);
    fetchPage(1);
  }, [currentSetupId, fetchPage]);

  // Load next page helper
  const loadNextPage = useCallback(() => {
    if (!loadingMore && !loading && hasMore) {
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      fetchPage(nextPage);
    }
  }, [loadingMore, loading, hasMore, fetchPage]);

  // Auto-fill check: If rendered items fit without creating a scrollbar, auto-fetch page 2
  useEffect(() => {
    if (!loading && !loadingMore && hasMore && scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      if (scrollHeight <= clientHeight + 40 && recommendedSetups.length > 0) {
        loadNextPage();
      }
    }
  }, [recommendedSetups, loading, loadingMore, hasMore, loadNextPage]);

  // Scroll listener for infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 120 && hasMore && !loadingMore && !loading) {
      loadNextPage();
    }
  };

  return {
    recommendedSetups,
    loading,
    loadingMore,
    hasMore,
    scrollContainerRef,
    handleScroll,
    loadNextPage,
  };
}
