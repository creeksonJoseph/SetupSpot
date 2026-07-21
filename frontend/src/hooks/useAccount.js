import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthFetch } from './useAuthFetch';

export function useAccount() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pwdStep, setPwdStep] = useState(1);
  const [pwdForm, setPwdForm] = useState({ otp: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/users/me');
      if (!res.ok) throw new Error('Failed to fetch user data');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

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
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  }, [authFetch]);

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
      setPwdSuccess('Password changed successfully!');
      setPwdForm({ otp: '', next: '', confirm: '' });
      setPwdStep(1);
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  }, [authFetch, pwdForm]);

  const deleteSetup = useCallback(async (setupId) => {
    try {
      const res = await authFetch(`/setups/${setupId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUser((prev) => (prev ? {
          ...prev,
          setups: prev.setups.filter((s) => s.id !== setupId),
        } : null));
      }
    } catch (err) {
      console.error('Error deleting setup:', err);
    }
  }, [authFetch]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

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
    handleRequestChangeOtp,
    handleChangePassword,
    deleteSetup,
    handleLogout,
    refetch: fetchUserData,
  };
}
