import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/users/1');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSetup = async (setupId) => {
    try {
      const response = await fetch(`http://localhost:5000/setups/${setupId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove setup from local state
        setUser(prevUser => ({
          ...prevUser,
          setups: prevUser.setups.filter(setup => setup.id !== setupId)
        }));
      }
    } catch (error) {
      console.error('Error deleting setup:', error);
    }
  };

  if (loading) {
    return (
      <main className="flex-1">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">User not found</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="flex flex-col items-center justify-center gap-4 pt-12 md:pt-20 pb-3">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/50 text-4xl">
              person
            </span>
          </div>
          <h1 className="text-white tracking-light text-3xl font-bold leading-tight">@{user.username}</h1>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-white/70 hover:text-white hover:bg-white/10 text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </div>
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-10 md:pt-16">Your Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {user.setups.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/70">No setups posted yet</p>
          </div>
        ) : (
          user.setups.map((setup) => (
            <div key={setup.id} className="group relative overflow-hidden rounded-lg">
              <Link to={`/post/${setup.id}`} className="block">
                <div className={`bg-cover bg-center flex flex-col justify-end p-4 h-full w-full transition-transform duration-300 ease-in-out group-hover:scale-105 ${setup.aspectRatio}`} style={{backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url("${setup.image}")`}}>
                  <p className="text-white text-base font-bold leading-tight w-full line-clamp-3">{setup.title}</p>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  deleteSetup(setup.id);
                }}
                className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                title="Delete setup"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default AccountPage;