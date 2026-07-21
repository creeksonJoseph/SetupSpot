import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FavouritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('http://localhost:5000/favorites/list?user_id=1');
      const data = await response.json();
      
      // Transform backend data to match frontend format
      const transformedData = data.map(setup => ({
        id: setup.id,
        title: setup.name,
        image: setup.image_url,
        aspectRatio: setup.aspect_ratio || 'aspect-[4/5]',
        author: 'Joseph' // Default author since we're using user_id=1
      }));
      
      setFavorites(transformedData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (setupId) => {
    try {
      await fetch('http://localhost:5000/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          setup_id: setupId
        })
      });
      
      // Remove from local state
      setFavorites(favorites.filter(fav => fav.id !== setupId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 px-2">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Favourites</h1>
          </div>
          <div className="text-white">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 px-2">
          <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Favourites</h1>
        </div>
        {favorites.length === 0 ? (
          <div className="text-white text-center py-8">
            <p>No favorites yet. Start exploring setups to add some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favorites.map((setup) => (
              <Link key={setup.id} to={`/post/${setup.id}`} className="group flex flex-col gap-3 pb-3 cursor-pointer">
                <div className={`relative w-full bg-center bg-no-repeat ${setup.aspectRatio} bg-cover rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105`} style={{backgroundImage: `url("${setup.image}")`}}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(setup.id);
                    }}
                    className="absolute top-3 right-3 flex items-center justify-center h-8 w-8 rounded-full bg-black/50 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined !text-xl">favorite</span>
                  </button>
                </div>
                <div>
                  <p className="text-white text-base font-medium leading-normal">{setup.title}</p>
                  <p className="text-[#A0A0A0] text-sm font-normal leading-normal">by {setup.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default FavouritesPage;