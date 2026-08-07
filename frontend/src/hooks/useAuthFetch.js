/**
 * useAuthFetch — drop-in replacement for fetch() that automatically
 * adds the Authorization: Bearer <token> header from AuthContext.
 * Retries on network errors to handle Render server cold-starts gracefully.
 */
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from './api';

export function useAuthFetch() {
  const { auth } = useAuth();

  return useCallback(
    async (pathOrUrl, options = {}) => {
      const headers = {
        ...(options.headers || {}),
        ...(auth?.access_token
          ? { Authorization: `Bearer ${auth.access_token}` }
          : {}),
      };

      const resolveUrl = (baseUrl, target) => {
        if (!target) return baseUrl;
        if (target.startsWith('http://') || target.startsWith('https://')) {
          const pathname = target.replace(/^https?:\/\/[^\/]+/, '');
          return `${baseUrl}${pathname}`;
        }
        return `${baseUrl}${target.startsWith('/') ? '' : '/'}${target}`;
      };

      const primaryUrl = resolveUrl(API, pathOrUrl);

      // Retries to seamlessly wait for Render free-tier cold-starts (up to ~14s)
      const attempts = [0, 2000, 3000, 4000, 5000];
      let lastError = null;

      for (let i = 0; i < attempts.length; i++) {
        if (attempts[i] > 0) {
          await new Promise((r) => setTimeout(r, attempts[i]));
        }
        try {
          const response = await fetch(primaryUrl, { ...options, headers });
          return response;
        } catch (err) {
          lastError = err;
        }
      }

      const isNetworkErr = lastError?.name === 'TypeError' || lastError?.message?.includes('fetch');
      const serverStartingMsg = 'Server is starting up. Please wait a few seconds and try again.';
      throw new Error(isNetworkErr ? serverStartingMsg : (lastError?.message || serverStartingMsg));
    },
    [auth?.access_token]
  );
}
