import React from "react";
import { Mail } from "lucide-react";
import GoogleAuthButton from "../GoogleAuthButton";

export const SignupStep1Email = ({
  email,
  setEmail,
  clearError,
  handleSendOtp,
  handleGoogleSuccess,
  loading,
  inputBase,
  inputStyle,
  onFocus,
  onBlur,
}) => (
  <>
    <form onSubmit={handleSendOtp} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="signup-email" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
          Email Address
        </label>
        <input
          id="signup-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
          }}
          placeholder="name@example.com"
          className={inputBase}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#0050cb")}
        onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#0066ff")}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }} />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Mail size={16} />
            <span>Continue with email</span>
          </>
        )}
      </button>
    </form>

    <div className="flex items-center my-6 gap-4">
      <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
      <span className="text-[12px]" style={{ color: "#727687" }}>or</span>
      <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
    </div>

    <GoogleAuthButton onSuccess={handleGoogleSuccess} disabled={loading} />
  </>
);
