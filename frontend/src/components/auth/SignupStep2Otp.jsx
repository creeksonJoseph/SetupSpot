import React from "react";

export const SignupStep2Otp = ({
  otp,
  setOtp,
  clearError,
  handleVerifyOtp,
  handleResendOtp,
  resetToEmail,
  countdown,
  loading,
  inputBase,
  inputStyle,
  onFocus,
  onBlur,
}) => (
  <form onSubmit={handleVerifyOtp} className="space-y-4">
    <div className="space-y-1">
      <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
        Verification code
      </label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        required
        value={otp}
        onChange={(e) => {
          setOtp(e.target.value);
          clearError();
        }}
        placeholder="000000"
        className={`${inputBase} tracking-[0.5em] text-center`}
        style={inputStyle}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
      onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#0050cb")}
      onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#0066ff")}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />
          <span>Verifying...</span>
        </div>
      ) : (
        "Verify email"
      )}
    </button>

    <div className="flex flex-col items-center gap-2 pt-1">
      {countdown > 0 ? (
        <p className="text-[13px]" style={{ color: "#727687" }}>
          Resend code in <span style={{ color: "#0050cb", fontWeight: 600 }}>{countdown}s</span>
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={loading}
          className="text-[13px] font-semibold transition-colors hover:underline disabled:opacity-50"
          style={{ color: "#0050cb" }}
        >
          {loading ? "Sending..." : "Resend code"}
        </button>
      )}
      <button
        type="button"
        onClick={resetToEmail}
        className="text-[13px] transition-colors hover:underline"
        style={{ color: "#727687" }}
      >
        ← Use a different email
      </button>
    </div>
  </form>
);
