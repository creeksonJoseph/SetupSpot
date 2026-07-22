import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { usePasswordReset } from '../hooks/usePasswordReset';

const inputBase = "w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all";
const inputStyle = { backgroundColor: "#ffffff", border: "1px solid #E2E8F0", color: "#0F172A" };
const onFocus = (e) => { e.target.style.borderColor = "#0050cb"; e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)"; };
const onBlur  = (e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

export default function ForgotPasswordPage() {
  const { step, setStep, email, setEmail, form, setForm, showPwd, setShowPwd, loading, error, setError, countdown, handleSendOtp, handleResendOtp, handleReset } = usePasswordReset();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24 relative overflow-hidden"
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

          {step === 1 ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-semibold mb-1" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>Forgot password?</h1>
                <p className="text-sm font-light" style={{ color: "#475569" }}>We'll send a 6-digit code to your email.</p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 p-2 rounded-lg border text-sm" style={{ backgroundColor: "rgba(186,26,26,0.08)", borderColor: "rgba(186,26,26,0.2)", color: "#ba1a1a" }}>
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="forgot-email" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Email Address</label>
                  <input id="forgot-email" type="email" required autoComplete="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="name@example.com" className={inputBase} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#0050cb")}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#0066ff")}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />
                      Sending...
                    </div>
                  ) : <><Mail size={16} />Send code</>}
                </button>
              </form>

              <p className="text-center text-sm font-light mt-6" style={{ color: "#475569" }}>
                Remember it?{" "}
                <Link to="/login" className="text-[13px] font-semibold hover:underline" style={{ color: "#0050cb" }}>Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-semibold mb-1" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>Enter your code</h1>
                <p className="text-sm font-light mb-1" style={{ color: "#475569" }}>
                  We sent a 6-digit code to <span style={{ color: "#0F172A", fontWeight: 600 }}>{email}</span>
                </p>
                <p className="text-xs" style={{ color: "#ca8a04" }}>Check your spam folder if you don't see it.</p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 p-2 rounded-lg border text-sm" style={{ backgroundColor: "rgba(186,26,26,0.08)", borderColor: "rgba(186,26,26,0.2)", color: "#ba1a1a" }}>
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                {/* OTP */}
                <div className="space-y-1">
                  <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Verification code</label>
                  <input type="text" inputMode="numeric" maxLength={6} required value={form.otp}
                    onChange={(e) => { setForm(p => ({ ...p, otp: e.target.value })); setError(''); }}
                    placeholder="000000"
                    className={`${inputBase} tracking-[0.5em] text-center`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                {/* New password */}
                <div className="space-y-1">
                  <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>New password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} required autoComplete="new-password" value={form.password}
                      onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                      placeholder="Min. 8 characters" className={`${inputBase} pr-10`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-0 inset-y-0 px-3 flex items-center transition-colors" style={{ color: "#727687" }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1">
                  <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Confirm password</label>
                  <input type={showPwd ? 'text' : 'password'} required autoComplete="new-password" value={form.confirm}
                    onChange={(e) => { setForm(p => ({ ...p, confirm: e.target.value })); setError(''); }}
                    placeholder="••••••••" className={inputBase}
                    style={{ ...inputStyle, borderColor: form.confirm && form.password !== form.confirm ? "#ba1a1a" : "#E2E8F0" }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#0050cb")}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#0066ff")}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />
                      Resetting...
                    </div>
                  ) : "Reset password"}
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
                  <button type="button" onClick={() => { setStep(1); setError(''); }}
                    className="text-[13px] transition-colors hover:underline" style={{ color: "#727687" }}>
                    ← Use a different email
                  </button>
                </div>
            </>
          )}
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
