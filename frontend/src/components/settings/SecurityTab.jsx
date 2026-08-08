import React from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

export const SecurityTab = ({
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
  handleVerifyOtp,
  handleResendOtp,
  handleChangePassword,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
      {/* Left Column: OTP Verification Flow */}
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>
            1. Verification Code
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#727687' }}>
            Request and verify a 6-digit security code sent to your email.
          </p>
        </div>

        {pwdSuccess && (
          <div
            className="p-3 rounded-xl border text-xs font-medium inline-flex items-center gap-2 mb-2"
            style={{
              backgroundColor: 'rgba(21,128,61,0.08)',
              borderColor: 'rgba(21,128,61,0.2)',
              color: '#15803D',
            }}
          >
            <CheckCircle2 size={16} />
            {pwdSuccess}
          </div>
        )}

        {/* STEP 1: Request OTP */}
        {pwdStep === 1 && (
          <form onSubmit={handleRequestChangeOtp} className="space-y-4">
            <div
              className="p-3 rounded-xl border text-xs leading-relaxed"
              style={{ backgroundColor: '#f7f9fb', borderColor: '#E2E8F0', color: '#475569' }}
            >
              We will send a 6-digit security code to{' '}
              <span className="font-bold" style={{ color: '#0F172A' }}>
                {user?.email}
              </span>{' '}
              to verify your request before changing your password.
            </div>

            {pwdError && (
              <div
                className="p-3 rounded-xl border text-xs"
                style={{
                  backgroundColor: 'rgba(186,26,26,0.08)',
                  borderColor: 'rgba(186,26,26,0.2)',
                  color: '#ba1a1a',
                }}
              >
                {pwdError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={pwdLoading}
                className="inline-flex items-center justify-center py-2 px-4 rounded-xl font-semibold text-xs text-white transition-all shadow-sm disabled:opacity-50"
                style={{ backgroundColor: '#0066ff' }}
                onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0050cb')}
                onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0066ff')}
              >
                {pwdLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 & 3: Enter OTP Sent to Email */}
        {pwdStep >= 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div
              className="p-3 rounded-xl border text-xs font-medium"
              style={{
                backgroundColor: 'rgba(202,138,4,0.08)',
                borderColor: 'rgba(202,138,4,0.2)',
                color: '#ca8a04',
              }}
            >
              Verification code sent to <strong className="font-bold">{user?.email}</strong>.
            </div>

            {pwdError && (
              <div
                className="p-3 rounded-xl border text-xs"
                style={{
                  backgroundColor: 'rgba(186,26,26,0.08)',
                  borderColor: 'rgba(186,26,26,0.2)',
                  color: '#ba1a1a',
                }}
              >
                {pwdError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                disabled={pwdStep === 3}
                value={pwdForm.otp}
                onChange={(e) => {
                  setPwdForm((prev) => ({ ...prev, otp: e.target.value }));
                  setPwdError('');
                }}
                placeholder="000000"
                className="w-56 px-4 py-2.5 rounded-xl tracking-[0.5em] text-center font-mono text-lg outline-none transition-all border block disabled:bg-slate-100 disabled:opacity-80"
                style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', color: '#0F172A' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066ff';
                  e.target.style.boxShadow = '0 0 0 2px rgba(0,102,255,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {pwdStep === 2 && (
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center py-2 px-4 rounded-xl font-semibold text-xs text-white transition-all shadow-sm"
                  style={{ backgroundColor: '#0066ff' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0050cb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066ff')}
                >
                  Verify Code & Continue
                </button>
              </div>
            )}

            {pwdStep === 3 && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(21,128,61,0.08)',
                  borderColor: 'rgba(21,128,61,0.2)',
                  color: '#15803D',
                }}
              >
                <CheckCircle2 size={15} /> Code Verified!
              </div>
            )}

            <div className="flex justify-between items-center pt-1.5 w-56">
              <button
                type="button"
                onClick={() => {
                  setPwdStep(1);
                  setPwdError('');
                }}
                className="flex items-center gap-1 text-xs transition-colors hover:underline"
                style={{ color: '#727687' }}
              >
                <ArrowLeft size={14} /> Reset
              </button>

              {pwdStep === 2 &&
                (pwdCountdown > 0 ? (
                  <span className="text-xs" style={{ color: '#727687' }}>
                    Resend in <strong style={{ color: '#0066ff' }}>{pwdCountdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={pwdLoading}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: '#0066ff' }}
                  >
                    {pwdLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                ))}
            </div>

          </form>
        )}
      </div>

      {/* Right Column: New Password & Confirm Password (Blurred & Deactivated until OTP is verified) */}
      <div
        className={`transition-all duration-300 ${
          pwdStep < 3 ? 'opacity-40 blur-[1.5px] pointer-events-none select-none' : 'opacity-100 blur-none pointer-events-auto'
        }`}
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>
            2. Set New Password
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#727687' }}>
            {pwdStep < 3 ? '🔒 Verify security code on the left to unlock.' : 'Enter your new password below.'}
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                disabled={pwdStep < 3}
                value={pwdForm.next}
                onChange={(e) => {
                  setPwdForm((prev) => ({ ...prev, next: e.target.value }));
                  setPwdError('');
                }}
                placeholder="Min. 8 characters"
                className="w-full pl-3.5 pr-10 py-2 rounded-xl text-sm outline-none transition-all border"
                style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', color: '#0F172A' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066ff';
                  e.target.style.boxShadow = '0 0 0 2px rgba(0,102,255,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-0 inset-y-0 px-3 flex items-center"
                style={{ color: '#727687' }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
              Confirm New Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              required
              disabled={pwdStep < 3}
              value={pwdForm.confirm}
              onChange={(e) => {
                setPwdForm((prev) => ({ ...prev, confirm: e.target.value }));
                setPwdError('');
              }}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2 rounded-xl text-sm outline-none transition-all border"
              style={{
                backgroundColor: '#ffffff',
                borderColor: pwdForm.confirm && pwdForm.next !== pwdForm.confirm ? '#ba1a1a' : '#E2E8F0',
                color: '#0F172A',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0066ff';
                e.target.style.boxShadow = '0 0 0 2px rgba(0,102,255,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={pwdStep < 3 || pwdLoading}
              className="inline-flex items-center justify-center py-2 px-4 rounded-xl font-semibold text-xs text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0066ff' }}
              onMouseEnter={(e) => pwdStep === 3 && !pwdLoading && (e.currentTarget.style.backgroundColor = '#0050cb')}
              onMouseLeave={(e) => pwdStep === 3 && !pwdLoading && (e.currentTarget.style.backgroundColor = '#0066ff')}
            >
              {pwdLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



