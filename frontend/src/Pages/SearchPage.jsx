import React, { useState, useCallback, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import { SetupCard } from '../components/explore/SetupCard';
import { SetupGridSkeleton } from '../components/CardSkeleton';
import { useSetups } from '../hooks/useSetups';

const hitToSetup = (hit) => ({
  id: parseInt(hit.objectID, 10),
  title: hit.name,
  image: hit.image_url,
  author: `@${hit.author}`,
  isFavorited: false,
});

export default function SearchPage() {
  const { toggleFavorite } = useSetups();
  const [searchHits, setSearchHits] = useState(null);
  const [visibleLimit, setVisibleLimit] = useState(24);
  const sentinelRef = useRef(null);

  const popularTags = [
    'Mechanical Keyboard',
    'Ultrawide',
    'Minimalist',
    'Dual Monitor',
    'RGB Light',
    'Keychron',
    'Ergonomic Chair',
    'MacBook Pro',
  ];

  const handleSearchResults = useCallback((hits) => {
    setSearchHits(hits);
  }, []);

  const isSearching = searchHits !== null;
  const displayedSetups = isSearching ? searchHits.map(hitToSetup) : [];

  // Auto-focus search input on page mount
  useEffect(() => {
    const inputEl = document.getElementById('explore-search-input');
    if (inputEl) {
      inputEl.focus();
    }
  }, []);

  // Infinite Scroll Handler
  useEffect(() => {
    if (!sentinelRef.current || visibleLimit >= displayedSetups.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleLimit((prev) => prev + 24);
        }
      },
      { rootMargin: '200px' }
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [visibleLimit, displayedSetups.length]);

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Header & Main Search Bar */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">
            Search Setups
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Search by gear, mechanical keyboards, monitors, or creator names.
          </p>
        </div>

        {/* Full-width Search Bar */}
        <div className="w-full">
          <SearchBar onResults={handleSearchResults} />
        </div>

        {/* Popular Quick Search Tags */}
        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#727687] mb-2.5">
            Popular Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const inputEl = document.getElementById('explore-search-input');
                  if (inputEl) {
                    inputEl.value = tag;
                    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                    inputEl.focus();
                  }
                }}
                className="text-xs font-semibold text-[#475569] bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-full hover:border-[#0066ff] hover:text-[#0066ff] transition-colors shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      {isSearching ? (
        displayedSetups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
              search_off
            </span>
            <p className="text-base font-semibold text-[#0F172A]">
              No setups matched your query
            </p>
            <p className="text-sm text-[#727687] mt-1">
              Try searching for a different switch type, brand, or desk item.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0066ff]">
              Found {displayedSetups.length} setup{displayedSetups.length !== 1 ? 's' : ''}
            </p>

            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
              {displayedSetups.slice(0, visibleLimit).map((setup) => (
                <SetupCard key={setup.id} setup={setup} toggleFavorite={toggleFavorite} />
              ))}
            </div>

            {visibleLimit < displayedSetups.length && (
              <div ref={sentinelRef} className="h-12 w-full flex items-center justify-center my-4">
                <span className="text-xs font-medium text-slate-400">Loading more results...</span>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs">
          <span className="material-symbols-outlined text-6xl text-[#0066ff]/40 mb-3">
            search
          </span>
          <h2 className="text-lg font-bold text-[#0F172A]">
            Type to start searching
          </h2>
          <p className="text-sm text-[#475569] max-w-sm mt-1">
            Discover custom workspace builds, mechanical keyboards, monitor arms, and creator setups instantly.
          </p>
        </div>
      )}
    </main>
  );
}
