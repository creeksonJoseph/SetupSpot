import React from 'react';
import { Camera } from 'lucide-react';

export const ProfileTab = ({
  user,
  profileForm,
  setProfileForm,
  savingProfile,
  uploadingAvatar,
  handleAvatarUpload,
  handleSaveProfile,
}) => {
  return (
    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
      {/* Left Column: Avatar & Profile Card */}
      <div
        className="bg-transparent sm:bg-white rounded-none sm:rounded-2xl border-0 sm:border p-0 sm:p-4 shadow-none sm:shadow-2xs flex flex-row lg:flex-col items-center justify-between sm:justify-start lg:justify-center gap-3 text-left lg:text-center w-full"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div className="flex items-center lg:flex-col gap-3 lg:gap-1.5 shrink-0">
          <label htmlFor="avatar-file-input" className="relative group cursor-pointer block shrink-0">
            <div
              className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-white text-lg sm:text-xl font-black relative"
              style={{
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

              {/* Hover Overlay Icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={16} />
              </div>
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </label>

          <div className="min-w-0">
            <h3 className="font-extrabold text-xs sm:text-sm truncate" style={{ color: '#0F172A' }}>
              @{profileForm.username || 'username'}
            </h3>
            <p className="text-[11px] truncate mt-0.5" style={{ color: '#727687' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <div className="pt-0 lg:pt-3 lg:mt-2 lg:border-t w-auto lg:w-full flex flex-col items-end lg:items-center shrink-0" style={{ borderColor: '#E2E8F0' }}>
          <label
            htmlFor="avatar-file-input"
            className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-blue-50 shadow-2xs"
            style={{ borderColor: 'rgba(0,102,255,0.3)', color: '#0066ff', backgroundColor: 'rgba(0,102,255,0.04)' }}
          >
            <Camera size={13} />
            <span className="hidden sm:inline">{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
            <span className="sm:hidden">{uploadingAvatar ? '...' : 'Change'}</span>
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
          <p className="text-[10px] mt-1 hidden lg:block" style={{ color: '#727687' }}>
            JPG, PNG or WEBP. Max size 5MB.
          </p>
        </div>
      </div>

      {/* Right Column: Account Details Form */}
      <div
        className="lg:col-span-2 bg-transparent sm:bg-white rounded-none sm:rounded-2xl border-0 sm:border p-0 sm:p-4 shadow-none sm:shadow-sm flex flex-col justify-between"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div className="space-y-2.5">
          <div>
            <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>
              Personal Details
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#727687' }}>
              Update your public handle and bio shown on your profile page.
            </p>
          </div>

          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
              Username
            </label>
            <input
              type="text"
              required
              value={profileForm.username}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your username"
              className="w-full px-3 py-1.5 rounded-xl text-xs outline-none border transition-all"
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
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-1.5 rounded-xl text-xs border bg-slate-50 cursor-not-allowed opacity-80"
              style={{ borderColor: '#E2E8F0', color: '#727687' }}
            />
            <p className="text-[10px]" style={{ color: '#727687' }}>
              Email address is tied to your account authentication.
            </p>
          </div>

          {/* Bio Textarea */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
                Bio
              </label>
              <span className="text-[10px]" style={{ color: '#727687' }}>
                {profileForm.bio.length}/200
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={200}
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell the community about yourself and your setup aesthetic..."
              className="w-full px-3 py-1.5 rounded-xl text-xs outline-none border transition-all resize-none"
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
        </div>

        {/* Submit Button */}
        <div className="pt-2.5 mt-2.5 border-t flex justify-end" style={{ borderColor: '#E2E8F0' }}>
          <button
            type="submit"
            disabled={savingProfile || uploadingAvatar}
            className="px-4 py-2 rounded-xl font-semibold text-xs text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            style={{ backgroundColor: '#0066ff' }}
            onMouseEnter={(e) => !savingProfile && (e.currentTarget.style.backgroundColor = '#0050cb')}
            onMouseLeave={(e) => !savingProfile && (e.currentTarget.style.backgroundColor = '#0066ff')}
          >
            {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};
