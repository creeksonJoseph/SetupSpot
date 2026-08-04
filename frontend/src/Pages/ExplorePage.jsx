import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSetups } from '../hooks/useSetups';
import TypewriterText from '../components/TypewriterText';
import SearchBar from '../components/SearchBar';
import { SetupCard } from '../components/explore/SetupCard';
import { SetupGridSkeleton } from '../components/CardSkeleton';

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
  const { setups, loading, toggleFavorite } = useSetups();
  // null = no active search; array = Algolia hits (may be empty)
  const [searchHits, setSearchHits] = useState(null);
  const [visibleLimit, setVisibleLimit] = useState(24);
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

  // Automatic Infinite Scroll Handler
  useEffect(() => {
    if (visibleLimit >= displayedSetups.length || !sentinelRef.current) return;

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
  }, [visibleLimit, displayedSetups.length]);

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 px-2 flex items-start justify-between gap-6 flex-wrap">
          {/* Left: title + subtitle */}
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] min-h-[48px] flex items-center" style={{ color: '#0F172A' }}>
              <TypewriterText text="Explore Setups" />
            </h1>
            <p className="text-base font-normal leading-normal mt-2" style={{ color: '#475569' }}>
              Discover and get inspired by amazing computer setups from around the world.
            </p>
            {isSearching && (
              <p className="mt-2 text-sm font-semibold" style={{ color: '#0066ff' }}>
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
          <SetupGridSkeleton count={8} />
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
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
              {displayedSetups.slice(0, visibleLimit).map((setup) => (
                <SetupCard key={setup.id} setup={setup} toggleFavorite={toggleFavorite} />
              ))}
            </div>

            {/* Automatic Infinite Scroll Sentinel */}
            {visibleLimit < displayedSetups.length && (
              <div ref={sentinelRef} className="h-12 w-full flex items-center justify-center my-4">
                <span className="text-xs font-medium text-slate-400">Loading more setups...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default ExplorePage;


