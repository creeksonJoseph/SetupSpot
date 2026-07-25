import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { Loader2 } from "lucide-react";

const SimilarSetups = ({ currentSetupId }) => {
  const authFetch = useAuthFetch();
  const [recommendedSetups, setRecommendedSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const scrollContainerRef = useRef(null);

  // Fetch page chunk
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

  // Auto-fill: If rendered items don't fill the container (no scrollbar yet), auto-fetch page 2
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

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-bold pb-3 shrink-0" style={{ color: "#0F172A" }}>
        More Similar Setups
      </h2>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-col rounded-xl overflow-y-auto flex-1 border p-2.5 space-y-3"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin" style={{ color: "#0066ff" }} />
          </div>
        ) : recommendedSetups.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "#727687" }}>
            No similar setups found.
          </p>
        ) : (
          <>
            <div className="columns-2 gap-2 space-y-2">
              {recommendedSetups.map((setup) => (
                <div key={setup.id} className="break-inside-avoid relative group">
                  <Link
                    to={`/post/${setup.id}`}
                    className="block relative overflow-hidden rounded-lg border transition-transform duration-200 hover:scale-[1.03]"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    <img
                      src={setup.image}
                      alt={setup.title}
                      className="w-full h-auto object-cover rounded-lg"
                      loading="lazy"
                    />
                    {/* Subtle dark gradient overlay with title */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <p className="text-white font-semibold text-xs leading-tight truncate">
                        {setup.title}
                      </p>
                      <p className="text-white/80 text-[10px] truncate mt-0.5">
                        {setup.author}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Loading indicator or manual Load More button */}
            {loadingMore ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 size={16} className="animate-spin" style={{ color: "#0066ff" }} />
                <span className="ml-2 text-xs font-medium" style={{ color: "#475569" }}>
                  Loading more...
                </span>
              </div>
            ) : (
              hasMore && (
                <div className="flex justify-center pt-2 pb-1">
                  <button
                    onClick={loadNextPage}
                    className="text-xs font-semibold py-1.5 px-4 rounded-lg border transition-colors hover:bg-slate-50"
                    style={{ borderColor: "#E2E8F0", color: "#0066ff" }}
                  >
                    Load More
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SimilarSetups;
