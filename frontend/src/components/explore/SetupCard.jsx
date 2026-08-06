import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShareMenu } from "../ShareMenu";
import AuthPromptModal from "../auth/AuthPromptModal";

export const SetupCard = ({ setup, toggleFavorite }) => {
  const { auth } = useAuth();
  const isLoggedIn = Boolean(auth?.token || auth?.user);
  const [shareOpen, setShareOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);
  const [titleExpanded, setTitleExpanded] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    // Spring-bounce pulse animation
    setSaveAnimating(true);
    setTimeout(() => setSaveAnimating(false), 350);
    toggleFavorite(setup.id, setup.isFavorited);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  return (
    <>
      <div className="break-inside-avoid mb-4 relative group transition-transform duration-300 ease-out hover:scale-[1.02] hover:drop-shadow-xl">
        <Link to={`/setup/${setup.id}`} className="block relative overflow-hidden rounded-2xl">
          <img
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            alt={setup.title}
            src={setup.image}
            loading="lazy"
          />

          {/* Dark shade overlay — hover only */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Save button — top right */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
            style={{
              backgroundColor: setup.isFavorited ? "#e11d48" : "#ffffff",
              color: setup.isFavorited ? "#ffffff" : "#0F172A",
              transform: saveAnimating ? "scale(1.4)" : "scale(1)",
              transition:
                "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background-color 0.2s, color 0.2s, opacity 0.2s",
            }}
            aria-label={setup.isFavorited ? "Remove from saved" : "Save"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              {setup.isFavorited ? "favorite" : "bookmark"}
            </span>
          </button>

          {/* Share button — bottom right */}
          <button
            onClick={handleShare}
            className="absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-95 z-10 cursor-pointer"
            style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "#0F172A" }}
            aria-label="Share"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              share
            </span>
          </button>

          {/* Gradient overlay with setup title & author — hover only (desktop) */}
          <div className="hidden sm:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-14 pb-4 pl-4 pr-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-white font-semibold text-base leading-tight drop-shadow">
              {setup.title}
            </p>
            <p className="text-white/80 text-sm mt-0.5 drop-shadow">by {setup.author}</p>
          </div>
        </Link>

        {/* Mobile caption — only on phones, hidden on sm+ (desktop uses hover overlay) */}
        <div
          className="sm:hidden mt-1.5 px-0.5 cursor-pointer"
          onClick={() => setTitleExpanded((prev) => !prev)}
        >
          <p
            className={`text-[11px] font-semibold leading-snug text-[#0F172A] ${titleExpanded ? "" : "truncate"}`}
          >
            {setup.title}
          </p>
          {titleExpanded && (
            <p className="text-[10px] text-[#727687] mt-0.5">by {setup.author}</p>
          )}
        </div>
      </div>

      {/* Share Modal */}
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
