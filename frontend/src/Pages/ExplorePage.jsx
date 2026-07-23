import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSetups } from '../hooks/useSetups';
import { useAuth } from '../context/AuthContext';
import TypewriterText from '../components/TypewriterText';
import SearchBar from '../components/SearchBar';

const ShareMenu = ({ setup, onClose }) => {
  const shareUrl = `${window.location.origin}/post/${setup.id}`;
  const shareText = `Check out this setup: ${setup.title} by ${setup.author}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Link copied to clipboard!');
    }
    onClose();
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: setup.title, text: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
    onClose();
  };

  const openWindow = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-12 left-2 z-50 w-48 rounded-xl shadow-2xl bg-white border border-gray-200 overflow-hidden">
        <button
          onClick={nativeShare}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>share</span>
          Share via…
        </button>
        <button
          onClick={() => openWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`)}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tag</span>
          Twitter / X
        </button>
        <button
          onClick={() => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>public</span>
          Facebook
        </button>
        <button
          onClick={copyLink}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>link</span>
          Copy link
        </button>
      </div>
    </>
  );
};

const SetupCard = ({ setup, toggleFavorite }) => {
  const { auth } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth) {
      window.location.href = '/login';
      return;
    }
    toggleFavorite(setup.id, setup.isFavorited);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShareOpen((v) => !v);
  };

  return (
    <div className="break-inside-avoid mb-4 relative group">
      <Link to={`/post/${setup.id}`} className="block relative overflow-hidden rounded-2xl">
        <img
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          alt={setup.title}
          src={setup.image}
          loading="lazy"
        />

        {/* Save button - top right */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: setup.isFavorited ? '#e11d48' : '#ffffff',
            color: setup.isFavorited ? '#ffffff' : '#0F172A',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {setup.isFavorited ? 'favorite' : 'bookmark'}
          </span>
          {setup.isFavorited ? 'Saved' : 'Save'}
        </button>

        {/* Share button - bottom left */}
        <button
          onClick={handleShare}
          className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#0F172A' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
          Share
        </button>

        {/* Share menu */}
        {shareOpen && <ShareMenu setup={setup} onClose={() => setShareOpen(false)} />}

        {/* Gradient overlay with title on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-12 pb-4 px-4">
          <p className="text-white font-semibold text-base leading-tight">{setup.title}</p>
          <p className="text-white/80 text-sm">by {setup.author}</p>
        </div>
      </Link>
    </div>
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

  const isSearching  = searchHits !== null;
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
        <div className="mb-8 px-2">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] min-h-[48px] flex items-center" style={{ color: '#0F172A' }}>
            <TypewriterText text="Explore Setups" />
          </h1>
          <p className="text-base font-normal leading-normal mt-2 mb-5" style={{ color: '#475569' }}>
            Discover and get inspired by amazing computer setups from around the world.
          </p>

          {/* Search bar — owns its own query state via useSearch hook */}
          <SearchBar onResults={handleSearchResults} />

          {/* Results label — shown when Algolia has returned results */}
          {isSearching && (
            <p className="mt-3 text-sm" style={{ color: '#64748B' }}>
              {displayedSetups.length > 0
                ? <><strong>{displayedSetups.length}</strong> result{displayedSetups.length !== 1 ? 's' : ''} found</>
                : <>No results found</>}
            </p>
          )}
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
