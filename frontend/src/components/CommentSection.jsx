import React, { useEffect, useRef, useState } from "react";
import { Send, Loader2, Trash2, MoreVertical, ShieldAlert, Heart, CornerDownRight, X, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import AuthPromptModal from "./auth/AuthPromptModal";
import { DeletePostModal } from "./account/DeletePostModal";
import { CommentsSkeleton } from "./CardSkeleton";

const CommentSection = ({ setupId, onCommentCountChange }) => {
  const {
    comments,
    loading,
    submitting,
    fetched,
    fetchComments,
    addComment,
    toggleLikeComment,
    deleteComment,
    removeCommentFromState,
  } = useComments(setupId);

  const { auth } = useAuth();
  const { adminDeleteComment } = useAdmin();
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState(null); // { id, author }
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: null, isAdmin: false });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const isAdmin = Boolean(
    auth?.is_admin || (auth?.email && auth.email.toLowerCase() === "charanajoseph@gmail.com")
  );

  // Fetch on first mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Notify parent of count changes for the icon badge
  useEffect(() => {
    if (fetched) onCommentCountChange?.(comments.length);
  }, [comments.length, fetched, onCommentCountChange]);

  // Close admin/owner comment menu on outside click anywhere
  useEffect(() => {
    if (!activeMenuId) return;
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  const handleStartReply = (comment) => {
    if (!auth?.token && !auth?.user) {
      setAuthModalOpen(true);
      return;
    }
    setReplyTarget({ id: comment.id, author: comment.author });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!draft.trim() || submitting) return;

    if (!auth?.token && !auth?.user) {
      setAuthModalOpen(true);
      return;
    }

    const text = draft.trim();
    const parentId = replyTarget?.id || null;

    setDraft("");
    setReplyTarget(null);

    await addComment(text, parentId);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment(e);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "Just now";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const handleConfirmDeleteComment = async () => {
    if (!deleteModal.commentId) return;
    const targetId = deleteModal.commentId;
    const isAdminDelete = deleteModal.isAdmin;

    removeCommentFromState(targetId);
    setDeleteModal({ isOpen: false, commentId: null, isAdmin: false });
    setActiveMenuId(null);

    if (isAdminDelete) {
      await adminDeleteComment(targetId);
    } else {
      await deleteComment(targetId);
    }
  };

  // Group comments into threaded parent-child structure
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent_id) {
      acc[c.parent_id] = acc[c.parent_id] || [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  const renderCommentItem = (c, isReply = false) => {
    const initial = c.author ? c.author[0].toUpperCase() : "?";
    const isOwn = auth?.username === c.author;
    const childReplies = repliesByParent[c.id] || [];

    return (
      <div
        key={c.id}
        className={`flex flex-col gap-1 ${
          isReply
            ? "ml-5 pl-3 border-l-2 border-slate-300/80 my-1 pt-1"
            : "py-2.5 border-b border-slate-200/60 last:border-b-0"
        }`}
      >
        <div className="flex gap-2.5 relative group">
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
                <span className="text-[11px]" style={{ color: "#727687" }}>
                  {formatDate(c.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 relative">
                {/* Admin or Owner Controls */}
                {isAdmin ? (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === c.id ? null : c.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
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
                        {isOwn && (
                          <button
                            onClick={() =>
                              setDeleteModal({ isOpen: true, commentId: c.id, isAdmin: false })
                            }
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 text-left transition-colors"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setDeleteModal({ isOpen: true, commentId: c.id, isAdmin: true })
                          }
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-700 font-semibold hover:bg-red-50 text-left transition-colors"
                        >
                          <ShieldAlert size={13} />
                          <span>Admin Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : isOwn ? (
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: true, commentId: c.id, isAdmin: false })
                    }
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete comment"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : null}
              </div>
            </div>

            <p className="text-xs sm:text-sm mt-0.5 leading-relaxed break-words" style={{ color: "#334155" }}>
              {c.body}
            </p>

            {/* Comment Actions Row: Heart Like + Reply Button */}
            <div className="flex items-center gap-3 mt-1 pt-0.5">
              <button
                onClick={() => {
                  if (!auth?.token && !auth?.user) {
                    setAuthModalOpen(true);
                    return;
                  }
                  toggleLikeComment(c.id);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer hover:text-rose-600"
                style={{ color: c.is_liked ? "#e11d48" : "#94A3B8" }}
              >
                <Heart size={12} className={c.is_liked ? "fill-rose-600 text-rose-600" : ""} />
                <span>{c.like_count > 0 ? c.like_count : "Like"}</span>
              </button>

              <button
                onClick={() => handleStartReply(c)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <CornerDownRight size={11} />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>

        {/* Render child replies recursively */}
        {childReplies.length > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            {childReplies.map((reply) => renderCommentItem(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex flex-col border-t shadow-xs"
      style={{ borderColor: "#CBD5E1", backgroundColor: "#F1F5F9", maxHeight: "420px" }}
    >
      {/* Visual Hierarchy Section Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-200/70 border-b border-slate-300/80 shrink-0">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MessageCircle size={14} className="text-blue-600 fill-blue-600/20" />
          Comments ({comments.length})
        </span>
      </div>
      {/* Comments list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {loading && <CommentsSkeleton count={3} />}

        {!loading && comments.length === 0 && (
          <p className="text-center text-xs font-medium py-6" style={{ color: "#727687" }}>
            No comments yet. Be the first to start the discussion!
          </p>
        )}

        {topLevelComments.map((c) => renderCommentItem(c, false))}
      </div>

      {/* Replying Banner Indicator */}
      {replyTarget && (
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-blue-50/80 border-t border-blue-100 text-xs font-semibold text-blue-700">
          <span>Replying to <span className="font-bold">@{replyTarget.author}</span></span>
          <button
            onClick={() => setReplyTarget(null)}
            className="p-0.5 rounded-full hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
            title="Cancel reply"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Composer Bar */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 bg-white border-t"
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
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            replyTarget
              ? `Reply to @${replyTarget.author}…`
              : auth
                ? "Add a comment…"
                : "Sign in to comment"
          }
          disabled={!auth || submitting}
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
          style={{ color: "#0F172A" }}
        />
        <button
          onClick={handleSendComment}
          disabled={!draft.trim() || submitting || !auth}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
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
        actionName="comment & reply"
      />
    </div>
  );
};

export default CommentSection;
