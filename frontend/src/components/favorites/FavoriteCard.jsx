import React, { useState } from "react";
import { Link } from "react-router-dom";

export const FavoriteCard = ({ setup, isRemoving, onRemove, onShare }) => {
  const [titleExpanded, setTitleExpanded] = useState(false);
  return (
    <div
      className={`break-inside-avoid mb-4 relative group transition-all duration-300 ease-out hover:scale-[1.02] hover:drop-shadow-xl ${
        isRemoving ? "scale-90 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <Link to={`/setup/${setup.id}`} className="block relative overflow-hidden rounded-2xl">
        <img
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          alt={setup.title}
          src={setup.image}
          loading="lazy"
        />

        {/* Subtle shade overlay — hover only */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Remove Favorite button — top right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(setup.id);
          }}
          className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#e11d48", color: "#ffffff" }}
          aria-label="Remove from saved"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            favorite
          </span>
        </button>

        {/* Share button — bottom right */}
        <button
          onClick={(e) => onShare(e, setup)}
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

      {/* Mobile caption — only on phones */}
      <div
        className="sm:hidden mt-1.5 px-0.5 cursor-pointer"
        onClick={() => setTitleExpanded((prev) => !prev)}
      >
        <p className={`text-[11px] font-semibold leading-snug text-[#0F172A] ${titleExpanded ? "" : "truncate"}`}>
          {setup.title}
        </p>
        {titleExpanded && (
          <p className="text-[10px] text-[#727687] mt-0.5">by {setup.author}</p>
        )}
      </div>
    </div>
  );
};
