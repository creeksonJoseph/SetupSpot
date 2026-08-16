import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSetups } from '../hooks/useSetups';
import TypewriterText from '../components/TypewriterText';
import SearchBar from '../components/SearchBar';
import { SetupCard } from '../components/explore/SetupCard';
import { SetupGridSkeleton } from '../components/CardSkeleton';
import { useSEO } from '../hooks/useSEO';

import { useLocation } from 'react-router-dom';

// Convert an Algolia hit to the same shape as a setup from the REST API
const hitToSetup = (hit) => ({
  id: parseInt(hit.objectID, 10),
  title: hit.name,
  image: hit.image_url,
  author: `@${hit.author}`,
  isFavorited: false,
});

const ExplorePage = () => {
  const location = useLocation();
  const { setups, loading, loadingMore, hasMore, loadMore, toggleFavorite } = useSetups();

  useSEO({
    title: 'Explore Desk Setups | SetupSpot',
    description:
      'Discover amazing computer and desk setups from creators around the world. Find your next setup inspiration — browse gear, keyboards, monitors, and more.',
    url: 'https://setupspot.com/explore',
  });

  // null = no active search; array = Algolia hits (may be empty)
  const [searchHits, setSearchHits] = useState(null);
  const sentinelRef = useRef(null);

  const handleSearchResults = useCallback((hits) => {
    setSearchHits(hits);
  }, []);

  const isSearching = searchHits !== null;
  const displayedSetups = isSearching ? searchHits.map(hitToSetup) : setups;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('search') === 'true') {
      const inputEl = document.getElementById('explore-search-input');
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [location.search]);

  // Infinite scroll — triggers real server-side cursor pagination via loadMore()
  useEffect(() => {
    if (isSearching || !hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '400px' } // Start fetching 400px before the sentinel is visible
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [isSearching, hasMore, loadMore]);

  return (
    <div className="w-full flex-1 py-2 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 sm:mb-8 px-1 flex items-start justify-between gap-4 sm:gap-6 flex-wrap">
          {/* Left: title + subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] min-h-[38px] sm:min-h-[48px] flex items-center" style={{ color: '#0F172A' }}>
              <TypewriterText text="Explore Setups" />
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-normal leading-normal mt-1 sm:mt-2" style={{ color: '#475569' }}>
              Discover and get inspired by amazing computer setups from around the world.
            </p>
            {isSearching && (
              <p className="mt-2 text-xs sm:text-sm font-semibold" style={{ color: '#0066ff' }}>
                {displayedSetups.length > 0
                  ? <><strong>{displayedSetups.length}</strong> result{displayedSetups.length !== 1 ? 's' : ''} found</>
                  : <>No results found</>}
              </p>
            )}
          </div>

          {/* Right: search bar (Desktop only — mobile uses dedicated /search page) */}
          <div className="hidden md:block" style={{ flex: '0 1 420px', minWidth: '240px' }}>
            <SearchBar onResults={handleSearchResults} />
          </div>
        </div>

        {loading && !isSearching ? (
          <SetupGridSkeleton count={10} />
        ) : displayedSetups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#cbd5e1' }}>
              {isSearching ? 'search_off' : 'grid_view'}
            </span>
            <p className="mt-4 text-lg font-medium" style={{ color: '#475569' }}>
              {isSearching ? 'No setups matched your search' : 'No setups yet. Be the first to share one!'}
            </p>
          </div>
        ) : (
          <div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2.5 sm:gap-4">
              {displayedSetups.map((setup) => (
                <SetupCard key={setup.id} setup={setup} toggleFavorite={toggleFavorite} />
              ))}
            </div>

            {/* Infinite scroll sentinel — triggers loadMore() when entering viewport */}
            {!isSearching && (
              <div
                ref={sentinelRef}
                className="h-16 w-full flex items-center justify-center my-4"
              >
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                    <span className="text-xs font-medium text-slate-400">Loading more setups…</span>
                  </div>
                )}
                {!hasMore && setups.length > 0 && (
                  <p className="text-xs text-slate-300 font-medium">You've seen all setups ✓</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
