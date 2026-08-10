/**
 * useAuthFetch — drop-in replacement for fetch() that sends the HTTP-only
 * auth cookie automatically via credentials: "include".
 * No token is read from JS — the browser attaches the cookie on every request.
 */
import { useCallback } from 'react';
import { API, FALLBACK_API } from './api';

export function useAuthFetch() {
  return useCallback(
    async (pathOrUrl, options = {}) => {
      const resolveUrl = (baseUrl, target) => {
        if (!target) return baseUrl;
        if (target.startsWith('http://') || target.startsWith('https://')) {
          const pathname = target.replace(/^https?:\/\/[^\/]+/, '');
          return `${baseUrl}${pathname}`;
        }
        return `${baseUrl}${target.startsWith('/') ? '' : '/'}${target}`;
      };

      const primaryUrl = resolveUrl(API, pathOrUrl);
      const opts = { ...options, credentials: 'include' };

      try {
        return await fetch(primaryUrl, opts);
      } catch (err) {
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocal && API !== FALLBACK_API) {
          console.warn(`Primary API (${primaryUrl}) unreachable. Retrying with fallback (${FALLBACK_API})...`, err);
          return await fetch(resolveUrl(FALLBACK_API, pathOrUrl), opts);
        }
        throw err;
      }
    },
    []
  );
}
