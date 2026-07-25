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
  inputBase,
  inputStyle,
  onFocus,
  onBlur,
}) => (
  <div className="max-w-md">
    <h2 className="text-xl font-bold mb-4" style={{ color: "#0F172A" }}>
      Change Password
    </h2>

    {pwdSuccess && (
      <div
        className="mb-4 p-3 rounded-lg border text-sm"
        style={{
          backgroundColor: "rgba(21,128,61,0.08)",
          borderColor: "rgba(21,128,61,0.2)",
          color: "#15803D",
        }}
      >
        {pwdSuccess}
      </div>
    )}

    {pwdStep === 1 ? (
      <form onSubmit={handleRequestChangeOtp} className="flex flex-col gap-3">
        <p className="text-sm" style={{ color: "#475569" }}>
          We'll send a 6-digit code to{" "}
          <span style={{ color: "#0F172A", fontWeight: 600 }}>{user.email}</span> to verify it's you.
        </p>
        {pwdError && (
          <div
            className="p-3 rounded-lg border text-sm"
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
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0066ff" }}
          onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0050cb")}
          onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = "#0066ff")}
        >
          {pwdLoading ? (
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }}
            />
          ) : (
            <>
              <KeyRound size={16} />
              <span>Send verification code</span>
            </>
          )}
        </button>
      </form>
    ) : (
      <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
        <p className="text-xs" style={{ color: "#ca8a04" }}>
          Code sent — check your spam folder if you don't see it.
        </p>

        {pwdError && (
          <div
            className="p-3 rounded-lg border text-sm"
            style={{
              backgroundColor: "rgba(186,26,26,0.08)",
              borderColor: "rgba(186,26,26,0.2)",
              color: "#ba1a1a",
            }}
          >
            {pwdError}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
            Verification code
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
            className={`${inputBase} tracking-[0.5em] text-center`}
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
            New password
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
              className={`${inputBase} pr-10`}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-0 inset-y-0 px-3 flex items-center"
              style={{ color: "#727687" }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
            Confirm password
          </label>
          <input
            type={showPwd ? "text" : "password"}
            required
            value={pwdForm.confirm}
            onChange={(e) => {
              setPwdForm((p) => ({ ...p, confirm: e.target.value }));
              setPwdError("");
            }}
            placeholder="••••••••"
            className={inputBase}
            style={{
              ...inputStyle,
              borderColor: pwdForm.confirm && pwdForm.next !== pwdForm.confirm ? "#ba1a1a" : "#E2E8F0",
            }}
            onFocus={onFocus}
            onBlur={onBlur}
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
          {pwdLoading ? (
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(248,247,255,0.3)", borderTopColor: "#f8f7ff" }}
            />
          ) : (
            <>
              <KeyRound size={16} />
              <span>Update password</span>
            </>
          )}
        </button>

        <div className="flex flex-col items-center gap-1 pt-1">
          {pwdCountdown > 0 ? (
            <p className="text-[13px]" style={{ color: "#727687" }}>
              Resend code in <span style={{ color: "#0050cb", fontWeight: 600 }}>{pwdCountdown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendChangeOtp}
              disabled={pwdLoading}
              className="text-[13px] font-semibold hover:underline disabled:opacity-50"
              style={{ color: "#0050cb" }}
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
            className="text-[13px] hover:underline"
            style={{ color: "#727687" }}
          >
            ← Back
          </button>
        </div>
      </form>
    )}
  </div>
);
