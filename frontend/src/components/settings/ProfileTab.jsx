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
    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left Column: Avatar & Profile Card */}
      <div className="flex flex-col items-center text-center justify-between">
        <div className="flex flex-col items-center text-center w-full">
          <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#0F172A' }}>
            Profile Picture
          </label>

          <div className="relative group mb-3">
            <div
              className="w-24 h-24 rounded-full border-4 shadow-md overflow-hidden flex items-center justify-center text-white text-3xl font-black"
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

          <h3 className="font-extrabold text-base" style={{ color: '#0F172A' }}>
            @{profileForm.username || 'username'}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#727687' }}>
            {user?.email}
          </p>

          <div className="w-full pt-4 mt-4 border-t" style={{ borderColor: '#E2E8F0' }}>
            <label
              htmlFor="avatar-file-input"
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-200 shadow-sm"
              style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
            >
              <Camera size={15} />
              {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
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
            <p className="text-[11px] mt-1.5" style={{ color: '#727687' }}>
              JPG, PNG or WEBP. Max size 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Account Details Form */}
      <div
        className="lg:col-span-2 bg-white rounded-2xl border p-5 md:p-6 shadow-sm flex flex-col justify-between"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div className="space-y-3.5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>
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
              className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border transition-all"
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
              className="w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 cursor-not-allowed opacity-80"
              style={{ borderColor: '#E2E8F0', color: '#727687' }}
            />
            <p className="text-[11px]" style={{ color: '#727687' }}>
              Email address is tied to your account authentication.
            </p>
          </div>

          {/* Bio Textarea */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>
                Bio
              </label>
              <span className="text-xs" style={{ color: '#727687' }}>
                {profileForm.bio.length}/200
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell the community about yourself and your setup aesthetic..."
              className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border transition-all resize-none"
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
        <div className="pt-4 mt-4 border-t flex justify-end" style={{ borderColor: '#E2E8F0' }}>
          <button
            type="submit"
            disabled={savingProfile || uploadingAvatar}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50"
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
