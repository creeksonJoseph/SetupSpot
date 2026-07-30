import React, { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
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


export const AdminPortalPage = () => {
  const { auth } = useAuth();
  const {
    stats,
    users,
    setupsList,
    collectionsList,
    feedbackList,
    loading,
    error,
    fetchDashboard,
    fetchUsers,
    fetchAdminSetups,
    fetchAdminCollections,
    fetchFeedback,
    adminDeleteUser,
    adminDeleteSetup,
    adminDeleteCollection,
    replyToFeedback,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const isAdmin = Boolean(
    auth?.is_admin || (auth?.email && auth.email.toLowerCase() === "charanajoseph@gmail.com")
  );

  useEffect(() => {
    if (isAdmin) {
      fetchDashboard();
      fetchUsers();
      fetchAdminSetups();
      fetchAdminCollections();
      fetchFeedback();
    }
  }, [isAdmin, fetchDashboard, fetchUsers, fetchAdminSetups, fetchAdminCollections, fetchFeedback]);

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

  const handleDeleteUser = async (user) => {
    if (user.email.toLowerCase() === "charanajoseph@gmail.com") {
      alert("Cannot delete the primary admin account!");
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user @${user.username} (${user.email}) and all their setups, collections, and data?`)) {
      await adminDeleteUser(user.id);
    }
  };

  const handleDeleteSetup = async (setup) => {
    if (window.confirm(`Are you sure you want to delete setup "${setup.name}" by @${setup.author}?`)) {
      await adminDeleteSetup(setup.id);
    }
  };

  const handleDeleteCollection = async (collection) => {
    if (window.confirm(`Are you sure you want to delete collection "${collection.name}" by @${collection.owner}?`)) {
      await adminDeleteCollection(collection.id);
    }
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

  const filteredFeedback = feedbackList.filter(
    (f) =>
      f.username.toLowerCase().includes(q) ||
      f.user_email.toLowerCase().includes(q) ||
      f.message.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
  );

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
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
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
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, setups, collections..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-white rounded-2xl border shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            style={{ borderColor: "#CBD5E1" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
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
          Users ({filteredUsers.length})
        </button>
        <button
          onClick={() => setActiveTab("setups")}
          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: activeTab === "setups" ? "#0066ff" : "transparent",
            color: activeTab === "setups" ? "#ffffff" : "#64748B",
          }}
        >
          Setups ({filteredSetups.length})
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: activeTab === "collections" ? "#0066ff" : "transparent",
            color: activeTab === "collections" ? "#ffffff" : "#64748B",
          }}
        >
          Collections ({filteredCollections.length})
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className="px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: activeTab === "feedback" ? "#0066ff" : "transparent",
            color: activeTab === "feedback" ? "#ffffff" : "#64748B",
          }}
        >
          User Feedback ({filteredFeedback.length})
        </button>
      </div>


      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin" style={{ color: "#0066ff" }} />
        </div>
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
              <p className="text-[10px] font-medium text-blue-600 mt-1">Direct feedback</p>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
                <h3 className="text-base font-bold mb-4" style={{ color: "#0F172A" }}>
                  System Health & Metrics
                </h3>
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "#F1F5F9" }}>
                    <span className="text-slate-500 font-medium">Database Status</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Connected & Healthy</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "#F1F5F9" }}>
                    <span className="text-slate-500 font-medium">Admin Notification Target</span>
                    <span className="font-mono font-semibold" style={{ color: "#0066ff" }}>charanajoseph@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-between py-2" style={{ borderColor: "#F1F5F9" }}>
                    <span className="text-slate-500 font-medium">Pre-computed Stats Latency</span>
                    <span className="font-semibold text-slate-700">&lt; 15ms</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
                <h3 className="text-base font-bold mb-4" style={{ color: "#0F172A" }}>
                  User Feedback
                </h3>
                {feedbackList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No user feedback submitted yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {feedbackList.slice(0, 3).map((fb) => (
                      <div key={fb.id} className="p-3 rounded-2xl bg-slate-50 border text-xs" style={{ borderColor: "#E2E8F0" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">@{fb.username}</span>
                          <span className="text-[10px] text-slate-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-2">{fb.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* TAB 2: USERS */}
          {activeTab === "users" && (
            <div className="rounded-3xl border bg-white overflow-hidden shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
              <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
                <h3 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                  Registered Users ({filteredUsers.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b" style={{ borderColor: "#E2E8F0" }}>
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Setups</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Joined</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "#F1F5F9" }}>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {u.username[0].toUpperCase()}
                          </div>
                          <span>@{u.username}</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                        <td className="p-3.5 font-bold text-slate-900">{u.setup_count}</td>
                        <td className="p-3.5">
                          {u.is_admin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                              <UserCheck size={11} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                              Member
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-3.5 text-right">
                          {u.email.toLowerCase() !== "charanajoseph@gmail.com" ? (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Primary Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SETUPS */}
          {activeTab === "setups" && (
            <div className="rounded-3xl border bg-white overflow-hidden shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
              <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
                <h3 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                  All Setups ({filteredSetups.length})
                </h3>
              </div>
              {filteredSetups.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">No setups found matching your query.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b" style={{ borderColor: "#E2E8F0" }}>
                      <tr>
                        <th className="p-3.5">Setup</th>
                        <th className="p-3.5">Author</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Created</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "#F1F5F9" }}>
                      {filteredSetups.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 flex items-center gap-3">
                            <img
                              src={s.image_url}
                              alt={s.name}
                              className="w-10 h-10 rounded-xl object-cover border"
                              style={{ borderColor: "#E2E8F0" }}
                            />
                            <span>{s.name}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">@{s.author}</td>
                          <td className="p-3.5 font-bold text-slate-900">{s.item_count} items</td>
                          <td className="p-3.5 text-slate-500">
                            {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteSetup(s)}
                              className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Setup"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COLLECTIONS */}
          {activeTab === "collections" && (
            <div className="rounded-3xl border bg-white overflow-hidden shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
              <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
                <h3 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                  All Collections ({filteredCollections.length})
                </h3>
              </div>
              {filteredCollections.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">No collections found matching your query.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b" style={{ borderColor: "#E2E8F0" }}>
                      <tr>
                        <th className="p-3.5">Collection Name</th>
                        <th className="p-3.5">Owner</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Created</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "#F1F5F9" }}>
                      {filteredCollections.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <FolderOpen size={16} className="text-blue-600" />
                            <span>{c.name}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">@{c.owner}</td>
                          <td className="p-3.5 font-bold text-slate-900">{c.item_count} items</td>
                          <td className="p-3.5 text-slate-500">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteCollection(c)}
                              className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Collection"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: USER FEEDBACK */}
          {activeTab === "feedback" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold px-1" style={{ color: "#0F172A" }}>
                User Feedback ({filteredFeedback.length})
              </h3>

              {filteredFeedback.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border" style={{ borderColor: "#E2E8F0" }}>
                  <p className="text-xs text-slate-400">No user feedback found matching your query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFeedback.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-5 rounded-3xl border bg-white flex flex-col justify-between shadow-2xs hover:shadow-md transition-all"
                      style={{ borderColor: "#E2E8F0" }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {fb.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">@{fb.username}</p>
                              <p className="text-[10px] font-mono text-slate-500">{fb.user_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {fb.status === "replied" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={11} /> Replied
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {fb.category.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border mb-3" style={{ borderColor: "#F1F5F9" }}>
                          "{fb.message}"
                        </p>

                        {/* Inline Reply Text Box */}
                        {replyingToId === fb.id && (
                          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col gap-2 animate-fadeIn mb-3">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                              <span>Reply via Email</span>
                              <span className="text-[10px] text-slate-400 font-normal">From productteam@setupspot.tech</span>
                            </label>
                            <textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Type your response to @${fb.username}...`}
                              className="w-full text-xs p-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              style={{ borderColor: "#CBD5E1" }}
                            />
                            <p className="text-[10px] text-slate-500 italic">
                              * Disclaimer template will be automatically appended to the email footer.
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingToId(null);
                                  setReplyText("");
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendReply(fb.id)}
                                disabled={!replyText.trim() || sendingReply}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: "#0066ff" }}
                              >
                                {sendingReply ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={13} />
                                    <span>Send Email</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-3 border-t" style={{ borderColor: "#F1F5F9" }}>
                        <span>Submitted {new Date(fb.created_at).toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (replyingToId === fb.id) {
                              setReplyingToId(null);
                            } else {
                              setReplyingToId(fb.id);
                              setReplyText("");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline cursor-pointer text-xs"
                        >
                          <Mail size={13} />
                          <span>{replyingToId === fb.id ? "Close Reply" : "Reply to User"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </>
      )}
    </main>
  );
};

export default AdminPortalPage;
