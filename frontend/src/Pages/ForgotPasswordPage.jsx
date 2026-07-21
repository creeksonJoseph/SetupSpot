import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Eye, EyeOff, Zap } from 'lucide-react';

const API = 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (!res.ok) throw new Error('Something went wrong');
      setEmail(cleanEmail);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = form.otp.trim();
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp, new_password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed');
      navigate('/login', { state: { message: 'Password reset! Sign in with your new password.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">SetupSpot</span>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {step === 1 ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-1">Forgot password?</h1>
              <p className="text-gray-400 text-sm mb-8">We'll send a 6-digit code to your email.</p>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-email" className="text-gray-300 text-sm font-medium">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail size={18} />Send code</>}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Remember it?{' '}
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-white text-2xl font-bold mb-1">Enter your code</h1>
              <p className="text-gray-400 text-sm mb-1">We sent a 6-digit code to <span className="text-white">{email}</span></p>
              <p className="text-yellow-500/80 text-xs mb-8">Check your spam folder if you don't see it.</p>

              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-300 text-sm font-medium">Verification code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={form.otp}
                    onChange={(e) => { setForm(p => ({ ...p, otp: e.target.value })); setError(''); }}
                    placeholder="000000"
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm tracking-[0.5em] text-center focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-300 text-sm font-medium">New password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                      placeholder="Min. 8 characters"
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-300 text-sm font-medium">Confirm password</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(e) => { setForm(p => ({ ...p, confirm: e.target.value })); setError(''); }}
                    placeholder="••••••••"
                    className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all ${
                      form.confirm && form.password !== form.confirm
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500'
                        : 'border-white/10 focus:border-violet-500 focus:ring-violet-500'
                    }`}
                  />
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound size={18} />Reset password</>}
                </button>

                <button type="button" onClick={() => { setStep(1); setError(''); }} className="text-gray-500 hover:text-gray-300 text-sm text-center transition-colors">
                  ← Use a different email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
