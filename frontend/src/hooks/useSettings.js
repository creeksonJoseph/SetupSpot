import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthFetch } from './useAuthFetch';
import { useToast } from '../context/ToastContext';

export function useSettings() {
  const { auth, updateAuthUser } = useAuth();
  const authFetch = useAuthFetch();
  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({ username: '', bio: '', avatar_url: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password & Security multi-step state
  // 1: Request OTP screen -> 2: OTP Verification screen -> 3: New Password & Confirm screen
  const [pwdStep, setPwdStep] = useState(1);
  const [pwdForm, setPwdForm] = useState({ otp: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdCountdown, setPwdCountdown] = useState(0);
  const pwdTimerRef = useRef(null);

  const startPwdCountdown = useCallback((seconds = 60) => {
    clearInterval(pwdTimerRef.current);
    setPwdCountdown(seconds);
    pwdTimerRef.current = setInterval(() => {
      setPwdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(pwdTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(pwdTimerRef.current), []);

  // Fetch current user details
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/users/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setProfileForm({
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || data.avatar || '',
        });
      }
    } catch (err) {
      console.error('Error fetching user data for settings:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (auth?.access_token) {
      fetchUserData();
    }
  }, [auth?.access_token, fetchUserData]);

  // Handle avatar upload via Cloudinary early upload
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await authFetch('/api/early-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to upload profile image');

      const imageUrl = data.image_url || data.url;
      setProfileForm((prev) => ({ ...prev, avatar_url: imageUrl }));

      // Auto-persist new avatar_url to DB and global AuthContext
      const patchRes = await authFetch('/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileForm.username.trim() || user?.username,
          bio: profileForm.bio.trim(),
          avatar_url: imageUrl,
        }),
      });

      if (patchRes.ok) {
        const updatedUserData = await patchRes.json();
        setUser(updatedUserData);
        if (updateAuthUser) {
          updateAuthUser(updatedUserData);
        }
      }

      showToast('Avatar uploaded successfully!', 'success');
    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast(err.message || 'Error uploading profile image', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile updates (username, bio, avatar_url)
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileForm.username.trim()) {
      showToast('Username cannot be empty', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await authFetch('/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileForm.username.trim(),
          bio: profileForm.bio.trim(),
          avatar_url: profileForm.avatar_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update profile');

      setUser(data);
      if (updateAuthUser) {
        updateAuthUser(data);
      }

      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Step 1 -> Step 2: Request verification OTP code
  const handleRequestChangeOtp = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setPwdError('');
      setPwdLoading(true);
      try {
        const res = await authFetch('/auth/send-change-otp', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to send verification code');

        setPwdStep(2);
        startPwdCountdown(60);
        showToast('Verification code sent to your email!', 'info');
      } catch (err) {
        setPwdError(err.message);
        showToast(err.message || 'Failed to send code', 'error');
      } finally {
        setPwdLoading(false);
      }
    },
    [authFetch, startPwdCountdown, showToast]
  );

  // Step 2 -> Step 3: Verify OTP code
  const handleVerifyOtp = useCallback(
    (e) => {
      if (e) e.preventDefault();
      setPwdError('');
      if (!pwdForm.otp || pwdForm.otp.trim().length !== 6) {
        setPwdError('Please enter a valid 6-digit code');
        return;
      }
      setPwdStep(3);
    },
    [pwdForm.otp]
  );

  // Resend OTP code
  const handleResendOtp = useCallback(async () => {
    setPwdError('');
    setPwdLoading(true);
    try {
      const res = await authFetch('/auth/send-change-otp', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send verification code');
      startPwdCountdown(60);
      showToast('New verification code sent!', 'info');
    } catch (err) {
      setPwdError(err.message);
      showToast(err.message, 'error');
    } finally {
      setPwdLoading(false);
    }
  }, [authFetch, startPwdCountdown, showToast]);

  // Step 3: Update password with OTP and new password
  const handleChangePassword = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setPwdError('');
      setPwdSuccess('');

      if (pwdForm.next !== pwdForm.confirm) {
        setPwdError('Passwords do not match');
        return;
      }
      if (pwdForm.next.length < 8) {
        setPwdError('Password must be at least 8 characters');
        return;
      }

      setPwdLoading(true);
      try {
        const res = await authFetch('/users/me/password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp: pwdForm.otp.trim(), new_password: pwdForm.next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to change password');

        showToast('Password changed successfully!', 'success');
        setPwdSuccess('Password changed successfully!');
        setPwdForm({ otp: '', next: '', confirm: '' });
        setPwdStep(1);
      } catch (err) {
        setPwdError(err.message);
        showToast(err.message || 'Failed to change password', 'error');
      } finally {
        setPwdLoading(false);
      }
    },
    [authFetch, pwdForm, showToast]
  );

  return {
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
    refetch: fetchUserData,
  };
}
