/**
 * AuthContext — stores the authenticated user and JWT token.
 * Provides login(), logout(), and register() to the whole app.
 * Token is persisted to localStorage so sessions survive page reload.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const stored = () => {
    try {
      const raw = localStorage.getItem('auth');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [auth, setAuth] = useState(stored);

  const persist = (data) => {
    if (data) {
      localStorage.setItem('auth', JSON.stringify(data));
    } else {
      localStorage.removeItem('auth');
    }
    setAuth(data);
  };

  const register = useCallback(async (email, username, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    persist(data);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    persist(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    persist(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
