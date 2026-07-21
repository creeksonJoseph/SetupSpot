/**
 * SignupPage — email, username, password registration form.
 * On success navigates to /explore.
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function SignupPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.username, form.password);
      navigate("/explore", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center shadow-lg shadow-violet-500/20 overflow-hidden">
              <img
                src="/favicon_io/android-chrome-192x192.png"
                alt="SetupSpot logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              SetupSpot
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-white text-2xl font-bold mb-1">
            Create an account
          </h1>
          <p className="text-gray-400 text-sm mb-8">Share your setup</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signup-email"
                className="text-gray-300 text-sm font-medium"
              >
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signup-username"
                className="text-gray-300 text-sm font-medium"
              >
                Username
              </label>
              <input
                id="signup-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder="yourname"
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signup-password"
                className="text-gray-300 text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signup-confirm"
                className="text-gray-300 text-sm font-medium"
              >
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                name="confirm"
                type={showPwd ? "text" : "password"}
                required
                autoComplete="new-password"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-all ${
                  form.confirm && form.password !== form.confirm
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    : "border-white/10 focus:border-violet-500 focus:ring-violet-500"
                }`}
              />
            </div>

            {/* Password strength bar */}
            {form.password && (
              <div className="flex gap-1 h-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      form.password.length > i * 3
                        ? form.password.length >= 12
                          ? "bg-emerald-500"
                          : form.password.length >= 8
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full hover:text-violet-400 flex items-center justify-center gap-2  text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200  disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <GoogleAuthButton
            onSuccess={async (credential) => {
              setLoading(true);
              try {
                await googleLogin(credential);
                navigate("/explore", { replace: true });
              } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          />

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
