import React from "react";
import { Link } from "react-router-dom";
import { useSignupFlow } from "../hooks/useSignupFlow";
import { SignupStep1Email } from "../components/auth/SignupStep1Email";
import { SignupStep2Otp } from "../components/auth/SignupStep2Otp";
import { SignupStep3Profile } from "../components/auth/SignupStep3Profile";

const inputBase = "w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all";
const inputStyle = { backgroundColor: "#ffffff", border: "1px solid #E2E8F0", color: "#0F172A" };
const onFocus = (e) => { e.target.style.borderColor = "#0050cb"; e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)"; };
const onBlur  = (e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

// Step indicator dots
function Steps({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className="rounded-full transition-all duration-300"
          style={{
            width: s === current ? "24px" : "8px",
            height: "8px",
            backgroundColor: s <= current ? "#0066ff" : "#E2E8F0",
          }}
        />
      ))}
    </div>
  );
}

export default function SignupPage() {
  const {
    step,
    email,
    setEmail,
    otp,
    setOtp,
    form,
    setForm,
    showPwd,
    setShowPwd,
    loading,
    error,
    countdown,
    clearError,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleComplete,
    handleGoogleSuccess,
    resetToEmail,
  } = useSignupFlow();

  const stepTitles = {
    1: { heading: "Create an account", sub: "Start by entering your email address." },
    2: { heading: "Check your email", sub: `We sent a 6-digit code to ${email}` },
    3: { heading: "Almost there", sub: "Set your username and password." },
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 mb-16 relative overflow-hidden font-sans"
      style={{ backgroundColor: "#f7f9fb" }}
    >
      {/* Background watermark */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 z-0 select-none pointer-events-none w-screen text-center">
        <span
          className="font-black tracking-tight"
          style={{ fontSize: "14rem", color: "#0050cb", opacity: 0.09, lineHeight: 1 }}
        >
          SetupSpot
        </span>
      </div>

      <main className="w-full max-w-[420px] flex flex-col items-center relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <img
            src="/favicon_io/android-chrome-192x192.png"
            alt="SetupSpot logo"
            className="w-12 h-12 mb-2 rounded-lg object-contain"
          />
        </div>

        {/* Form Card */}
        <div
          className="w-full rounded-xl p-12 border shadow-xs"
          style={{ borderColor: "rgba(226,232,240,0.5)", backgroundColor: "rgba(255,255,255,0.85)" }}
        >
          <Steps current={step} />

          <div className="text-center mb-6">
            <h1
              className="text-3xl font-semibold mb-1"
              style={{ color: "#0F172A", letterSpacing: "-0.02em" }}
            >
              {stepTitles[step].heading}
            </h1>
            <p className="text-sm font-light" style={{ color: "#475569" }}>
              {stepTitles[step].sub}
            </p>
            {step === 2 && (
              <p className="text-xs mt-1" style={{ color: "#ca8a04" }}>
                Check your spam folder if you don't see it.
              </p>
            )}
          </div>

          {error && (
            <div
              className="mb-4 flex items-center gap-2 p-2 rounded-lg border text-sm"
              style={{
                backgroundColor: "rgba(186,26,26,0.08)",
                borderColor: "rgba(186,26,26,0.2)",
                color: "#ba1a1a",
              }}
            >
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {step === 1 && (
            <SignupStep1Email
              email={email}
              setEmail={setEmail}
              clearError={clearError}
              handleSendOtp={handleSendOtp}
              handleGoogleSuccess={handleGoogleSuccess}
              loading={loading}
              inputBase={inputBase}
              inputStyle={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          )}

          {step === 2 && (
            <SignupStep2Otp
              otp={otp}
              setOtp={setOtp}
              clearError={clearError}
              handleVerifyOtp={handleVerifyOtp}
              handleResendOtp={handleResendOtp}
              resetToEmail={resetToEmail}
              countdown={countdown}
              loading={loading}
              inputBase={inputBase}
              inputStyle={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          )}

          {step === 3 && (
            <SignupStep3Profile
              form={form}
              setForm={setForm}
              showPwd={showPwd}
              setShowPwd={setShowPwd}
              clearError={clearError}
              handleComplete={handleComplete}
              loading={loading}
              inputBase={inputBase}
              inputStyle={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-light" style={{ color: "#475569" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[13px] font-semibold hover:underline"
              style={{ color: "#0050cb" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
