/**
 * LoginPage — email + password sign-in form.
 * On success navigates to the page the user was trying to access (or /explore).
 */
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/explore";
  const successMessage = location.state?.message || "";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 mb-16 relative overflow-hidden"
      style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      {/* Background watermark */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 z-0 select-none pointer-events-none w-screen text-center">
        <span
          className="font-black tracking-tight"
          style={{
            fontSize: "14rem",
            color: "#0050cb",
            opacity: 0.09,
            lineHeight: 1,
          }}
        >
          SetupSpot
        </span>
      </div>

      <main className="w-full max-w-[420px] flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-12">
          <img
            src="/favicon_io/android-chrome-192x192.png"
            alt="SetupSpot logo"
            className="w-12 h-12 mb-2 rounded-lg object-contain"
          />
        </div>

        {/* Login Card */}
        <div
          className="w-full rounded-xl p-12 border relative z-10"
          style={{ borderColor: "rgba(226,232,240,0.5)", backgroundColor: "rgba(255,255,255,0.25)" }}
        >
          {/* Heading */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl font-semibold mb-1"
              style={{ color: "#0F172A", letterSpacing: "-0.02em" }}
            >
              Welcome back
            </h1>
            <p className="text-sm font-light" style={{ color: "#475569" }}>
              Sign in to your account
            </p>
          </div>

          {/* Success banner */}
          {successMessage && (
            <div
              className="mb-4 flex items-center gap-2 p-2 rounded-lg border text-sm"
              style={{
                backgroundColor: "rgba(21,128,61,0.08)",
                borderColor: "rgba(21,128,61,0.2)",
                color: "#15803D",
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              {successMessage}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div
              className="mb-4 flex items-center gap-2 p-2 rounded-lg border text-sm"
              style={{
                backgroundColor: "rgba(186,26,26,0.08)",
                borderColor: "rgba(186,26,26,0.2)",
                color: "#ba1a1a",
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="login-email"
                className="block text-[13px] font-semibold"
                style={{ color: "#0F172A", letterSpacing: "0.02em" }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E2E8F0",
                  color: "#0F172A",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0050cb";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2E8F0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="login-password"
                className="block text-[13px] font-semibold"
                style={{ color: "#0F172A", letterSpacing: "0.02em" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3 py-2 pr-10 text-sm font-light outline-none transition-all"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E2E8F0",
                    color: "#0F172A",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0050cb";
                    e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-0 inset-y-0 px-3 flex items-center transition-colors"
                  style={{ color: "#727687" }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[12px] transition-all hover:underline"
                style={{ color: "#0050cb" }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
              onMouseEnter={(e) =>
                !loading && (e.target.style.backgroundColor = "#0050cb")
              }
              onMouseLeave={(e) =>
                !loading && (e.target.style.backgroundColor = "#0066ff")
              }
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: "rgba(248,247,255,0.3)",
                      borderTopColor: "#f8f7ff",
                    }}
                  />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 gap-4">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "#E2E8F0" }}
            />
            <span className="text-[12px]" style={{ color: "#727687" }}>
              or
            </span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "#E2E8F0" }}
            />
          </div>

          {/* Google */}
          <GoogleAuthButton
            onSuccess={async (credential) => {
              setLoading(true);
              try {
                await googleLogin(credential);
                navigate(from, { replace: true });
              } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          />
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <p className="text-sm font-light" style={{ color: "#475569" }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[13px] font-semibold hover:underline"
              style={{ color: "#0050cb" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </main>


    </div>
  );
}
