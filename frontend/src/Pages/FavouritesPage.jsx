import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import ShareMenu from '../components/ShareMenu';

const FavoriteCard = ({ setup, isRemoving, onRemove, onShare }) => {
  return (
    <div
      className={`break-inside-avoid mb-4 relative group transition-all duration-300 ease-out hover:scale-[1.02] hover:drop-shadow-xl ${
        isRemoving ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      <Link to={`/setup/${setup.id}`} className="block relative overflow-hidden rounded-2xl">
        <img
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          alt={setup.title}
          src={setup.image}
          loading="lazy"
        />

        {/* Subtle shade overlay on hover */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Remove Favorite button — top right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(setup.id);
          }}
          className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10 active:scale-95 transition-all duration-200"
          style={{ backgroundColor: '#e11d48', color: '#ffffff' }}
          aria-label="Remove from saved"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            favorite
          </span>
        </button>

        {/* Share button — bottom right */}
        <button
          onClick={(e) => onShare(e, setup)}
          className="absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-95 z-10"
          style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#0F172A' }}
          aria-label="Share"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            share
          </span>
        </button>

        {/* Gradient overlay with setup title & author */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-14 pb-4 pl-4 pr-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-white font-semibold text-base leading-tight drop-shadow">{setup.title}</p>
          <p className="text-white/80 text-sm mt-0.5 drop-shadow">by {setup.author}</p>
        </div>
      </Link>
    </div>
  );
};

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

  if (loading) {
    return (
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] mb-8 px-2" style={{ color: '#0F172A' }}>
            My Favourites
          </h1>
          <div className="flex justify-center items-center h-40">
            <div className="flex items-center gap-3" style={{ color: '#727687' }}>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" style={{ color: '#0066ff' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 px-2">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]" style={{ color: '#0F172A' }}>
            My Favourites
          </h1>
          <p className="text-base font-normal leading-normal mt-2" style={{ color: '#475569' }}>
            Setups you've saved for inspiration.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: '#E2E8F0' }}>
              favorite
            </span>
            <p className="text-base" style={{ color: '#727687' }}>
              No favourites yet. Start exploring setups to add some!
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
            {favorites.map((setup) => (
              <FavoriteCard
                key={setup.id}
                setup={setup}
                isRemoving={removingId === setup.id}
                onRemove={removeFavorite}
                onShare={handleShare}
              />
            ))}
          </div>
        )}

        {/* Standardized Share Modal */}
        {activeShareSetup && <ShareMenu setup={activeShareSetup} onClose={closeShare} />}
      </div>
    </main>
  );
};

export default FavouritesPage;
