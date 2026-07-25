import React, { useEffect, useRef, useState } from "react";
import { Send, Loader2, Trash2 } from "lucide-react";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../context/AuthContext";

const CommentSection = ({ setupId, onCommentCountChange }) => {
  const { comments, loading, submitting, fetched, fetchComments, addComment, deleteComment } =
    useComments(setupId);
  const { auth } = useAuth();
  const [draft, setDraft] = useState("");
  const listEndRef = useRef(null);

  // Fetch on first mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Scroll to bottom on new comments
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  // Notify parent of count changes for the icon badge
  useEffect(() => {
    if (fetched) onCommentCountChange?.(comments.length);
  }, [comments.length, fetched, onCommentCountChange]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    await addComment(draft.trim());
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div
      className="flex flex-col border-t"
      style={{ borderColor: "#E2E8F0", backgroundColor: "#ffffff", maxHeight: "340px" }}
    >
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={20} className="animate-spin" style={{ color: "#0066ff" }} />
          </div>
        )}

        {!loading && comments.length === 0 && (
          <p className="text-center text-sm py-4" style={{ color: "#727687" }}>
            No comments yet. Be the first!
          </p>
        )}

        {comments.map((c) => {
          const initial = c.author ? c.author[0].toUpperCase() : "?";
          const isOwn = auth?.username === c.author;

          return (
            <div key={c.id} className="flex gap-2.5">
              {c.author_avatar ? (
                <img
                  src={c.author_avatar}
                  alt={c.author}
                  className="w-7 h-7 rounded-full object-cover border shrink-0 mt-0.5"
                  style={{ borderColor: "#E2E8F0" }}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: "#0066ff" }}
                >
                  {initial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold" style={{ color: "#0F172A" }}>
                    @{c.author}
                  </span>
                  <span className="text-xs" style={{ color: "#727687" }}>
                    {formatDate(c.created_at)}
                  </span>
                  {isOwn && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="ml-auto transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 size={12} style={{ color: "#cbd5e1" }} />
                    </button>
                  )}
                </div>
                <p className="text-sm mt-0.5 break-words" style={{ color: "#475569" }}>
                  {c.body}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={listEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-t"
        style={{ borderColor: "#E2E8F0" }}
      >
        {auth?.username ? (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: "#0066ff" }}
          >
            {auth.username[0].toUpperCase()}
          </div>
        ) : null}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={auth ? "Add a comment…" : "Sign in to comment"}
          disabled={!auth || submitting}
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
          style={{ color: "#0F172A" }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || submitting || !auth}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-40"
          style={{ backgroundColor: "#0066ff" }}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0050cb")}
          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0066ff")}
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin text-white" />
          ) : (
            <Send size={14} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
