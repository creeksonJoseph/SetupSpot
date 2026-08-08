import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function useSignupFlow() {
  const { signupSendOtp, signupVerifyOtp, signupComplete, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const startCountdown = useCallback((seconds = 60) => {
    clearInterval(timerRef.current);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const clearError = useCallback(() => setError(""), []);

  // Step 1 — send OTP
  const handleSendOtp = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signupSendOtp(email.trim().toLowerCase());
      showToast("Verification code sent!", "info");
      setStep(2);
      startCountdown(60);
    } catch (err) {
      setError(err.message);
      showToast(err.message || "Failed to send code", "error");
    } finally {
      setLoading(false);
    }
  }, [email, signupSendOtp, showToast, startCountdown]);

  const handleResendOtp = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      await signupSendOtp(email.trim().toLowerCase());
      showToast("Verification code resent!", "info");
      startCountdown(60);
    } catch (err) {
      setError(err.message);
      showToast(err.message || "Failed to send code", "error");
    } finally {
      setLoading(false);
    }
  }, [email, signupSendOtp, showToast, startCountdown, clearError]);

  // Step 2 — verify OTP
  const handleVerifyOtp = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = await signupVerifyOtp(email.trim().toLowerCase(), otp.trim());
      setSignupToken(token);
      setStep(3);
    } catch (err) {
      setError(err.message);
      showToast(err.message || "Invalid code", "error");
    } finally {
      setLoading(false);
    }
  }, [email, otp, signupVerifyOtp, showToast]);

  // Step 3 — complete signup
  const handleComplete = useCallback(async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const targetPath = location.state?.from?.pathname || location.state?.from || "/explore";
      await signupComplete(signupToken, form.username.trim(), form.password);
      showToast("Account created successfully!", "success");
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message);
      showToast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  }, [form, signupToken, signupComplete, showToast, navigate, location]);

  const handleGoogleSuccess = useCallback(async (credential) => {
    setLoading(true);
    setError("");
    try {
      const targetPath = location.state?.from?.pathname || location.state?.from || "/explore";
      await googleLogin(credential);
      showToast("Logged in successfully!", "success");
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message);
      showToast(err.message || "Google sign-in failed", "error");
    } finally {
      setLoading(false);
    }
  }, [googleLogin, showToast, navigate, location]);

  const resetToEmail = useCallback(() => {
    setStep(1);
    setOtp("");
    clearError();
    clearInterval(timerRef.current);
  }, [clearError]);

  return {
    step,
    email,
    setEmail,
    otp,
    setOtp,
    form,
    setForm,
    showPwd,
    setShowPwd,
    loading,
    error,
    countdown,
    clearError,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleComplete,
    handleGoogleSuccess,
    resetToEmail,
  };
}
