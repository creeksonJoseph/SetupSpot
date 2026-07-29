import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { KeyRound, User, Camera, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'security' ? 'security' : 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  const {
    user,
    loading,
    profileForm,
    setProfileForm,
    savingProfile,
    uploadingAvatar,
    handleAvatarUpload,
    handleSaveProfile,
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
  } = useSettings();

  useEffect(() => {
    if (searchParams.get('tab') === 'security') {
      setActiveTab('security');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <main className="flex-1 flex justify-center items-center min-h-[500px]">
        <div className="flex items-center gap-3" style={{ color: '#727687' }}>
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24" style={{ color: '#0066ff' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-semibold">Loading settings...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 px-2">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]" style={{ color: '#0F172A' }}>
            Account Settings
          </h1>
          <p className="text-base font-normal leading-normal mt-2" style={{ color: '#475569' }}>
            Update your public profile, bio, and account security preferences.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mb-8 border-b pb-4" style={{ borderColor: '#E2E8F0' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              backgroundColor: activeTab === 'profile' ? 'rgba(0,102,255,0.08)' : 'transparent',
              color: activeTab === 'profile' ? '#0066ff' : '#727687',
            }}
          >
            <User size={18} />
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              backgroundColor: activeTab === 'security' ? 'rgba(0,102,255,0.08)' : 'transparent',
              color: activeTab === 'security' ? '#0066ff' : '#727687',
            }}
          >
            <KeyRound size={18} />
            Password & Security
          </button>
        </div>

        {/* TAB 1: Edit Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-2xl border p-6 md:p-8 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Avatar Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#0F172A' }}>
                  Profile Picture
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div
                      className="w-24 h-24 rounded-full border-2 shadow-md overflow-hidden flex items-center justify-center text-white text-3xl font-black"
                      style={{
                        borderColor: '#ffffff',
                        background: 'linear-gradient(135deg, #0066ff 0%, #5a27f1 100%)',
                      }}
                    >
                      {profileForm.avatar_url ? (
                        <img
                          src={profileForm.avatar_url}
                          alt={profileForm.username || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="avatar-file-input"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-slate-50 shadow-sm"
                      style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
                    >
                      <Camera size={16} />
                      {uploadingAvatar ? 'Uploading...' : 'Change Picture'}
                    </label>
                    <input
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleAvatarUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <p className="text-xs" style={{ color: '#727687' }}>
                      JPG, PNG or WEBP. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all"
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

              {/* Email Address (Read-only) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border bg-slate-50 cursor-not-allowed opacity-80"
                  style={{ borderColor: '#E2E8F0', color: '#727687' }}
                />
                <p className="text-xs" style={{ color: '#727687' }}>
                  Email address cannot be changed directly.
                </p>
              </div>

              {/* Bio Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
                    Bio
                  </label>
                  <span className="text-xs" style={{ color: '#727687' }}>
                    {profileForm.bio.length}/200
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={200}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell the community about yourself and your setup aesthetic..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all resize-none"
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile || uploadingAvatar}
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  style={{ backgroundColor: '#0066ff' }}
                  onMouseEnter={(e) => !savingProfile && (e.currentTarget.style.backgroundColor = '#0050cb')}
                  onMouseLeave={(e) => !savingProfile && (e.currentTarget.style.backgroundColor = '#0066ff')}
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Password & Security */}
        {activeTab === 'security' && (
          <div className="max-w-2xl bg-white rounded-2xl border p-6 md:p-8 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>
                Password & Security
              </h2>
              <p className="text-xs mt-1" style={{ color: '#727687' }}>
                Change your account password securely using two-step email verification.
              </p>
            </div>

            {pwdSuccess && (
              <div
                className="mb-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-2"
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
                  className="p-4 rounded-xl border text-sm leading-relaxed"
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
                    className="p-3.5 rounded-xl border text-sm"
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
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: '#0066ff' }}
                  onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0050cb')}
                  onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0066ff')}
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
            )}

            {/* STEP 2: Enter OTP Sent to Email */}
            {pwdStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div
                  className="p-4 rounded-xl border text-xs font-medium"
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
                    className="p-3.5 rounded-xl border text-sm"
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
                    value={pwdForm.otp}
                    onChange={(e) => {
                      setPwdForm((prev) => ({ ...prev, otp: e.target.value }));
                      setPwdError('');
                    }}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-xl tracking-[0.5em] text-center font-mono text-xl outline-none transition-all border"
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
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all shadow-sm"
                  style={{ backgroundColor: '#0066ff' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0050cb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066ff')}
                >
                  Verify Code & Continue
                </button>

                <div className="flex justify-between items-center pt-2">
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
              <form onSubmit={handleChangePassword} className="space-y-4">
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
                    className="p-3.5 rounded-xl border text-sm"
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
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl text-sm outline-none transition-all border"
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
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
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
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border"
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
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: '#0066ff' }}
                  onMouseEnter={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0050cb')}
                  onMouseLeave={(e) => !pwdLoading && (e.currentTarget.style.backgroundColor = '#0066ff')}
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
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default SettingsPage;
