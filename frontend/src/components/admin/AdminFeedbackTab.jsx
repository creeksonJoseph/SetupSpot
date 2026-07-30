import React from "react";
import { CheckCircle2, Loader2, Send, Mail } from "lucide-react";

export const AdminFeedbackTab = ({
  filteredFeedback,
  feedbackList,
  feedbackCategoryFilter,
  setFeedbackCategoryFilter,
  visibleLimits,
  replyingToId,
  setReplyingToId,
  replyText,
  setReplyText,
  sendingReply,
  handleSendReply,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Header & Category Filter Bar */}
      <div
        className="flex items-center justify-between gap-4 flex-wrap bg-white p-4  border shadow-2xs"
        style={{ borderColor: "#E2E8F0" }}
      >
        <div>
          <h3 className="text-base font-bold" style={{ color: "#0F172A" }}>
            User Feedback ({filteredFeedback.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Filter suggestions, bug reports, and design feedback</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500">Category:</span>
          <select
            value={feedbackCategoryFilter}
            onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            style={{ borderColor: "#CBD5E1" }}
          >
            <option value="all">All Categories ({feedbackList.length})</option>
            <option value="feature_suggestion">💡 Feature Suggestions</option>
            <option value="ui_improvement">🎨 UI & Design Improvements</option>
            <option value="bug_report">🐞 Bug Reports</option>
            <option value="other">💬 General Feedback</option>
          </select>
        </div>
      </div>

      {filteredFeedback.length === 0 ? (
        <div className="p-12 text-center bg-white border" style={{ borderColor: "#E2E8F0" }}>
          <p className="text-xs text-slate-400">No user feedback found matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedback.slice(0, visibleLimits.feedback).map((fb) => (
            <div
              key={fb.id}
              className="p-5 border bg-white flex flex-col justify-between shadow-2xs hover:shadow-md transition-all"
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

              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#F1F5F9" }}>
                <span className="text-[10px] font-mono text-slate-400">
                  {fb.created_at ? new Date(fb.created_at).toLocaleString() : "Recently"}
                </span>

                {replyingToId !== fb.id && (
                  <button
                    onClick={() => {
                      setReplyingToId(fb.id);
                      setReplyText("");
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Mail size={13} /> Reply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
