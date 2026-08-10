/**
 * AuthContext — stores non-sensitive user metadata in localStorage.
 * The JWT lives exclusively in an HTTP-only cookie set by the backend.
 * JS never touches the token, eliminating XSS token theft.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { API, FALLBACK_API } from "../hooks/api";

const AuthContext = createContext(null);

// Keys stored in localStorage — never includes the token
const META_KEY = "auth_meta";

export function AuthProvider({ children }) {
  const stored = () => {
    try {
      const raw = localStorage.getItem(META_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [auth, setAuth] = useState(stored);

  const sanitizeUserData = (userObj) => {
    if (!userObj) return null;
    const { setups, ...cleanUser } = userObj;
    return cleanUser;
  };

  // Persist only non-sensitive metadata — token stays in the HTTP-only cookie
  const persist = (data) => {
    if (!data) {
      localStorage.removeItem(META_KEY);
      setAuth(null);
      return;
    }
    const { access_token, ...meta } = data;
    const cleanUser = meta.user ? sanitizeUserData(meta.user) : null;
    const sanitized = { ...meta, ...(cleanUser ? { user: cleanUser } : {}) };
    localStorage.setItem(META_KEY, JSON.stringify(sanitized));
    setAuth(sanitized);
  };

  const fetchWithFallback = async (endpoint, options = {}) => {
    const opts = { ...options, credentials: "include" };
    const primaryUrl = `${API}${endpoint}`;
    try {
      return await fetch(primaryUrl, opts);
    } catch (err) {
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      if (isLocal && API !== FALLBACK_API) {
        return await fetch(`${FALLBACK_API}${endpoint}`, opts);
      }
      throw err;
    }
  };

  // Sync latest user profile on mount to keep metadata fresh
  useEffect(() => {
    if (auth?.user_id) {
      fetchWithFallback("/users/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((userData) => {
          if (userData) {
            const cleanUser = sanitizeUserData(userData);
            setAuth((prev) => {
              if (!prev) return prev;
              const updated = { ...prev, email: cleanUser.email, is_admin: cleanUser.is_admin, user: cleanUser };
              localStorage.setItem(META_KEY, JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch(() => {});
    }
  }, [auth?.user_id]);

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

  const logout = useCallback(async () => {
    await fetchWithFallback("/auth/logout", { method: "POST" }).catch(() => {});
    persist(null);
  }, []);

  const updateAuthUser = useCallback((updatedUserData) => {
    setAuth((prev) => {
      if (!prev) return prev;
      const cleanUpdated = sanitizeUserData(updatedUserData) || {};
      const updated = { ...prev, user: { ...(prev.user || {}), ...cleanUpdated } };
      localStorage.setItem(META_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        register,
        googleLogin,
        signupSendOtp,
        signupVerifyOtp,
        signupComplete,
        updateAuthUser,
      }}
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
