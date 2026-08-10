import React, { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { useAuth } from "../context/AuthContext";
import { Navigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Image,
  MessageSquare,
  FolderHeart,
  Lightbulb,
  TrendingUp,
  Loader2,
  Mail,
  UserCheck,
  Send,
  CheckCircle2,
  Search,
  Trash2,
  Layers,
  FolderOpen,
} from "lucide-react";

import { AdminDashboardSkeleton } from "../components/CardSkeleton";
import { DeletePostModal } from "../components/account/DeletePostModal";
import { AdminOverviewTab } from "../components/admin/AdminOverviewTab";
import { AdminUsersTab } from "../components/admin/AdminUsersTab";
import { AdminSetupsTab } from "../components/admin/AdminSetupsTab";
import { AdminCollectionsTab } from "../components/admin/AdminCollectionsTab";
import { AdminFeedbackTab } from "../components/admin/AdminFeedbackTab";

const TabSkeletonLoader = () => (
  <div className="p-6 bg-white border shadow-2xs space-y-4 animate-pulse" style={{ borderColor: "#E2E8F0" }}>
    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
      <div className="h-4 w-40 bg-slate-200 rounded-md" />
      <div className="h-4 w-20 bg-slate-100 rounded-md" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-11 w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-200" />
            <div className="h-3.5 w-32 bg-slate-200 rounded-md" />
          </div>
          <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

export const AdminPortalPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const initialFeedbackId = searchParams.get("id") ? parseInt(searchParams.get("id"), 10) : null;

  const { auth } = useAuth();
  const {
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
    adminDeleteUser,
    adminDeleteSetup,
    adminDeleteCollection,
    adminBulkDeleteUsers,
    adminBulkDeleteSetups,
    adminBulkDeleteCollections,
    replyToFeedback,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("all");
  const [replyingToId, setReplyingToId] = useState(initialFeedbackId);

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Lazy tab loaded flags
  const [loadedTabs, setLoadedTabs] = useState({
    overview: false,
    users: false,
    setups: false,
    collections: false,
    feedback: false,
  });

  // Progressive rendering chunk limit
  const [visibleLimits, setVisibleLimits] = useState({
    users: 25,
    setups: 25,
    collections: 25,
    feedback: 25,
  });

  // Multi-select state
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedSetupIds, setSelectedSetupIds] = useState([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);

  // Confirmation Modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Delete",
    setupTitle: "",
    setupImage: "",
    onConfirm: async () => {},
  });

  const isAdmin = Boolean(
    auth?.is_admin || (auth?.email && auth.email.toLowerCase() === "charanajoseph@gmail.com")
  );

  // Fetch initial dashboard stats
  useEffect(() => {
    if (isAdmin && !loadedTabs.overview) {
      fetchDashboard();
      setLoadedTabs((prev) => ({ ...prev, overview: true }));
    }
  }, [isAdmin, fetchDashboard, loadedTabs.overview]);

  // Lazy load tab data when switching tabs
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "users" && !loadedTabs.users) {
      fetchUsers();
      setLoadedTabs((prev) => ({ ...prev, users: true }));
    } else if (activeTab === "setups" && !loadedTabs.setups) {
      fetchAdminSetups();
      setLoadedTabs((prev) => ({ ...prev, setups: true }));
    } else if (activeTab === "collections" && !loadedTabs.collections) {
      fetchAdminCollections();
      setLoadedTabs((prev) => ({ ...prev, collections: true }));
    } else if (activeTab === "feedback" && !loadedTabs.feedback) {
      fetchFeedback();
      setLoadedTabs((prev) => ({ ...prev, feedback: true }));
    }
  }, [
    activeTab,
    isAdmin,
    loadedTabs,
    fetchUsers,
    fetchAdminSetups,
    fetchAdminCollections,
    fetchFeedback,
  ]);


  const handleSendReply = async (feedbackId) => {
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    const ok = await replyToFeedback(feedbackId, replyText.trim());
    setSendingReply(false);
    if (ok) {
      setReplyingToId(null);
      setReplyText("");
    }
  };

  const handleDeleteUser = (user) => {
    if (user.email.toLowerCase() === "charanajoseph@gmail.com") {
      alert("Cannot delete the primary admin account!");
      return;
    }
    setDeleteModal({
      isOpen: true,
      title: "Delete User Account?",
      description: `Are you sure you want to permanently delete @${user.username} (${user.email}) and all associated setups, collections, and data?`,
      confirmText: "Delete User",
      onConfirm: async () => {
        await adminDeleteUser(user.id);
      },
    });
  };

  const handleDeleteSetup = (setup) => {
    setDeleteModal({
      isOpen: true,
      title: "Delete Setup?",
      description: `Are you sure you want to delete setup "${setup.name}" by @${setup.author}?`,
      confirmText: "Delete Setup",
      setupTitle: setup.name,
      setupImage: setup.image_url,
      onConfirm: async () => {
        await adminDeleteSetup(setup.id);
      },
    });
  };

  const handleDeleteCollection = (collection) => {
    setDeleteModal({
      isOpen: true,
      title: "Delete Collection?",
      description: `Are you sure you want to delete collection "${collection.name}" by @${collection.owner}?`,
      confirmText: "Delete Collection",
      onConfirm: async () => {
        await adminDeleteCollection(collection.id);
      },
    });
  };

  // Bulk Deletion Handlers
  const handleBulkDeleteUsers = () => {
    if (selectedUserIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: "Bulk Delete Users?",
      description: `Are you sure you want to permanently delete ${selectedUserIds.length} selected user accounts and all associated data?`,
      confirmText: `Delete ${selectedUserIds.length} Users`,
      onConfirm: async () => {
        const ok = await adminBulkDeleteUsers(selectedUserIds);
        if (ok) setSelectedUserIds([]);
      },
    });
  };

  const handleBulkDeleteSetups = () => {
    if (selectedSetupIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: "Bulk Delete Setups?",
      description: `Are you sure you want to permanently delete ${selectedSetupIds.length} selected setups?`,
      confirmText: `Delete ${selectedSetupIds.length} Setups`,
      onConfirm: async () => {
        const ok = await adminBulkDeleteSetups(selectedSetupIds);
        if (ok) setSelectedSetupIds([]);
      },
    });
  };

  const handleBulkDeleteCollections = () => {
    if (selectedCollectionIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: "Bulk Delete Collections?",
      description: `Are you sure you want to permanently delete ${selectedCollectionIds.length} selected collections?`,
      confirmText: `Delete ${selectedCollectionIds.length} Collections`,
      onConfirm: async () => {
        const ok = await adminBulkDeleteCollections(selectedCollectionIds);
        if (ok) setSelectedCollectionIds([]);
      },
    });
  };



  const q = searchQuery.toLowerCase().trim();

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );

  const filteredSetups = setupsList.filter(
    (s) => s.name.toLowerCase().includes(q) || s.author.toLowerCase().includes(q)
  );

  const filteredCollections = collectionsList.filter(
    (c) => c.name.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q)
  );

  const filteredFeedback = feedbackList.filter((f) => {
    const matchesCategory =
      feedbackCategoryFilter === "all" || f.category === feedbackCategoryFilter;
    const matchesSearch =
      !q ||
      f.username.toLowerCase().includes(q) ||
      f.user_email.toLowerCase().includes(q) ||
      f.message.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });


  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-lg font-bold text-red-600">Access Restricted</p>
        <p className="text-xs text-slate-500">You must be logged in as an admin to view this portal.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: "rgba(0,102,255,0.08)",
                borderColor: "rgba(0,102,255,0.2)",
                color: "#0066ff",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-[-0.033em]" style={{ color: "#0F172A" }}>
              Admin Control Portal
            </h1>
          </div>
          <p className="text-xs font-medium mt-1" style={{ color: "#475569" }}>
            Backend-aggregated system governance, entity moderation, and feedback management.
          </p>
        </div>

        {/* Universal Search Bar */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, setups, collections..."
            className="w-full pl-10 pr-8 py-2 text-xs font-medium bg-white rounded-2xl border shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            style={{ borderColor: "#CBD5E1" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: activeTab === "overview" ? "#0066ff" : "transparent",
            color: activeTab === "overview" ? "#ffffff" : "#64748B",
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: activeTab === "users" ? "#0066ff" : "transparent",
            color: activeTab === "users" ? "#ffffff" : "#64748B",
          }}
        >
          Users ({loadedTabs.users ? filteredUsers.length : (stats?.total_users ?? 0)})
        </button>
        <button
          onClick={() => setActiveTab("setups")}
          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: activeTab === "setups" ? "#0066ff" : "transparent",
            color: activeTab === "setups" ? "#ffffff" : "#64748B",
          }}
        >
          Setups ({loadedTabs.setups ? filteredSetups.length : (stats?.total_setups ?? 0)})
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: activeTab === "collections" ? "#0066ff" : "transparent",
            color: activeTab === "collections" ? "#ffffff" : "#64748B",
          }}
        >
          Collections ({loadedTabs.collections ? filteredCollections.length : (stats?.total_collections ?? 0)})
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: activeTab === "feedback" ? "#0066ff" : "transparent",
            color: activeTab === "feedback" ? "#ffffff" : "#64748B",
          }}
        >
          User Feedback ({loadedTabs.feedback ? filteredFeedback.length : (stats?.total_feedback ?? 0)})
        </button>
      </div>



      {loading ? (
        <AdminDashboardSkeleton />
      ) : error ? (

        <p className="text-center text-sm font-semibold text-red-600 py-12">{error}</p>
      ) : (
        <>
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="p-4 rounded-2xl border bg-white shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                <Users size={18} style={{ color: "#0066ff" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: "#0F172A" }}>
                {stats?.total_users ?? 0}
              </p>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp size={10} /> +{stats?.recent_users_count_7d ?? 0} past 7d
              </p>
            </div>

            <div className="p-4 rounded-2xl border bg-white shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Setups</span>
                <Image size={18} style={{ color: "#0066ff" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: "#0F172A" }}>
                {stats?.total_setups ?? 0}
              </p>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp size={10} /> +{stats?.recent_setups_count_7d ?? 0} past 7d
              </p>
            </div>

            <div className="p-4 rounded-2xl border bg-white shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Comments</span>
                <MessageSquare size={18} style={{ color: "#0066ff" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: "#0F172A" }}>
                {stats?.total_comments ?? 0}
              </p>
              <p className="text-[10px] font-medium text-slate-500 mt-1">Platform wide</p>
            </div>

            <div className="p-4 rounded-2xl border bg-white shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Collections</span>
                <FolderHeart size={18} style={{ color: "#0066ff" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: "#0F172A" }}>
                {stats?.total_collections ?? 0}
              </p>
              <p className="text-[10px] font-medium text-slate-500 mt-1">Curated folders</p>
            </div>

            <div className="p-4 rounded-2xl border bg-white shadow-2xs col-span-2 sm:col-span-1" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">User Feedback</span>
                <Lightbulb size={18} style={{ color: "#0066ff" }} />
              </div>

              <p className="text-2xl font-black" style={{ color: "#0F172A" }}>
                {stats?.total_feedback ?? 0}
              </p>
              <p className="text-[10px] font-medium text-slate-500 mt-1">Direct feedback</p>
            </div>

          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <AdminOverviewTab
              stats={stats}
              feedbackList={feedbackList}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB 2: USERS */}
          {activeTab === "users" && (
            loadingTab === "users" ? (
              <TabSkeletonLoader />
            ) : (
              <AdminUsersTab
                filteredUsers={filteredUsers}
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                handleBulkDeleteUsers={handleBulkDeleteUsers}
                handleDeleteUser={handleDeleteUser}
                visibleLimits={visibleLimits}
                setVisibleLimits={setVisibleLimits}
              />
            )
          )}

          {/* TAB 3: SETUPS */}
          {activeTab === "setups" && (
            loadingTab === "setups" ? (
              <TabSkeletonLoader />
            ) : (
              <AdminSetupsTab
                filteredSetups={filteredSetups}
                selectedSetupIds={selectedSetupIds}
                setSelectedSetupIds={setSelectedSetupIds}
                handleBulkDeleteSetups={handleBulkDeleteSetups}
                handleDeleteSetup={handleDeleteSetup}
                visibleLimits={visibleLimits}
                setVisibleLimits={setVisibleLimits}
              />
            )
          )}

          {/* TAB 4: COLLECTIONS */}
          {activeTab === "collections" && (
            loadingTab === "collections" ? (
              <TabSkeletonLoader />
            ) : (
              <AdminCollectionsTab
                filteredCollections={filteredCollections}
                selectedCollectionIds={selectedCollectionIds}
                setSelectedCollectionIds={setSelectedCollectionIds}
                handleBulkDeleteCollections={handleBulkDeleteCollections}
                handleDeleteCollection={handleDeleteCollection}
                visibleLimits={visibleLimits}
                setVisibleLimits={setVisibleLimits}
              />
            )
          )}

          {/* TAB 5: USER FEEDBACK */}
          {activeTab === "feedback" && (
            loadingTab === "feedback" ? (
              <TabSkeletonLoader />
            ) : (
              <AdminFeedbackTab
                filteredFeedback={filteredFeedback}
                feedbackList={feedbackList}
                feedbackCategoryFilter={feedbackCategoryFilter}
                setFeedbackCategoryFilter={setFeedbackCategoryFilter}
                visibleLimits={visibleLimits}
                replyingToId={replyingToId}
                setReplyingToId={setReplyingToId}
                replyText={replyText}
                setReplyText={setReplyText}
                sendingReply={sendingReply}
                handleSendReply={handleSendReply}
              />
            )
          )}
        </>
      )}


      {/* Confirmation Modal with Progressive Deleting Animation */}
      <DeletePostModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        confirmText={deleteModal.confirmText}
        description={deleteModal.description}
        setupTitle={deleteModal.setupTitle}
        setupImage={deleteModal.setupImage}
      />
    </div>
  );
};


export default AdminPortalPage;
