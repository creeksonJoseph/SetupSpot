import React, { useEffect, useRef, useState } from "react";
import { Send, Loader2, Trash2, MoreVertical, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import AuthPromptModal from "./auth/AuthPromptModal";
import { DeletePostModal } from "./account/DeletePostModal";

const CommentSection = ({ setupId, onCommentCountChange }) => {
  const { comments, loading, submitting, fetched, fetchComments, addComment, deleteComment } =
    useComments(setupId);
  const { auth } = useAuth();
  const { adminDeleteComment } = useAdmin();
  const [draft, setDraft] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: null, isAdmin: false });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const listEndRef = useRef(null);


  const isAdmin = Boolean(
    auth?.is_admin || (auth?.email && auth.email.toLowerCase() === "charanajoseph@gmail.com")
  );

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
    if (!auth?.token && !auth?.user) {
      setAuthModalOpen(true);
      return;
    }
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

  const handleConfirmDeleteComment = async () => {
    if (!deleteModal.commentId) return;
    if (deleteModal.isAdmin) {
      const ok = await adminDeleteComment(deleteModal.commentId);
      if (ok) fetchComments();
    } else {
      await deleteComment(deleteModal.commentId);
    }
    setActiveMenuId(null);
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
            <div key={c.id} className="flex gap-2.5 relative group">
              <Link to={`/user/${c.author}`} className="shrink-0 mt-0.5 group/avatar">
                {c.author_avatar ? (
                  <img
                    src={c.author_avatar}
                    alt={c.author}
                    className="w-7 h-7 rounded-full object-cover border transition-opacity group-hover/avatar:opacity-75"
                    style={{ borderColor: "#E2E8F0" }}
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white transition-opacity group-hover/avatar:opacity-75"
                    style={{ backgroundColor: "#0066ff" }}
                  >
                    {initial}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <Link
                      to={`/user/${c.author}`}
                      className="text-xs font-bold hover:underline"
                      style={{ color: "#0F172A" }}
                    >
                      @{c.author}
                    </Link>
                    <span className="text-xs" style={{ color: "#727687" }}>
                      {formatDate(c.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 relative">
                    {/* Admin 3-Dots Menu */}
                    {isAdmin ? (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === c.id ? null : c.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Admin comment controls"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {activeMenuId === c.id && (
                          <div
                            className="absolute right-0 top-6 z-30 w-36 bg-white border rounded-xl shadow-lg py-1 animate-fadeIn"
                            style={{ borderColor: "#E2E8F0" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setDeleteModal({ isOpen: true, commentId: c.id, isAdmin: true });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <ShieldAlert size={13} />
                              <span>Delete Comment</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Regular owner deletion */
                      isOwn && (
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, commentId: c.id, isAdmin: false })}
                          className="transition-colors cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 size={12} style={{ color: "#cbd5e1" }} />
                        </button>
                      )
                    )}

                  </div>
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

      <DeletePostModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDeleteComment}
        title="Delete Comment?"
        confirmText="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
      />

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName="post comments"
      />
    </div>
  );
};

export default CommentSection;

