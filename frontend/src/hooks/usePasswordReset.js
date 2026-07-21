import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthFetch } from './useAuthFetch';

export function usePasswordReset() {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = useCallback(async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await authFetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (!res.ok) throw new Error('Something went wrong');
      setEmail(cleanEmail);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email, authFetch]);

  const handleReset = useCallback(async (e, overridePayload = null) => {
    if (e) e.preventDefault();

    if (!overridePayload) {
      if (form.password !== form.confirm) return setError('Passwords do not match');
      if (form.password.length < 8) return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = form.otp.trim();

    const payload = overridePayload || {
      email: cleanEmail,
      otp: cleanOtp,
      new_password: form.password,
    };

    try {
      const res = await authFetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed');
      navigate('/login', { state: { message: 'Password reset! Sign in with your new password.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email, form, authFetch, navigate]);

  return {
    step,
    setStep,
    email,
    setEmail,
    form,
    setForm,
    showPwd,
    setShowPwd,
    loading,
    error,
    setError,
    handleSendOtp,
    handleReset,
  };
}
