import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAccount } from '../hooks/useAccount';

const inputBase = "w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all";
const inputStyle = { backgroundColor: "#ffffff", border: "1px solid #E2E8F0", color: "#0F172A" };
const onFocus = (e) => { e.target.style.borderColor = "#0050cb"; e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)"; };
const onBlur  = (e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

const AccountPage = () => {
  const {
    user, loading,
    pwdStep, setPwdStep,
    pwdForm, setPwdForm,
    showPwd, setShowPwd,
    pwdLoading, pwdError, setPwdError,
    pwdSuccess, pwdCountdown,
    handleRequestChangeOtp, handleResendChangeOtp, handleChangePassword,
    deleteSetup, handleLogout,
  } = useAccount();

  if (loading) {
    return (
      <main className="flex-1 flex justify-center items-center h-64">
        <div className="flex items-center gap-3" style={{ color: "#727687" }}>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" style={{ color: "#0066ff" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
          </svg>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 flex justify-center items-center h-64">
        <p className="text-sm" style={{ color: "#727687" }}>User not found.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="mx-auto max-w-4xl">

        {/* Profile header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="size-16 rounded-full flex items-center justify-center border" style={{ backgroundColor: "#f7f9fb", borderColor: "#E2E8F0" }}>
            <span className="material-symbols-outlined text-4xl" style={{ color: "#727687" }}>person</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0F172A" }}>@{user.username}</h1>
            <p className="text-sm" style={{ color: "#727687" }}>{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg h-10 px-4 text-sm font-semibold transition-colors border"
            style={{ color: "#475569", borderColor: "#E2E8F0", backgroundColor: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Your Posts */}
        <h2 className="text-xl font-bold mb-4" style={{ color: "#0F172A" }}>Your Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {user.setups.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <span className="material-symbols-outlined text-5xl mb-3 block" style={{ color: "#E2E8F0" }}>photo_camera</span>
              <p className="text-sm" style={{ color: "#727687" }}>No setups posted yet.</p>
            </div>
          ) : (
            user.setups.map((setup) => (
              <div key={setup.id} className="group relative overflow-hidden rounded-xl border" style={{ borderColor: "#E2E8F0" }}>
                <Link to={`/post/${setup.id}`} className="block">
                  <div
                    className="bg-cover bg-center flex flex-col justify-end p-4 h-48 w-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                    style={{ backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%), url("${setup.image}")` }}
                  >
                    <p className="text-white text-base font-bold leading-tight w-full line-clamp-3">{setup.title}</p>
                  </div>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); deleteSetup(setup.id); }}
                  className="absolute top-3 right-3 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "#ba1a1a" }}
                  title="Delete setup"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Change Password */}
        <div className="max-w-md">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#0F172A" }}>Change Password</h2>

          {pwdSuccess && (
            <div className="mb-4 p-3 rounded-lg border text-sm" style={{ backgroundColor: "rgba(21,128,61,0.08)", borderColor: "rgba(21,128,61,0.2)", color: "#15803D" }}>
              {pwdSuccess}
            </div>
          )}

          {pwdStep === 1 ? (
            <form onSubmit={handleRequestChangeOtp} className="flex flex-col gap-3">
              <p className="text-sm" style={{ color: "#475569" }}>
                We'll send a 6-digit code to <span style={{ color: "#0F172A", fontWeight: 600 }}>{user.email}</span> to verify it's you.
              </p>
              {pwdError && (
                <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: "rgba(186,26,26,0.08)", borderColor: "rgba(186,26,26,0.2)", color: "#ba1a1a" }}>
                  {pwdError}
                </div>
              )}
              <button
                type="submit"
                disabled={pwdLoading}
                className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0066ff" }}
                onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0050cb")}
                onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0066ff")}
              >
                {pwdLoading
                  ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />
                  : <><KeyRound size={16} />Send verification code</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <p className="text-xs" style={{ color: "#ca8a04" }}>Code sent — check your spam folder if you don't see it.</p>

              {pwdError && (
                <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: "rgba(186,26,26,0.08)", borderColor: "rgba(186,26,26,0.2)", color: "#ba1a1a" }}>
                  {pwdError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Verification code</label>
                <input
                  type="text" inputMode="numeric" maxLength={6} required
                  value={pwdForm.otp}
                  onChange={(e) => { setPwdForm(p => ({ ...p, otp: e.target.value })); setPwdError(''); }}
                  placeholder="000000"
                  className={`${inputBase} tracking-[0.5em] text-center`}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>New password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} required
                    value={pwdForm.next}
                    onChange={(e) => { setPwdForm(p => ({ ...p, next: e.target.value })); setPwdError(''); }}
                    placeholder="Min. 8 characters"
                    className={`${inputBase} pr-10`}
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-0 inset-y-0 px-3 flex items-center" style={{ color: "#727687" }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>Confirm password</label>
                <input
                  type={showPwd ? 'text' : 'password'} required
                  value={pwdForm.confirm}
                  onChange={(e) => { setPwdForm(p => ({ ...p, confirm: e.target.value })); setPwdError(''); }}
                  placeholder="••••••••"
                  className={inputBase}
                  style={{ ...inputStyle, borderColor: pwdForm.confirm && pwdForm.next !== pwdForm.confirm ? "#ba1a1a" : "#E2E8F0" }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0066ff" }}
                onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0050cb")}
                onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0066ff")}
              >
                {pwdLoading
                  ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />
                  : <><KeyRound size={16} />Update password</>}
              </button>

              <div className="flex flex-col items-center gap-1 pt-1">
                {pwdCountdown > 0 ? (
                  <p className="text-[13px]" style={{ color: "#727687" }}>
                    Resend code in <span style={{ color: "#0050cb", fontWeight: 600 }}>{pwdCountdown}s</span>
                  </p>
                ) : (
                  <button type="button" onClick={handleResendChangeOtp} disabled={pwdLoading}
                    className="text-[13px] font-semibold hover:underline disabled:opacity-50" style={{ color: "#0050cb" }}>
                    {pwdLoading ? "Sending..." : "Resend code"}
                  </button>
                )}
                <button type="button" onClick={() => { setPwdStep(1); setPwdError(''); }}
                  className="text-[13px] hover:underline" style={{ color: "#727687" }}>
                  ← Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export default AccountPage;
