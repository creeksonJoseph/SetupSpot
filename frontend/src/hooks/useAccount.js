import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthFetch } from './useAuthFetch';
import { useToast } from '../context/ToastContext';

// Module-level cache for account details (0ms revisiting)
let accountCache = null;

export function useAccount() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { showToast } = useToast();

  const [user, setUser] = useState(() => accountCache?.data ?? (auth?.user?.username ? auth.user : null));
  const [loading, setLoading] = useState(() => !accountCache && !auth?.user?.username);
  const [error, setError] = useState(null);

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
        if (prev <= 1) { clearInterval(pwdTimerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(pwdTimerRef.current), []);

  const fetchUserData = useCallback(async () => {
    if (!accountCache && !auth?.user) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await authFetch('/users/me');
      if (!res.ok) throw new Error('Failed to fetch user data');
      const data = await res.json();
      accountCache = { data, timestamp: Date.now() };
      setUser(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (!accountCache && !auth?.user) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch, auth?.user]);

  useEffect(() => {
    if (auth?.access_token) {
      fetchUserData();
    }
  }, [auth?.access_token, fetchUserData]);

  const handleRequestChangeOtp = useCallback(async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdLoading(true);
    try {
      const res = await authFetch('/auth/send-change-otp', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send code');
      setPwdStep(2);
      startPwdCountdown(60);
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  }, [authFetch]);

  const handleResendChangeOtp = useCallback(async () => {
    setPwdError('');
    setPwdLoading(true);
    try {
      const res = await authFetch('/auth/send-change-otp', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send code');
      startPwdCountdown(60);
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  }, [authFetch, startPwdCountdown]);

  const handleChangePassword = useCallback(async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (pwdForm.next !== pwdForm.confirm) return setPwdError('Passwords do not match');
    if (pwdForm.next.length < 8) return setPwdError('Password must be at least 8 characters');
    setPwdLoading(true);
    try {
      const res = await authFetch('/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: pwdForm.otp, new_password: pwdForm.next }),
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
  }, [authFetch, pwdForm, showToast]);

  const deleteSetup = useCallback(async (setupId) => {
    try {
      const res = await authFetch(`/setups/${setupId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Setup deleted successfully!', 'success');
        setUser((prev) => (prev ? {
          ...prev,
          setups: prev.setups.filter((s) => s.id !== setupId),
        } : null));
      } else {
        showToast('Failed to delete setup', 'error');
      }
    } catch (err) {
      console.error('Error deleting setup:', err);
      showToast('Error deleting setup', 'error');
    }
  }, [authFetch, showToast]);

  const handleLogout = useCallback(() => {
    logout();
    showToast('Signed out successfully!', 'info');
    navigate('/login', { replace: true });
  }, [logout, navigate, showToast]);

  return {
    user,
    loading,
    error,
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
    deleteSetup,
    handleLogout,
    refetch: fetchUserData,
  };
}
