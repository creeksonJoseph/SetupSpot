import React, { useState, useEffect, useRef } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import ShareMenu from '../components/ShareMenu';
import { FavoriteCard } from '../components/favorites/FavoriteCard';
import { SetupGridSkeleton } from '../components/CardSkeleton';

const FavouritesPage = () => {
  const {
    favorites,
    loading,
    removingId,
    activeShareSetup,
    removeFavorite,
    handleShare,
    closeShare,
  } = useFavorites();

  const [visibleLimit, setVisibleLimit] = useState(24);
  const sentinelRef = useRef(null);

  // Automatic Infinite Scroll Handler
  useEffect(() => {
    if (visibleLimit >= favorites.length || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleLimit((prev) => prev + 24);
        }
      },
      { rootMargin: "300px" }
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [visibleLimit, favorites.length]);

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 px-2">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]" style={{ color: '#0F172A' }}>
            My Favourites ({favorites.length})
          </h1>
          <p className="text-base font-normal leading-normal mt-2" style={{ color: '#475569' }}>
            Setups you've saved for inspiration.
          </p>
        </div>

        {loading ? (
          <SetupGridSkeleton count={8} />
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: '#E2E8F0' }}>
              favorite
            </span>
            <p className="text-base" style={{ color: '#727687' }}>
              No favourites yet. Start exploring setups to add some!
            </p>
          </div>
        ) : (
          <div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
              {favorites.slice(0, visibleLimit).map((setup) => (
                <FavoriteCard
                  key={setup.id}
                  setup={setup}
                  isRemoving={removingId === setup.id}
                  onRemove={removeFavorite}
                  onShare={handleShare}
                />
              ))}
            </div>

            {/* Automatic Infinite Scroll Sentinel */}
            {visibleLimit < favorites.length && (
              <div ref={sentinelRef} className="h-12 w-full flex items-center justify-center my-4">
                <span className="text-xs font-medium text-slate-400">Loading more favourites...</span>
              </div>
            )}
          </div>
        )}

        {/* Standardized Share Modal */}
        {activeShareSetup && <ShareMenu setup={activeShareSetup} onClose={closeShare} />}
      </div>
    </main>
  );
};


export default FavouritesPage;
