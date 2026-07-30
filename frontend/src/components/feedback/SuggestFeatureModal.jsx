import React, { useState } from "react";
import { X, MessageSquarePlus, Send, Loader2 } from "lucide-react";
import { useFeedback } from "../../hooks/useFeedback";

export const SuggestFeatureModal = ({ isOpen, onClose }) => {
  const { submitting, submitSuggestion } = useFeedback();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("feature_suggestion");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;
    const ok = await submitSuggestion(message, category);
    if (ok) {
      setMessage("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all transform scale-100"
        style={{ borderColor: "#E2E8F0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#F1F5F9" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border"
              style={{
                backgroundColor: "rgba(0,102,255,0.08)",
                borderColor: "rgba(0,102,255,0.2)",
                color: "#0066ff",
              }}
            >
              <MessageSquarePlus size={20} />
            </div>

            <div>
              <h2 className="text-lg font-black leading-tight" style={{ color: "#0F172A" }}>
                Suggest Features & Feedback
              </h2>
              <p className="text-xs font-medium mt-0.5" style={{ color: "#727687" }}>
                Help us make SetupSpot even better!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <p className="text-sm font-semibold leading-relaxed" style={{ color: "#334155" }}>
            Tell us what you think about SetupSpot and what could be done to make it better:
          </p>

          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#475569" }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
            >
              <option value="feature_suggestion">✨ Feature Suggestion</option>
              <option value="ui_improvement">🎨 UI & Design Improvement</option>
              <option value="bug_report">🐞 Bug Report</option>
              <option value="other">💬 General Feedback</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "#475569" }}>
              Your Feedback
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="I would love to see a feature where..."
              className="w-full px-4 py-3 rounded-2xl border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:bg-slate-100 cursor-pointer"
              style={{ borderColor: "#E2E8F0", color: "#475569" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "#0066ff" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit Suggestion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
