import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function SignupPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
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

  const inputStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #E2E8F0",
    color: "#0F172A",
  };
  const onFocus = (e) => { e.target.style.borderColor = "#0050cb"; e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)"; };
  const onBlur  = (e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 pb-24 relative overflow-hidden"
      style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      {/* Background watermark */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 z-0 select-none pointer-events-none w-screen text-center">
        <span className="font-black tracking-tight" style={{ fontSize: "14rem", color: "#0050cb", opacity: 0.09, lineHeight: 1 }}>
          SetupSpot
        </span>
      </div>

      <main className="w-full max-w-[420px] flex flex-col items-center relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <img src="/favicon_io/android-chrome-192x192.png" alt="SetupSpot logo" className="w-12 h-12 mb-2 rounded-lg object-contain" />
        </div>

        {/* Card */}
        <div className="w-full rounded-xl p-12 border" style={{ borderColor: "rgba(226,232,240,0.5)", backgroundColor: "rgba(255,255,255,0.25)" }}>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold mb-1" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>Create an account</h1>
            <p className="text-sm font-light" style={{ color: "#475569" }}>Share your setup</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-2 rounded-lg border text-sm" style={{ backgroundColor: "rgba(186,26,26,0.08)", borderColor: "rgba(186,26,26,0.2)", color: "#ba1a1a" }}>
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="signup-email" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Email Address</label>
              <input id="signup-email" name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange} placeholder="name@example.com"
                className="w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label htmlFor="signup-username" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Username</label>
              <input id="signup-username" name="username" type="text" required autoComplete="username" value={form.username} onChange={handleChange} placeholder="yourname"
                className="w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="signup-password" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Password</label>
              <div className="relative">
                <input id="signup-password" name="password" type={showPwd ? "text" : "password"} required autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                  className="w-full rounded-lg px-3 py-2 pr-10 text-sm font-light outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-0 inset-y-0 px-3 flex items-center transition-colors" style={{ color: "#727687" }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="signup-confirm" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Confirm Password</label>
              <input id="signup-confirm" name="confirm" type={showPwd ? "text" : "password"} required autoComplete="new-password" value={form.confirm} onChange={handleChange} placeholder="••••••••"
                className="w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all"
                style={{ ...inputStyle, borderColor: form.confirm && form.password !== form.confirm ? "#ba1a1a" : "#E2E8F0" }}
                onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="flex gap-1 h-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-1 rounded-full transition-all duration-300"
                    style={{ backgroundColor: form.password.length > i * 3 ? (form.password.length >= 12 ? "#15803D" : form.password.length >= 8 ? "#ca8a04" : "#ba1a1a") : "#E2E8F0" }} />
                ))}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#0050cb")}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#0066ff")}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />
                  Creating account...
                </div>
              ) : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 gap-4">
            <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
            <span className="text-[12px]" style={{ color: "#727687" }}>or</span>
            <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
          </div>

          <GoogleAuthButton
            onSuccess={async (credential) => {
              setLoading(true);
              try { await googleLogin(credential); navigate("/explore", { replace: true }); }
              catch (err) { setError(err.message); }
              finally { setLoading(false); }
            }}
            disabled={loading}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-light" style={{ color: "#475569" }}>
            Already have an account?{" "}
            <Link to="/login" className="text-[13px] font-semibold hover:underline" style={{ color: "#0050cb" }}>Sign in</Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full flex flex-col md:flex-row justify-between items-center px-12 py-4 gap-4 border-t z-40"
        style={{ borderColor: "#E2E8F0", backgroundColor: "#f7f9fb", opacity: 0.9 }}>
        <div className="text-[12px]" style={{ color: "#475569" }}>© 2024 SetupSpot. All rights reserved.</div>
        <nav className="flex gap-6">
          {["About", "Privacy Policy", "Terms of Service", "Help Center"].map((item) => (
            <a key={item} href="#" className="text-[12px] transition-colors hover:underline" style={{ color: "#475569" }}
              onMouseEnter={(e) => (e.target.style.color = "#0050cb")} onMouseLeave={(e) => (e.target.style.color = "#475569")}>{item}</a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
