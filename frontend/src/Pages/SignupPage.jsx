import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

const inputBase = "w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all";
const inputStyle = { backgroundColor: "#ffffff", border: "1px solid #E2E8F0", color: "#0F172A" };
const onFocus = (e) => { e.target.style.borderColor = "#0050cb"; e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)"; };
const onBlur  = (e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

// Step indicator dots
function Steps({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="rounded-full transition-all duration-300"
          style={{
            width: s === current ? "24px" : "8px",
            height: "8px",
            backgroundColor: s <= current ? "#0066ff" : "#E2E8F0",
          }} />
      ))}
    </div>
  );
}

export default function SignupPage() {
  const { signupSendOtp, signupVerifyOtp, signupComplete, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const startCountdown = (seconds = 60) => {
    clearInterval(timerRef.current);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const clearError = () => setError("");

  // Step 1 — send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupSendOtp(email.trim().toLowerCase());
      setStep(2);
      startCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    clearError();
    try {
      await signupSendOtp(email.trim().toLowerCase());
      startCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await signupVerifyOtp(email.trim().toLowerCase(), otp.trim());
      setSignupToken(token);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — complete signup
  const handleComplete = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await signupComplete(signupToken, form.username.trim(), form.password);
      navigate("/explore", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = {
    1: { heading: "Create an account", sub: "Start by entering your email address." },
    2: { heading: "Check your email", sub: `We sent a 6-digit code to ${email}` },
    3: { heading: "Almost there", sub: "Set your username and password." },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>

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

          <Steps current={step} />

          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold mb-1" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>
              {stepTitles[step].heading}
            </h1>
            <p className="text-sm font-light" style={{ color: "#475569" }}>{stepTitles[step].sub}</p>
            {step === 2 && (
              <p className="text-xs mt-1" style={{ color: "#ca8a04" }}>Check your spam folder if you don't see it.</p>
            )}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-2 rounded-lg border text-sm"
              style={{ backgroundColor: "rgba(186,26,26,0.08)", borderColor: "rgba(186,26,26,0.2)", color: "#ba1a1a" }}>
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="signup-email" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
                    Email Address
                  </label>
                  <input id="signup-email" type="email" required autoComplete="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    placeholder="name@example.com" className={inputBase} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#0050cb")}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#0066ff")}
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />Sending...</>
                    : <><Mail size={16} />Continue with email</>}
                </button>
              </form>

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
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
                  Verification code
                </label>
                <input type="text" inputMode="numeric" maxLength={6} required value={otp}
                  onChange={(e) => { setOtp(e.target.value); clearError(); }}
                  placeholder="000000"
                  className={`${inputBase} tracking-[0.5em] text-center`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#0050cb")}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#0066ff")}
              >
                {loading
                  ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />Verifying...</div>
                  : "Verify email"}
              </button>

              <div className="flex flex-col items-center gap-2 pt-1">
                {countdown > 0 ? (
                  <p className="text-[13px]" style={{ color: "#727687" }}>
                    Resend code in <span style={{ color: "#0050cb", fontWeight: 600 }}>{countdown}s</span>
                  </p>
                ) : (
                  <button type="button" onClick={handleResendOtp} disabled={loading}
                    className="text-[13px] font-semibold transition-colors hover:underline disabled:opacity-50"
                    style={{ color: "#0050cb" }}>
                    {loading ? "Sending..." : "Resend code"}
                  </button>
                )}
                <button type="button" onClick={() => { setStep(1); setOtp(""); clearError(); clearInterval(timerRef.current); }}
                  className="text-[13px] transition-colors hover:underline" style={{ color: "#727687" }}>
                  ← Use a different email
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Username + Password ── */}
          {step === 3 && (
            <form onSubmit={handleComplete} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="signup-username" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
                  Username
                </label>
                <input id="signup-username" type="text" required autoComplete="username" value={form.username}
                  onChange={(e) => { setForm(p => ({ ...p, username: e.target.value })); clearError(); }}
                  placeholder="yourname" className={inputBase} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div className="space-y-1">
                <label htmlFor="signup-password" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
                  Password
                </label>
                <div className="relative">
                  <input id="signup-password" type={showPwd ? "text" : "password"} required autoComplete="new-password" value={form.password}
                    onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); clearError(); }}
                    placeholder="Min. 8 characters" className={`${inputBase} pr-10`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-0 inset-y-0 px-3 flex items-center transition-colors" style={{ color: "#727687" }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="signup-confirm" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
                  Confirm password
                </label>
                <input id="signup-confirm" type={showPwd ? "text" : "password"} required autoComplete="new-password" value={form.confirm}
                  onChange={(e) => { setForm(p => ({ ...p, confirm: e.target.value })); clearError(); }}
                  placeholder="••••••••" className={inputBase}
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

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#0050cb")}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#0066ff")}
              >
                {loading
                  ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />Creating account...</div>
                  : "Create account"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-light" style={{ color: "#475569" }}>
            Already have an account?{" "}
            <Link to="/login" className="text-[13px] font-semibold hover:underline" style={{ color: "#0050cb" }}>Sign in</Link>
          </p>
        </div>
      </main>

    </div>
  );
}
