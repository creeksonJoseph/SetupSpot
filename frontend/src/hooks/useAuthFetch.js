/**
 * useAuthFetch — drop-in replacement for fetch() that automatically
 * adds the Authorization: Bearer <token> header from AuthContext.
 *
 * Usage:
 *   const authFetch = useAuthFetch();
 *   const res = await authFetch('http://localhost:5000/setups');
 */
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useAuthFetch() {
  const { auth } = useAuth();

  return useCallback(
    (url, options = {}) => {
      const headers = {
        ...(options.headers || {}),
        ...(auth?.access_token
          ? { Authorization: `Bearer ${auth.access_token}` }
          : {}),
      };
      return fetch(url, { ...options, headers });
    },
    [auth?.access_token]
  );
}
