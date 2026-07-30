import { useState, useCallback } from "react";
import { useAuthFetch } from "./useAuthFetch";
import { useToast } from "../context/ToastContext";

export const useAdmin = () => {
  const authFetch = useAuthFetch();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [setupsList, setSetupsList] = useState([]);
  const [collectionsList, setCollectionsList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(null);
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
    setLoadingTab("users");
    try {
      const res = await authFetch("/admin/users");
      if (!res.ok) throw new Error("Failed to load users list");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Admin users error:", err);
    } finally {
      setLoadingTab(null);
    }
  }, [authFetch]);

  const fetchAdminSetups = useCallback(async () => {
    setLoadingTab("setups");
    try {
      const res = await authFetch("/admin/setups");
      if (!res.ok) throw new Error("Failed to load setups list");
      const data = await res.json();
      setSetupsList(data);
    } catch (err) {
      console.error("Admin setups error:", err);
    } finally {
      setLoadingTab(null);
    }
  }, [authFetch]);

  const fetchAdminCollections = useCallback(async () => {
    setLoadingTab("collections");
    try {
      const res = await authFetch("/admin/collections");
      if (!res.ok) throw new Error("Failed to load collections list");
      const data = await res.json();
      setCollectionsList(data);
    } catch (err) {
      console.error("Admin collections error:", err);
    } finally {
      setLoadingTab(null);
    }
  }, [authFetch]);

  const fetchFeedback = useCallback(async () => {
    setLoadingTab("feedback");
    try {
      const res = await authFetch("/feedback");
      if (!res.ok) throw new Error("Failed to load feedback list");
      const data = await res.json();
      setFeedbackList(data);
    } catch (err) {
      console.error("Admin feedback error:", err);
    } finally {
      setLoadingTab(null);
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

  const adminDeleteUser = useCallback(
    async (userId) => {
      try {
        const res = await authFetch(`/admin/users/${userId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to delete user");
        }
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast("User deleted cleanly as admin", "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to delete user", "error");
        return false;
      }
    },
    [authFetch, showToast]
  );

  const adminDeleteSetup = useCallback(
    async (setupId) => {
      try {
        const res = await authFetch(`/admin/setups/${setupId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete setup");
        setSetupsList((prev) => prev.filter((s) => s.id !== setupId));
        showToast("Setup deleted cleanly as admin", "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to delete setup", "error");
        return false;
      }
    },
    [authFetch, showToast]
  );

  const adminDeleteCollection = useCallback(
    async (collectionId) => {
      try {
        const res = await authFetch(`/admin/collections/${collectionId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete collection");
        setCollectionsList((prev) => prev.filter((c) => c.id !== collectionId));
        showToast("Collection deleted cleanly as admin", "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to delete collection", "error");
        return false;
      }
    },
    [authFetch, showToast]
  );

  const adminBulkDeleteUsers = useCallback(
    async (userIds) => {
      try {
        const res = await authFetch("/admin/users/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: userIds }),
        });
        if (!res.ok) throw new Error("Failed to bulk delete users");
        setUsers((prev) => prev.filter((u) => !userIds.includes(u.id)));
        showToast(`Bulk deleted ${userIds.length} users`, "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to bulk delete users", "error");
        return false;
      }
    },
    [authFetch, showToast]
  );

  const adminBulkDeleteSetups = useCallback(
    async (setupIds) => {
      try {
        const res = await authFetch("/admin/setups/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: setupIds }),
        });
        if (!res.ok) throw new Error("Failed to bulk delete setups");
        setSetupsList((prev) => prev.filter((s) => !setupIds.includes(s.id)));
        showToast(`Bulk deleted ${setupIds.length} setups`, "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to bulk delete setups", "error");
        return false;
      }
    },
    [authFetch, showToast]
  );

  const adminBulkDeleteCollections = useCallback(
    async (collectionIds) => {
      try {
        const res = await authFetch("/admin/collections/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: collectionIds }),
        });
        if (!res.ok) throw new Error("Failed to bulk delete collections");
        setCollectionsList((prev) => prev.filter((c) => !collectionIds.includes(c.id)));
        showToast(`Bulk deleted ${collectionIds.length} collections`, "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to bulk delete collections", "error");
        return false;
      }
    },
    [authFetch, showToast]
  );


  const replyToFeedback = useCallback(
    async (feedbackId, replyMessage) => {
      try {
        const res = await authFetch(`/feedback/${feedbackId}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply_message: replyMessage }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to send email reply");
        }
        const updated = await res.json();
        setFeedbackList((prev) =>
          prev.map((item) => (item.id === feedbackId ? updated : item))
        );
        showToast("Reply email sent to user!", "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to send email reply", "error");
        return false;
      }
    },
    [authFetch, showToast]
  );

  return {
    stats,
    users,
    setupsList,
    collectionsList,
    feedbackList,
    loading,
    loadingTab,
    error,

    fetchDashboard,
    fetchUsers,
    fetchAdminSetups,
    fetchAdminCollections,
    fetchFeedback,
    adminDeleteComment,
    adminDeleteUser,
    adminDeleteSetup,
    adminDeleteCollection,
    adminBulkDeleteUsers,
    adminBulkDeleteSetups,
    adminBulkDeleteCollections,
    replyToFeedback,
  };
};



