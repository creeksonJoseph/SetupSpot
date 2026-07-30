import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal, Share2, Bookmark } from "lucide-react";
import ShareMenu from "./ShareMenu";

const PostSocialBar = ({
  author,
  authorAvatar,
  isLiked,
  likeCount,
  commentCount,
  commentsOpen,
  onToggleLike,
  onToggleComments,
  onToggleFavorite,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const moreRef = useRef(null);

  // Close 3-dot popover when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleShareClick = () => {
    setShareModalOpen(true);
    setMoreOpen(false);
  };

  const handleFavorite = () => {
    onToggleFavorite();
    setMoreOpen(false);
  };

  const avatarInitial = author ? author[0].toUpperCase() : "?";

  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-3 border-t"
        style={{ borderColor: "#E2E8F0", backgroundColor: "#ffffff" }}
      >
        {/* Author */}
        <div className="flex items-center gap-2.5">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={author}
              className="w-9 h-9 rounded-full object-cover border"
              style={{ borderColor: "#E2E8F0" }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: "#0066ff" }}
            >
              {avatarInitial}
            </div>
          )}
          <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>
            @{author}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            onClick={onToggleLike}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors cursor-pointer"
            style={{ backgroundColor: isLiked ? "rgba(225,29,72,0.08)" : "transparent" }}
            onMouseEnter={(e) => {
              if (!isLiked) e.currentTarget.style.backgroundColor = "#f7f9fb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isLiked ? "rgba(225,29,72,0.08)" : "transparent";
            }}
            title="Like"
          >
            <Heart
              size={20}
              style={{
                color: isLiked ? "#e11d48" : "#727687",
                fill: isLiked ? "#e11d48" : "none",
                transition: "all 0.15s ease",
              }}
            />
            {likeCount > 0 && (
              <span className="text-xs font-semibold" style={{ color: isLiked ? "#e11d48" : "#727687" }}>
                {likeCount}
              </span>
            )}
          </button>

          {/* Comments */}
          <button
            onClick={onToggleComments}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors cursor-pointer"
            style={{ backgroundColor: commentsOpen ? "rgba(0,102,255,0.08)" : "transparent" }}
            onMouseEnter={(e) => {
              if (!commentsOpen) e.currentTarget.style.backgroundColor = "#f7f9fb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = commentsOpen ? "rgba(0,102,255,0.08)" : "transparent";
            }}
            title="Comments"
          >
            <MessageCircle
              size={20}
              style={{ color: commentsOpen ? "#0066ff" : "#727687" }}
            />
            {commentCount > 0 && (
              <span className="text-xs font-semibold" style={{ color: commentsOpen ? "#0066ff" : "#727687" }}>
                {commentCount}
              </span>
            )}
          </button>

          {/* 3-dot menu */}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center justify-center rounded-lg w-9 h-9 transition-colors cursor-pointer"
              style={{ backgroundColor: moreOpen ? "#f7f9fb" : "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = moreOpen ? "#f7f9fb" : "transparent";
              }}
              title="More options"
            >
              <MoreHorizontal size={20} style={{ color: "#727687" }} />
            </button>

            {moreOpen && (
              <div
                className="absolute right-0 bottom-full mb-2 w-48 rounded-xl border shadow-lg overflow-hidden z-50 animate-fadeIn"
                style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
              >
                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors cursor-pointer"
                  style={{ color: "#0F172A" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Share2 size={16} style={{ color: "#727687" }} />
                  <span>Share Setup</span>
                </button>
                <button
                  onClick={handleFavorite}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors border-t cursor-pointer"
                  style={{ color: "#0F172A", borderColor: "#E2E8F0" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Bookmark size={16} style={{ color: "#727687" }} />
                  <span>Save to Favourites</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal Popup */}
      {shareModalOpen && (
        <ShareMenu
          customUrl={window.location.href}
          title={`Check out @${author}'s setup on SetupSpot`}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </>
  );
};

export default PostSocialBar;

