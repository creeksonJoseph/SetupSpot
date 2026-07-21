import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { usePasswordReset } from '../hooks/usePasswordReset';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const queryEmail = searchParams.get('email') || '';
  const queryOtp = searchParams.get('otp') || '';

  const {
    form,
    setForm,
    showPwd,
    setShowPwd,
    loading,
    error,
    setError,
    handleReset,
  } = usePasswordReset();

  const onSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');

    if (!token && (!queryEmail || !queryOtp)) {
      return setError('Invalid or missing reset link.');
    }

    const payload = token
      ? { token, new_password: form.password }
      : { email: queryEmail, otp: queryOtp, new_password: form.password };

    handleReset(null, payload);
  };

  if (!token && (!queryEmail || !queryOtp)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-red-400 mb-4">Invalid or missing reset link.</p>
          <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center shadow-lg shadow-violet-500/20 overflow-hidden">
              <img src="/favicon_io/android-chrome-192x192.png" alt="SetupSpot logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">SetupSpot</span>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-white text-2xl font-bold mb-1">Set new password</h1>
          <p className="text-gray-400 text-sm mb-8">Must be at least 8 characters.</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-password" className="text-gray-300 text-sm font-medium">
                New password
              </label>
              <div className="relative">
                <input
                  id="reset-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                  placeholder="Min. 8 characters"
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-confirm" className="text-gray-300 text-sm font-medium">
                Confirm password
              </label>
              <input
                id="reset-confirm"
                name="confirm"
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={18} />
                  Reset password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
