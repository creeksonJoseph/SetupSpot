import React from 'react';
import { Link } from 'react-router-dom';
import { useSetups } from '../hooks/useSetups';

const ExplorePage = () => {
  const { setups, loading, toggleFavorite } = useSetups();

  if (loading) {
    return (
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl flex justify-center items-center h-64">
          <div className="flex items-center gap-3" style={{ color: "#727687" }}>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: "#0066ff" }}>
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
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]" style={{ color: "#0F172A" }}>Explore Setups</h1>
          <p className="text-base font-normal leading-normal mt-2" style={{ color: "#475569" }}>Discover and get inspired by amazing computer setups from around the world.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {setups.map((setup) => (
            <Link key={setup.id} to={`/post/${setup.id}`} className="flex flex-col gap-3 group">
              <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: "#E2E8F0" }}>
                <img className={`w-full h-auto object-cover ${setup.aspectRatio || ''} transition-transform duration-300 group-hover:scale-105`} alt={setup.title} src={setup.image}/>
              </div>
              <div className="flex justify-between items-start px-2">
                <div>
                  <p className="text-base font-medium leading-normal" style={{ color: "#0F172A" }}>{setup.title}</p>
                  <p className="text-sm font-normal leading-normal" style={{ color: "#727687" }}>by {setup.author}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(setup.id, setup.isFavorited);
                  }}
                  className="transition-colors duration-200"
                  style={{ color: setup.isFavorited ? "#e11d48" : "#727687" }}
                >
                  <span className="material-symbols-outlined">
                    {setup.isFavorited ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ExplorePage;