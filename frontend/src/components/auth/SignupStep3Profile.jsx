import React from "react";
import { Eye, EyeOff } from "lucide-react";

export const SignupStep3Profile = ({
  form,
  setForm,
  showPwd,
  setShowPwd,
  clearError,
  handleComplete,
  loading,
  inputBase,
  inputStyle,
  onFocus,
  onBlur,
}) => (
  <form onSubmit={handleComplete} className="space-y-4">
    <div className="space-y-1">
      <label htmlFor="signup-username" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
        Username
      </label>
      <input
        id="signup-username"
        type="text"
        required
        autoComplete="username"
        value={form.username}
        onChange={(e) => {
          setForm((p) => ({ ...p, username: e.target.value }));
          clearError();
        }}
        placeholder="yourname"
        className={inputBase}
        style={inputStyle}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>

    <div className="space-y-1">
      <label htmlFor="signup-password" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
        Password
      </label>
      <div className="relative">
        <input
          id="signup-password"
          type={showPwd ? "text" : "password"}
          required
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => {
            setForm((p) => ({ ...p, password: e.target.value }));
            clearError();
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
          className="absolute right-0 inset-y-0 px-3 flex items-center transition-colors"
          style={{ color: "#727687" }}
        >
          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>

    <div className="space-y-1">
      <label htmlFor="signup-confirm" className="block text-[13px] font-semibold" style={{ color: "#0F172A", letterSpacing: "0.02em" }}>
        Confirm password
      </label>
      <input
        id="signup-confirm"
        type={showPwd ? "text" : "password"}
        required
        autoComplete="new-password"
        value={form.confirm}
        onChange={(e) => {
          setForm((p) => ({ ...p, confirm: e.target.value }));
          clearError();
        }}
        placeholder="••••••••"
        className={inputBase}
        style={{
          ...inputStyle,
          borderColor: form.confirm && form.password !== form.confirm ? "#ba1a1a" : "#E2E8F0",
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>

    {/* Password strength indicator */}
    {form.password && (
      <div className="flex gap-1 h-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                form.password.length > i * 3
                  ? form.password.length >= 12
                    ? "#15803D"
                    : form.password.length >= 8
                    ? "#ca8a04"
                    : "#ba1a1a"
                  : "#E2E8F0",
            }}
          />
        ))}
      </div>
    )}

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
          <span>Creating account...</span>
        </div>
      ) : (
        "Create account"
      )}
    </button>
  </form>
);
