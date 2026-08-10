/**
 * useAuthFetch — drop-in replacement for fetch() that sends the HTTP-only
 * auth cookie automatically via credentials: "include".
 * No token is read from JS — the browser attaches the cookie on every request.
 */
import { useCallback } from 'react';
import { API } from './api';

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
      return await fetch(primaryUrl, opts);
    },
    []
  );
}
