import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSetups } from '../hooks/useSetups';
import { useAuth } from '../context/AuthContext';
import TypewriterText from '../components/TypewriterText';
import SearchBar from '../components/SearchBar';
import ShareMenu from '../components/ShareMenu';

const SetupCard = ({ setup, toggleFavorite }) => {
  const { auth } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth) {
      window.location.href = '/login';
      return;
    }
    // Spring-bounce pulse so the user knows the tap registered
    setSaveAnimating(true);
    setTimeout(() => setSaveAnimating(false), 350);
    toggleFavorite(setup.id, setup.isFavorited);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/setup/${setup.id}`;
    const shareData = {
      title: setup.title,
      text: `Check out this setup: ${setup.title} by ${setup.author}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { /* user dismissed */ }
    } else {
      setShareOpen((v) => !v);
    }
  };

  return (
    <>
      <div className="break-inside-avoid mb-4 relative group transition-transform duration-300 ease-out hover:scale-[1.02] hover:drop-shadow-xl">
        <Link to={`/setup/${setup.id}`} className="block relative overflow-hidden rounded-2xl">
          <img
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            alt={setup.title}
            src={setup.image}
            loading="lazy"
          />

          {/* Unsplash-style subtle dark/grey shade overlay on hover */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Save button — top right, icon only */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10"
            style={{
              backgroundColor: setup.isFavorited ? '#e11d48' : '#ffffff',
              color: setup.isFavorited ? '#ffffff' : '#0F172A',
              transform: saveAnimating ? 'scale(1.4)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background-color 0.2s, color 0.2s, opacity 0.2s',
            }}
            aria-label={setup.isFavorited ? 'Remove from saved' : 'Save'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {setup.isFavorited ? 'favorite' : 'bookmark'}
            </span>
          </button>

          {/* Share button — bottom right, icon only */}
          <button
            onClick={handleShare}
            className="absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-95 z-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#0F172A' }}
            aria-label="Share"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
          </button>

          {/* Gradient overlay with setup title & author */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-14 pb-4 pl-4 pr-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-white font-semibold text-base leading-tight drop-shadow">{setup.title}</p>
            <p className="text-white/80 text-sm mt-0.5 drop-shadow">by {setup.author}</p>
          </div>
        </Link>
      </div>

      {/* Standardized Share Modal */}
      {shareOpen && <ShareMenu setup={setup} onClose={() => setShareOpen(false)} />}
    </>
  );
};

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
