import { useState, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';
import { useToast } from '../context/ToastContext';

/**
 * useComments — fetches and manages comments for a single setup.
 * Only fetches on first activation (lazy). Called when commentsOpen = true.
 */
export function useComments(setupId) {
  const authFetch = useAuthFetch();
  const { showToast } = useToast();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchComments = useCallback(async () => {
    if (fetched || !setupId) return;
    setLoading(true);
    try {
      const res = await authFetch(`/setups/${setupId}/comments`);
      if (!res.ok) throw new Error('Failed to load comments');
      const data = await res.json();
      setComments(data);
      setFetched(true);
    } catch (err) {
      console.error(err);
      showToast('Could not load comments.', 'error');
    } finally {
      setLoading(false);
    }
  }, [setupId, authFetch, fetched, showToast]);

  const addComment = useCallback(async (body) => {
    if (!body.trim() || !setupId) return;
    setSubmitting(true);
    try {
      const res = await authFetch(`/setups/${setupId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      console.error(err);
      showToast('Could not post comment.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [setupId, authFetch, showToast]);

  const removeCommentFromState = useCallback((commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  const deleteComment = useCallback(async (commentId) => {
    // Optimistic remove
    removeCommentFromState(commentId);
    try {
      const res = await authFetch(`/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
    } catch (err) {
      console.error(err);
      showToast('Could not delete comment.', 'error');
      // Re-fetch to restore correct state
      setFetched(false);
    }
  }, [authFetch, showToast, removeCommentFromState]);

  return { comments, loading, submitting, fetched, fetchComments, addComment, deleteComment, removeCommentFromState };
}
