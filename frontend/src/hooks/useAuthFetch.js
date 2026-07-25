/**
 * useAuthFetch — drop-in replacement for fetch() that automatically
 * adds the Authorization: Bearer <token> header from AuthContext.
 * Automatically resolves endpoint path against primary API (Render) and falls back to local server if unavailable.
 */
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API, FALLBACK_API } from './api';

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

      try {
        const response = await fetch(primaryUrl, { ...options, headers });
        return response;
      } catch (err) {
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocal && API !== FALLBACK_API) {
          console.warn(`Primary API (${primaryUrl}) unreachable. Retrying with fallback (${FALLBACK_API})...`, err);
          const fallbackUrl = resolveUrl(FALLBACK_API, pathOrUrl);
          return await fetch(fallbackUrl, { ...options, headers });
        }
        throw err;
      }
    },
    [auth?.access_token]
  );
}
