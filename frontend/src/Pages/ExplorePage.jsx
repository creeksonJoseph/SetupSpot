import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthFetch } from '../hooks/useAuthFetch';

const ExplorePage = () => {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const authFetch = useAuthFetch();

  const fetchSetups = () => {
    authFetch(`http://127.0.0.1:5000/setups`)
      .then(res => res.json())
      .then(data => {
        setSetups(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching setups:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSetups();
  }, []);

  const toggleFavorite = async (setupId, isFavorited) => {
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await authFetch('http://127.0.0.1:5000/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setup_id: setupId
        })
      });

      if (response.ok) {
        // Update local state
        setSetups(prevSetups => 
          prevSetups.map(setup => 
            setup.id === setupId 
              ? { ...setup, isFavorited: !isFavorited }
              : setup
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl flex justify-center items-center h-64">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Explore Setups</h1>
          <p className="text-gray-400 text-base font-normal leading-normal mt-2">Discover and get inspired by amazing computer setups from around the world.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {setups.map((setup) => (
            <Link key={setup.id} to={`/post/${setup.id}`} className="flex flex-col gap-3 group">
              <div className="relative overflow-hidden rounded-xl">
                <img className={`w-full h-auto object-cover ${setup.aspectRatio} transition-transform duration-300 group-hover:scale-105`} alt={setup.title} src={setup.image}/>
              </div>
              <div className="flex justify-between items-start px-2">
                <div>
                  <p className="text-white text-base font-medium leading-normal">{setup.title}</p>
                  <p className="text-gray-500 text-sm font-normal leading-normal">by {setup.author}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(setup.id, setup.isFavorited);
                  }}
                  className={`transition-colors duration-200 ${
                    setup.isFavorited 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
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