import { useState, useCallback } from 'react';
import { useAuthFetch } from './useAuthFetch';
import { useToast } from '../context/ToastContext';

/**
 * useComments — fetches and manages comments, likes, and replies for a single setup.
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

  const addComment = useCallback(async (body, parentId = null) => {
    if (!body.trim() || !setupId) return;
    setSubmitting(true);
    try {
      const payload = { body, parent_id: parentId };
      const res = await authFetch(`/setups/${setupId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const toggleLikeComment = useCallback(async (commentId) => {
    // Optimistic toggle
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const newIsLiked = !c.is_liked;
        const newCount = newIsLiked ? (c.like_count || 0) + 1 : Math.max(0, (c.like_count || 0) - 1);
        return { ...c, is_liked: newIsLiked, like_count: newCount };
      })
    );

    try {
      const res = await authFetch(`/comments/${commentId}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to like comment');
      const data = await res.json();
      // Sync exact server values
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, is_liked: data.is_liked, like_count: data.like_count } : c))
      );
    } catch (err) {
      console.error(err);
      showToast('Could not update comment like.', 'error');
      // Re-fetch to restore state
      setFetched(false);
    }
  }, [authFetch, showToast]);

  const removeCommentFromState = useCallback((commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
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
      setFetched(false);
    }
  }, [authFetch, showToast, removeCommentFromState]);

  return {
    comments,
    loading,
    submitting,
    fetched,
    fetchComments,
    addComment,
    toggleLikeComment,
    deleteComment,
    removeCommentFromState,
  };
}
