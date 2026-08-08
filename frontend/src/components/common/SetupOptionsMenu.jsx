import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Share2, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ShareMenu } from "../ShareMenu";
import AuthPromptModal from "../auth/AuthPromptModal";

export const SetupOptionsMenu = ({
  setup,
  onToggleFavorite,
  onRemove,
  onShare,
  positionClass = "right-0 bottom-7",
  buttonClassName = "p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer",
}) => {
  const { auth } = useAuth();
  const { showToast } = useToast();
  const isLoggedIn = Boolean(auth?.token || auth?.user);

  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [localFavorited, setLocalFavorited] = useState(Boolean(setup?.isFavorited));
  const menuRef = useRef(null);

  // Keep localFavorited state in sync when setup prop updates
  useEffect(() => {
    setLocalFavorited(Boolean(setup?.isFavorited));
  }, [setup?.isFavorited]);

  // Auto-dismiss menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);

    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }

    const previousState = Boolean(localFavorited);
    const nextState = !previousState;

    // Optimistically update UI state immediately
    setLocalFavorited(nextState);

    // Immediate user feedback toast
    showToast(
      nextState ? "Saved to favourites!" : "Removed from favourites",
      "success"
    );

    try {
      if (onToggleFavorite) {
        const res = await onToggleFavorite(setup.id, previousState);
        if (res === false) {
          // Revert state if backend explicitly returned false/failure
          setLocalFavorited(previousState);
          showToast(
            nextState ? "Failed to save to favourites" : "Failed to remove from favourites",
            "error"
          );
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setLocalFavorited(previousState);
      showToast(
        nextState ? "Failed to save to favourites" : "Failed to remove from favourites",
        "error"
      );
    }
  };

  const handleShareClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);

    if (onShare) {
      onShare(e, setup);
      return;
    }

    const shareUrl = `${window.location.origin}/setup/${setup.id}`;
    const shareData = {
      title: setup.title,
      text: `Check out this setup: ${setup.title} by ${setup.author}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed native share sheet
      }
    } else {
      setShareOpen(true);
    }
  };

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (onRemove) {
      onRemove(setup.id);
    }
  };

  return (
    <>
      <div className="relative inline-block" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className={buttonClassName}
          aria-label="More options"
        >
          <MoreVertical size={15} />
        </button>

        {menuOpen && (
          <div
            className={`absolute z-30 w-36 bg-white rounded-2xl p-1 shadow-xl border overflow-hidden animate-in zoom-in-95 duration-150 ${positionClass}`}
            style={{ borderColor: "#E2E8F0" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* If onRemove is provided (e.g. Favourites page) */}
            {onRemove ? (
              <button
                onClick={handleRemoveClick}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-left rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            ) : (
              /* Standard Save / Favorite button — red when saved, normal when not */
              <button
                onClick={handleToggleSave}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-left rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ color: localFavorited ? "#e11d48" : "#0F172A" }}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: localFavorited ? "#e11d48" : "inherit" }}
                >
                  {localFavorited ? "favorite" : "bookmark"}
                </span>
                <span>{localFavorited ? "Saved" : "Save"}</span>
              </button>
            )}

            {/* Share option */}
            <button
              onClick={handleShareClick}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-left rounded-xl hover:bg-slate-50 transition-colors text-[#0F172A] cursor-pointer"
            >
              <Share2 size={14} className="text-slate-500" />
              <span>Share</span>
            </button>
          </div>
        )}
      </div>

      {/* Share Fallback Modal */}
      {shareOpen && <ShareMenu setup={setup} onClose={() => setShareOpen(false)} />}

      {/* Guest Auth Required Modal */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName="save setups to favourites"
      />
    </>
  );
};
