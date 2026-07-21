import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

const AccountPage = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pwdStep, setPwdStep] = useState(1); // 1 = request otp, 2 = enter otp + new password
  const [pwdForm, setPwdForm] = useState({ otp: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

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

  const handleRequestChangeOtp = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdLoading(true);
    try {
      const res = await fetch(`${API}/auth/send-change-otp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send code');
      setPwdStep(2);
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (pwdForm.next !== pwdForm.confirm) return setPwdError('Passwords do not match');
    if (pwdForm.next.length < 8) return setPwdError('Password must be at least 8 characters');
    setPwdLoading(true);
    try {
      const res = await fetch(`${API}/users/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.access_token}`,
        },
        body: JSON.stringify({ otp: pwdForm.otp, new_password: pwdForm.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to change password');
      setPwdSuccess('Password changed successfully!');
      setPwdForm({ otp: '', next: '', confirm: '' });
      setPwdStep(1);
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
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

      {/* Change Password */}
      <div className="px-4 pb-12 max-w-md">
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 pt-4">
          Change Password
        </h2>

        {pwdSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm mb-3">{pwdSuccess}</div>
        )}

        {pwdStep === 1 ? (
          <form onSubmit={handleRequestChangeOtp} className="flex flex-col gap-3">
            <p className="text-gray-400 text-sm">We'll send a 6-digit code to <span className="text-white">{user.email}</span> to verify it's you.</p>
            {pwdError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{pwdError}</div>}
            <button
              type="submit"
              disabled={pwdLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwdLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound size={16} />Send verification code</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <p className="text-yellow-500/80 text-xs">Code sent — check your spam folder if you don't see it.</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-300 text-sm font-medium">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={pwdForm.otp}
                onChange={(e) => { setPwdForm(p => ({ ...p, otp: e.target.value })); setPwdError(''); }}
                placeholder="000000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm tracking-[0.5em] text-center focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="New password (min. 8 characters)"
                required
                value={pwdForm.next}
                onChange={(e) => { setPwdForm(p => ({ ...p, next: e.target.value })); setPwdError(''); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Confirm new password"
              required
              value={pwdForm.confirm}
              onChange={(e) => { setPwdForm(p => ({ ...p, confirm: e.target.value })); setPwdError(''); }}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 transition-all ${
                pwdForm.confirm && pwdForm.next !== pwdForm.confirm
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500'
                  : 'border-white/10 focus:border-violet-500 focus:ring-violet-500'
              }`}
            />
            {pwdError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{pwdError}</div>}
            <button
              type="submit"
              disabled={pwdLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwdLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound size={16} />Update password</>}
            </button>
            <button type="button" onClick={() => { setPwdStep(1); setPwdError(''); }} className="text-gray-500 hover:text-gray-300 text-sm text-center transition-colors">
              ← Resend code
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default AccountPage;