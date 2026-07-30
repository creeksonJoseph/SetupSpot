import { useState, useEffect, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';

/**
 * Fetch the public profile for any user by id.
 * Returns: { profile, loading, error }
 * Profile shape: { id, username, bio, avatar_url, post_count, collection_count, setups[], collections[] }
 */
export function usePublicProfile(userId) {
  const authFetch = useAuthFetch();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/users/${userId}`);
      if (!res.ok) throw new Error('User not found');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('usePublicProfile error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, authFetch]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
