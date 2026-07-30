import React, { useState, useCallback } from 'react';
import { useSetups } from '../hooks/useSetups';
import TypewriterText from '../components/TypewriterText';
import SearchBar from '../components/SearchBar';
import { SetupCard } from '../components/explore/SetupCard';

// Convert an Algolia hit to the same shape as a setup from the REST API
const hitToSetup = (hit) => ({
  id: parseInt(hit.objectID, 10),
  title: hit.name,
  image: hit.image_url,
  author: `@${hit.author}`,
  isFavorited: false,
});


const ExplorePage = () => {
  const { setups, loading, toggleFavorite } = useSetups();
  // null = no active search; array = Algolia hits (may be empty)
  const [searchHits, setSearchHits] = useState(null);

  const handleSearchResults = useCallback((hits) => {
    setSearchHits(hits);
  }, []);

  const isSearching = searchHits !== null;
  const displayedSetups = isSearching ? searchHits.map(hitToSetup) : setups;

  if (loading && !isSearching) {
    return (
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl flex justify-center items-center h-64">
          <div className="flex items-center gap-3" style={{ color: '#727687' }}>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#0066ff' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
            </svg>
            <span className="text-sm font-medium">Loading setups...</span>
          </div>
        </div>
      </main>
    );
  }

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
              <p className="mt-2 text-sm" style={{ color: '#64748B' }}>
                {displayedSetups.length > 0
                  ? <><strong>{displayedSetups.length}</strong> result{displayedSetups.length !== 1 ? 's' : ''} found</>
                  : <>No results found</>}
              </p>
            )}
          </div>

          {/* Right: search bar */}
          <div style={{ flex: '0 1 420px', minWidth: '240px' }}>
            <SearchBar onResults={handleSearchResults} />
          </div>
        </div>

        {displayedSetups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#cbd5e1' }}>
              {isSearching ? 'search_off' : 'grid_view'}
            </span>
            <p className="mt-4 text-lg font-medium" style={{ color: '#475569' }}>
              {isSearching ? 'No setups matched your search' : 'No setups yet. Be the first to share one!'}
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
            {displayedSetups.map((setup) => (
              <SetupCard key={setup.id} setup={setup} toggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ExplorePage;
