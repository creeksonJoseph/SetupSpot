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
} from "lucide-react";


export const AdminPortalPage = () => {
  const { auth } = useAuth();
  const {
    stats,
    users,
    feedbackList,
    loading,
    error,
    fetchDashboard,
    fetchUsers,
    fetchFeedback,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState("overview");

  const isAdmin = Boolean(
    auth?.is_admin || (auth?.email && auth.email.toLowerCase() === "charanajoseph@gmail.com")
  );

  useEffect(() => {
    if (isAdmin) {
      fetchDashboard();
      fetchUsers();
      fetchFeedback();
    }
  }, [isAdmin, fetchDashboard, fetchUsers, fetchFeedback]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
            Backend-aggregated system metrics, user governance, and feature requests.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto border" style={{ borderColor: "#E2E8F0" }}>
          <button
            onClick={() => setActiveTab("overview")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === "overview" ? "#ffffff" : "transparent",
              color: activeTab === "overview" ? "#0066ff" : "#64748B",
              boxShadow: activeTab === "overview" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === "users" ? "#ffffff" : "transparent",
              color: activeTab === "users" ? "#0066ff" : "#64748B",
              boxShadow: activeTab === "users" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === "feedback" ? "#ffffff" : "transparent",
              color: activeTab === "feedback" ? "#0066ff" : "#64748B",
              boxShadow: activeTab === "feedback" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            User Feedback ({feedbackList.length})
          </button>
        </div>
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
                  Registered Users ({users.length})
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
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "#F1F5F9" }}>
                    {users.map((u) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USER FEEDBACK */}
          {activeTab === "feedback" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold px-1" style={{ color: "#0F172A" }}>
                User Feedback ({feedbackList.length})
              </h3>

              {feedbackList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border" style={{ borderColor: "#E2E8F0" }}>
                  <p className="text-xs text-slate-400">No user feedback submitted yet.</p>
                </div>
              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedbackList.map((fb) => (
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
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {fb.category.replace("_", " ")}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border" style={{ borderColor: "#F1F5F9" }}>
                          "{fb.message}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-4 pt-3 border-t" style={{ borderColor: "#F1F5F9" }}>
                        <span>Submitted {new Date(fb.created_at).toLocaleString()}</span>
                        <a
                          href={`mailto:${fb.user_email}`}
                          className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                        >
                          <Mail size={12} /> Reply to User
                        </a>
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
