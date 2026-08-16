import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import { SetupCard } from '../components/explore/SetupCard';
import { SetupGridSkeleton } from '../components/CardSkeleton';
import { useSetups } from '../hooks/useSetups';
import { useSEO } from '../hooks/useSEO';

const hitToSetup = (hit) => ({
  id: parseInt(hit.objectID, 10),
  title: hit.name,
  image: hit.image_url,
  author: `@${hit.author}`,
  isFavorited: false,
});

export default function SearchPage() {
  const { setups, loading, toggleFavorite } = useSetups();
  const [searchHits, setSearchHits] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(24);
  const sentinelRef = useRef(null);

  useSEO({
    title: 'Search Desk Setups | SetupSpot',
    description:
      'Search for desk setups by gear, mechanical keyboards, monitors, or creator names. Find the perfect setup inspiration on SetupSpot.',
    url: 'https://setupspot.com/search',
  });

  // Extract dynamic popular search terms from actual database/Redis setups
  const popularTags = useMemo(() => {
    if (!setups || setups.length === 0) return [];

    const tagCounts = {};
    const stopWords = new Set(['with', 'from', 'your', 'this', 'that', 'have', 'and', 'for', 'the', 'setup', 'my', 'desk', 'room', 'space']);

    setups.forEach((setup) => {
      const words = setup.title ? setup.title.split(/\s+/) : [];
      words.forEach((w) => {
        const clean = w.replace(/[^a-zA-Z0-9]/g, '');
        if (clean.length > 3 && !stopWords.has(clean.toLowerCase())) {
          const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
          tagCounts[capitalized] = (tagCounts[capitalized] || 0) + 1;
        }
      });
    });

    const sorted = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
    return sorted.slice(0, 8);
  }, [setups]);

  const handleSearchResults = useCallback((hits) => {
    setSearchHits(hits);
  }, []);

  const isSearching = searchHits !== null;
  // If searching: show Algolia search hits; If not searching: show Redis/API setups feed
  const displayedSetups = isSearching ? searchHits.map(hitToSetup) : setups;

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
    <div className="w-full flex-1 py-2 sm:py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header & Main Search Bar */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
              Search Setups
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5 sm:mt-1">
              Search by gear, mechanical keyboards, monitors, or creator names.
            </p>
          </div>

          {/* Full-width Search Bar */}
          <div className="w-full max-w-full overflow-hidden">
            <SearchBar onResults={handleSearchResults} query={searchQuery} setQuery={setSearchQuery} />
          </div>

          {/* Real Dynamic Popular Searches Suggestions */}
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#727687] mb-2.5">
              Popular Searches
            </p>
            {loading && !setups.length ? (
              /* Skeleton Loading State for Popular Search Pills */
              <div className="flex flex-wrap gap-2 animate-pulse">
                <div className="h-7 w-20 bg-slate-200 rounded-full" />
                <div className="h-7 w-24 bg-slate-200 rounded-full" />
                <div className="h-7 w-16 bg-slate-200 rounded-full" />
                <div className="h-7 w-28 bg-slate-200 rounded-full" />
                <div className="h-7 w-20 bg-slate-200 rounded-full" />
              </div>
            ) : popularTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      const inputEl = document.getElementById('explore-search-input');
                      if (inputEl) {
                        inputEl.focus();
                      }
                    }}
                    className="text-xs font-semibold text-[#475569] bg-white border border-[#E2E8F0] px-3.5 py-1.5 rounded-full hover:border-[#0066ff] hover:text-[#0066ff] transition-colors shadow-2xs cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Results / Random Discovery Feed */}
        {loading && !setups.length ? (
          <SetupGridSkeleton count={8} />
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0066ff]">
              {isSearching
                ? `Found ${displayedSetups.length} setup${displayedSetups.length !== 1 ? 's' : ''}`
                : 'Explore Setups'}
            </p>

            {displayedSetups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-[#E2E8F0] p-8">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
                  search_off
                </span>
                <p className="text-base font-semibold text-[#0F172A]">
                  No setups matched your query
                </p>
                <p className="text-sm text-[#727687] mt-1">
                  Try searching for a different item, keyboard, or author name.
                </p>
              </div>
            ) : (
              <>
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2.5 sm:gap-4">
                  {displayedSetups.slice(0, visibleLimit).map((setup) => (
                    <SetupCard key={setup.id} setup={setup} toggleFavorite={toggleFavorite} />
                  ))}
                </div>

                {visibleLimit < displayedSetups.length && (
                  <div ref={sentinelRef} className="h-12 w-full flex items-center justify-center my-4">
                    <span className="text-xs font-medium text-slate-400">Loading more setups...</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
