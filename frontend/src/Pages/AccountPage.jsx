import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

const AccountPage = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      setUser(await res.json());
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSetup = async (setupId) => {
    try {
      const res = await fetch(`${API}/setups/${setupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });
      if (res.ok) {
        setUser((prev) => ({
          ...prev,
          setups: prev.setups.filter((s) => s.id !== setupId),
        }));
      }
    } catch (err) {
      console.error('Error deleting setup:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
            <span className="material-symbols-outlined text-white/50 text-4xl">person</span>
          </div>
          <h1 className="text-white tracking-light text-3xl font-bold leading-tight">
            @{user.username}
          </h1>
          <button
            id="account-signout"
            onClick={handleLogout}
            className="flex items-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-transparent text-white/70 hover:text-white hover:bg-white/10 text-sm font-bold leading-normal tracking-wide transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-10 md:pt-16">
        Your Posts
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {user.setups.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/70">No setups posted yet</p>
          </div>
        ) : (
          user.setups.map((setup) => (
            <div key={setup.id} className="group relative overflow-hidden rounded-lg">
              <Link to={`/post/${setup.id}`} className="block">
                <div
                  className="bg-cover bg-center flex flex-col justify-end p-4 h-48 w-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%), url("${setup.image}")`,
                  }}
                >
                  <p className="text-white text-base font-bold leading-tight w-full line-clamp-3">
                    {setup.title}
                  </p>
                </div>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); deleteSetup(setup.id); }}
                className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                title="Delete setup"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default AccountPage;