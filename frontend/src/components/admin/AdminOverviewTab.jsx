import React from "react";

export const AdminOverviewTab = ({ stats, feedbackList, setActiveTab }) => {
  const displayFeedback = feedbackList.length > 0 ? feedbackList : (stats?.recent_feedback || []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* System Health Card */}
      <div className="p-6 border bg-white shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-base font-bold mb-4" style={{ color: "#0F172A" }}>
          System Health & Metrics
        </h3>
        <div className="flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "#F1F5F9" }}>
            <span className="text-slate-500 font-medium">Database Status</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {stats?.db_status || "Connected & Healthy"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "#F1F5F9" }}>
            <span className="text-slate-500 font-medium">Admin Notification Target</span>
            <span className="font-mono font-semibold" style={{ color: "#0066ff" }}>
              {stats?.admin_email || "charanajoseph@gmail.com"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2" style={{ borderColor: "#F1F5F9" }}>
            <span className="text-slate-500 font-medium">Pre-computed Stats Latency</span>
            <span className="font-semibold text-slate-700">
              {stats?.latency_ms || "< 15 ms"}
            </span>
          </div>
        </div>
      </div>

      {/* User Feedback Card */}
      <div className="p-6 border bg-white shadow-2xs" style={{ borderColor: "#E2E8F0" }}>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: "#0F172A" }}>
            User Feedback
          </h3>
          <button
            onClick={() => setActiveTab("feedback")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All →
          </button>
        </div>
        {displayFeedback.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No user feedback submitted yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {displayFeedback.slice(0, 4).map((fb) => (
              <div key={fb.id} className="p-3 rounded-2xl bg-slate-50 border text-xs" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">@{fb.username}</span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                      {fb.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : "Just now"}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2">{fb.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
