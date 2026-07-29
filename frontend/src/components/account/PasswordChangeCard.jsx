import React from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";

export const PasswordChangeCard = ({
  user,
  pwdStep,
  setPwdStep,
  pwdForm,
  setPwdForm,
  showPwd,
  setShowPwd,
  pwdLoading,
  pwdError,
  setPwdError,
  pwdSuccess,
  pwdCountdown,
  handleRequestChangeOtp,
  handleResendChangeOtp,
  handleChangePassword,
}) => (
  <div
    className="rounded-2xl border p-6 md:p-8 shadow-sm max-w-lg mb-12"
    style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
  >
    <div className="flex items-center gap-3 mb-6">
      <div
        className="p-2.5 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,102,255,0.08)", color: "#0066ff" }}
      >
        <KeyRound size={22} />
      </div>
      <div>
        <h2 className="text-xl font-bold" style={{ color: "#0F172A" }}>
          Account Security
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "#727687" }}>
          Update your account password and security settings
        </p>
      </div>
    </div>

    {pwdSuccess && (
      <div
        className="mb-4 p-4 rounded-xl border text-sm font-medium flex items-center gap-2"
        style={{
          backgroundColor: "rgba(21,128,61,0.08)",
          borderColor: "rgba(21,128,61,0.2)",
          color: "#15803D",
        }}
      >
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
        {pwdSuccess}
      </div>
    )}

    {pwdStep === 1 ? (
      <form onSubmit={handleRequestChangeOtp} className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
          We'll send a 6-digit verification code to{" "}
          <span className="font-semibold" style={{ color: "#0F172A" }}>
            {user?.email}
          </span>{" "}
          to verify your identity.
        </p>

        {pwdError && (
          <div
            className="p-3.5 rounded-xl border text-sm"
            style={{
              backgroundColor: "rgba(186,26,26,0.08)",
              borderColor: "rgba(186,26,26,0.2)",
              color: "#ba1a1a",
            }}
          >
            {pwdError}
          </div>
        )}

        <button
          type="submit"
          disabled={pwdLoading}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          style={{ backgroundColor: "#0066ff" }}
          onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0050cb")}
          onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0066ff")}
        >
          {pwdLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <KeyRound size={16} />
              <span>Send Verification Code</span>
            </>
          )}
        </button>
      </form>
    ) : (
      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        <div
          className="p-3 rounded-xl border text-xs font-medium"
          style={{
            backgroundColor: "rgba(202,138,4,0.08)",
            borderColor: "rgba(202,138,4,0.2)",
            color: "#ca8a04",
          }}
        >
          Verification code sent to your email. Check your inbox & spam folder.
        </div>

        {pwdError && (
          <div
            className="p-3.5 rounded-xl border text-sm"
            style={{
              backgroundColor: "rgba(186,26,26,0.08)",
              borderColor: "rgba(186,26,26,0.2)",
              color: "#ba1a1a",
            }}
          >
            {pwdError}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "#0F172A" }}>
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={pwdForm.otp}
            onChange={(e) => {
              setPwdForm((p) => ({ ...p, otp: e.target.value }));
              setPwdError("");
            }}
            placeholder="000000"
            className="w-full px-4 py-2.5 rounded-xl tracking-[0.5em] text-center font-mono text-lg outline-none transition-all border"
            style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0066ff";
              e.target.style.boxShadow = "0 0 0 2px rgba(0,102,255,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E2E8F0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "#0F172A" }}>
            New Password
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              required
              value={pwdForm.next}
              onChange={(e) => {
                setPwdForm((p) => ({ ...p, next: e.target.value }));
                setPwdError("");
              }}
              placeholder="Min. 8 characters"
              className="w-full pl-4 pr-11 py-2.5 rounded-xl text-sm outline-none transition-all border"
              style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
              onFocus={(e) => {
                e.target.style.borderColor = "#0066ff";
                e.target.style.boxShadow = "0 0 0 2px rgba(0,102,255,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E2E8F0";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-0 inset-y-0 px-3 flex items-center"
              style={{ color: "#727687" }}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "#0F172A" }}>
            Confirm Password
          </label>
          <input
            type={showPwd ? "text" : "password"}
            required
            value={pwdForm.confirm}
            onChange={(e) => {
              setPwdForm((p) => ({ ...p, confirm: e.target.value }));
              setPwdError("");
            }}
            placeholder="Confirm new password"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: pwdForm.confirm && pwdForm.next !== pwdForm.confirm ? "#ba1a1a" : "#E2E8F0",
              color: "#0F172A",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0066ff";
              e.target.style.boxShadow = "0 0 0 2px rgba(0,102,255,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E2E8F0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          type="submit"
          disabled={pwdLoading}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
          style={{ backgroundColor: "#0066ff" }}
          onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0050cb")}
          onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0066ff")}
        >
          {pwdLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <KeyRound size={16} />
              <span>Update Password</span>
            </>
          )}
        </button>

        <div className="flex flex-col items-center gap-2 pt-2">
          {pwdCountdown > 0 ? (
            <p className="text-xs" style={{ color: "#727687" }}>
              Resend code in <span className="font-bold" style={{ color: "#0066ff" }}>{pwdCountdown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendChangeOtp}
              disabled={pwdLoading}
              className="text-xs font-semibold hover:underline disabled:opacity-50"
              style={{ color: "#0066ff" }}
            >
              {pwdLoading ? "Sending..." : "Resend code"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setPwdStep(1);
              setPwdError("");
            }}
            className="text-xs transition-colors hover:underline"
            style={{ color: "#727687" }}
          >
            ← Back to request code
          </button>
        </div>
      </form>
    )}
  </div>
);


