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
    <div className="max-w-2xl bg-white rounded-2xl border p-5 md:p-6 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
      <div className="mb-5">
        <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>
          Password & Security
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#727687' }}>
          Change your account password securely using two-step email verification.
        </p>
      </div>

      {pwdSuccess && (
        <div
          className="mb-5 p-3.5 rounded-xl border text-sm font-medium flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(21,128,61,0.08)',
            borderColor: 'rgba(21,128,61,0.2)',
            color: '#15803D',
          }}
        >
          <CheckCircle2 size={18} />
          {pwdSuccess}
        </div>
      )}

      {/* STEP 1: Request OTP */}
      {pwdStep === 1 && (
        <form onSubmit={handleRequestChangeOtp} className="space-y-4">
          <div
            className="p-3.5 rounded-xl border text-xs leading-relaxed"
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

          <button
            type="submit"
            disabled={pwdLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm disabled:opacity-50"
            style={{ backgroundColor: '#0066ff' }}
            onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0050cb')}
            onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0066ff')}
          >
            {pwdLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound size={15} />
                <span>Send Verification Code</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Enter OTP Sent to Email */}
      {pwdStep === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-3.5">
          <div
            className="p-3.5 rounded-xl border text-xs font-medium"
            style={{
              backgroundColor: 'rgba(202,138,4,0.08)',
              borderColor: 'rgba(202,138,4,0.2)',
              color: '#ca8a04',
            }}
          >
            Verification code sent to <strong className="font-bold">{user?.email}</strong>. Please check your inbox and spam folder.
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

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={pwdForm.otp}
              onChange={(e) => {
                setPwdForm((prev) => ({ ...prev, otp: e.target.value }));
                setPwdError('');
              }}
              placeholder="000000"
              className="w-full px-4 py-2.5 rounded-xl tracking-[0.5em] text-center font-mono text-lg outline-none transition-all border"
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

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm"
            style={{ backgroundColor: '#0066ff' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0050cb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066ff')}
          >
            Verify Code & Continue
          </button>

          <div className="flex justify-between items-center pt-1.5">
            <button
              type="button"
              onClick={() => {
                setPwdStep(1);
                setPwdError('');
              }}
              className="flex items-center gap-1 text-xs transition-colors hover:underline"
              style={{ color: '#727687' }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {pwdCountdown > 0 ? (
              <span className="text-xs" style={{ color: '#727687' }}>
                Resend code in <strong style={{ color: '#0066ff' }}>{pwdCountdown}s</strong>
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
            )}
          </div>
        </form>
      )}

      {/* STEP 3: Enter New Password & Confirm Password */}
      {pwdStep === 3 && (
        <form onSubmit={handleChangePassword} className="space-y-3.5">
          <div
            className="p-3 rounded-xl border text-xs font-medium"
            style={{
              backgroundColor: 'rgba(21,128,61,0.08)',
              borderColor: 'rgba(21,128,61,0.2)',
              color: '#15803D',
            }}
          >
            Code verified! Create your new password below.
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

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
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

          <button
            type="submit"
            disabled={pwdLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm disabled:opacity-50"
            style={{ backgroundColor: '#0066ff' }}
            onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0050cb')}
            onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0066ff')}
          >
            {pwdLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound size={15} />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
