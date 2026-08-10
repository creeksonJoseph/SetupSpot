/**
 * useSetupDraft — localStorage utility for persisting Create Setup draft state.
 *
 * Draft key is scoped per-user (setupspot_draft_<userId>) so multiple accounts
 * on the same browser don't overwrite each other's work.
 *
 * The draft stores only serialisable primitives (strings, numbers, plain objects).
 * Raw File/Blob objects are never stored here — only the Cloudinary URL string
 * returned by the Early Upload endpoint.
 */
import { useCallback } from 'react';
import { useCurrentUser } from './useCurrentUser';

const BASE_KEY = 'setupspot_draft';

export function useSetupDraft() {
  const { userId } = useCurrentUser();

  const getKey = useCallback(() => {
    return `${BASE_KEY}_${userId ?? 'anonymous'}`;
  }, [userId]);

  /**
   * Persist the draft payload to localStorage.
   * @param {{ draft_image_url: string, setup_name: string, annotations: object[] }} payload
   */
  const saveDraft = useCallback(
    (payload) => {
      try {
        const key = getKey();
        localStorage.setItem(
          key,
          JSON.stringify({
            ...payload,
            last_updated: new Date().toISOString(),
          })
        );
      } catch (err) {
        // Storage quota exceeded or private-mode restriction — non-fatal
        console.warn('[useSetupDraft] Could not save draft:', err);
      }
    },
    [getKey]
  );

  /**
   * Load a previously saved draft from localStorage.
   * Returns null if none exists or if JSON is malformed.
   */
  const loadDraft = useCallback(() => {
    try {
      const key = getKey();
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [getKey]);

  /** Remove the draft from localStorage (called on successful post submission or manual reset). */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(getKey());
    } catch {
      // No-op — failing to clear a draft is harmless
    }
  }, [getKey]);

  return { saveDraft, loadDraft, clearDraft };
}
