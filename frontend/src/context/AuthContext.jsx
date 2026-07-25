/**
 * AuthContext — stores the authenticated user and JWT token.
 * Provides login(), logout(), and register() to the whole app.
 * Token is persisted to localStorage so sessions survive page reload.
 */
import React, { createContext, useContext, useState, useCallback } from "react";
import { API, FALLBACK_API } from "../hooks/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const stored = () => {
    try {
      const raw = localStorage.getItem("auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [auth, setAuth] = useState(stored);

  const persist = (data) => {
    if (data) {
      localStorage.setItem("auth", JSON.stringify(data));
    } else {
      localStorage.removeItem("auth");
    }
    setAuth(data);
  };

  const fetchWithFallback = async (endpoint, options) => {
    const primaryUrl = `${API}${endpoint}`;
    try {
      return await fetch(primaryUrl, options);
    } catch (err) {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocal && API !== FALLBACK_API) {
        const fallbackUrl = `${FALLBACK_API}${endpoint}`;
        return await fetch(fallbackUrl, options);
      }
      throw err;
    }
  };

  const register = useCallback(async (email, username, password) => {
    const res = await fetchWithFallback("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    persist(data);
    return data;
  }, []);

  const signupSendOtp = useCallback(async (email) => {
    const res = await fetchWithFallback("/auth/signup/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to send code");
    return data;
  }, []);

  const signupVerifyOtp = useCallback(async (email, otp) => {
    const res = await fetchWithFallback("/auth/signup/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Invalid code");
    return data.signup_token;
  }, []);

  const signupComplete = useCallback(async (signup_token, username, password) => {
    const res = await fetchWithFallback("/auth/signup/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signup_token, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    persist(data);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetchWithFallback("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    persist(data);
    return data;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const res = await fetchWithFallback("/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Google sign-in failed");
    persist(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    persist(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, login, logout, register, googleLogin, signupSendOtp, signupVerifyOtp, signupComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
