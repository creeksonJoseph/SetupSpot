import { useState, useCallback } from "react";
import { useAuthFetch } from "./useAuthFetch";
import { useToast } from "../context/ToastContext";

export const useAdmin = () => {
  const authFetch = useAuthFetch();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load admin stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Admin stats error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await authFetch("/admin/users");
      if (!res.ok) throw new Error("Failed to load users list");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Admin users error:", err);
    }
  }, [authFetch]);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await authFetch("/feedback");
      if (!res.ok) throw new Error("Failed to load feedback list");
      const data = await res.json();
      setFeedbackList(data);
    } catch (err) {
      console.error("Admin feedback error:", err);
    }
  }, [authFetch]);

  const adminDeleteComment = useCallback(
    async (commentId) => {
      try {
        const res = await authFetch(`/admin/comments/${commentId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete comment");
        showToast("Comment deleted as admin", "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to delete comment", "error");
        return false;
      }
    },
    [authFetch, showToast]
  );

  return {
    stats,
    users,
    feedbackList,
    loading,
    error,
    fetchDashboard,
    fetchUsers,
    fetchFeedback,
    adminDeleteComment,
  };
};
