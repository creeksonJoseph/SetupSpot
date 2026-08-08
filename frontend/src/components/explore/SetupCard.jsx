import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShareMenu } from "../ShareMenu";
import { MoreHorizontal } from "lucide-react";

export const SetupCard = ({ setup, toggleFavorite }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    if (menuOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (!auth) {
      navigate("/login");
      return;
    }
    setSaveAnimating(true);
    setTimeout(() => setSaveAnimating(false), 350);
    toggleFavorite(setup.id, setup.isFavorited);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);

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

          {/* Dark shade overlay on hover */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* ── Desktop: Save + Share buttons (hover only) ── */}
          {/* Save button — top right */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 hidden md:flex items-center justify-center w-9 h-9 rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
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
            className="absolute bottom-3 right-3 hidden md:flex items-center justify-center w-9 h-9 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-95 z-10 cursor-pointer"
            style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "#0F172A" }}
            aria-label="Share"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              share
            </span>
          </button>

          {/* Desktop: Gradient overlay with setup title & author */}
          <div className="absolute inset-x-0 bottom-0 hidden md:block bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-14 pb-4 pl-4 pr-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-white font-semibold text-base leading-tight drop-shadow">
              {setup.title}
            </p>
            <p className="text-white/80 text-sm mt-0.5 drop-shadow">by {setup.author}</p>
          </div>

          {/* ── Mobile: Pinterest-style title bar + 3-dots menu ── */}
          <div className="md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2.5 px-3 flex items-center justify-between gap-2">
            <p className="text-white font-semibold text-sm leading-tight truncate drop-shadow flex-1">
              {setup.title}
            </p>
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                aria-label="More options"
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div
                  className="absolute bottom-9 right-0 z-30 w-36 bg-white rounded-xl shadow-xl border p-1 text-xs font-semibold space-y-0.5"
                  style={{ borderColor: "#E2E8F0" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "15px", color: "#0066ff" }}>share</span>
                    Share
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "15px", color: setup.isFavorited ? "#e11d48" : "#0F172A" }}>
                      {setup.isFavorited ? "favorite" : "bookmark"}
                    </span>
                    {setup.isFavorited ? "Unsave" : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Share Modal */}
      {shareOpen && <ShareMenu setup={setup} onClose={() => setShareOpen(false)} />}
    </>
  );
};
