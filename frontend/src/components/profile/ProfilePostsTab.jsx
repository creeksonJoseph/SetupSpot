import React, { useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";

// Skeleton card for a single setup
const SetupCardSkeleton = ({ tall = false }) => (
  <div
    className="rounded-2xl border bg-white overflow-hidden shadow-2xs animate-pulse break-inside-avoid mb-4"
    style={{ borderColor: "#E2E8F0" }}
  >
    <div className={`w-full bg-slate-100 ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`} />
    <div className="px-3 py-2.5 border-t" style={{ borderColor: "#F1F5F9" }}>
      <div className="h-3 w-2/3 rounded bg-slate-200" />
    </div>
  </div>
);

export const ProfilePostsTab = ({ setups = [] }) => {
  const [mounting, setMounting] = useState(true);
  const [expandedTitleId, setExpandedTitleId] = useState(null);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setMounting(false));
    return () => cancelAnimationFrame(id);
  }, []);

  if (mounting) {
    return (
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
        {Array.from({ length: Math.max(setups.length, 4) }).map((_, i) => (
          <SetupCardSkeleton key={i} tall={i % 3 === 0} />
        ))}
      </div>
    );
  }

  if (setups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ImageOff size={40} style={{ color: "#CBD5E1" }} />
        <p className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
          No setups yet
        </p>
      </div>
    );
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
      {setups.map((setup) => (
        <Link
          key={setup.id}
          to={`/setup/${setup.id}`}
          className="group block mb-4 rounded-2xl overflow-hidden border bg-white shadow-2xs hover:shadow-xl transition-all duration-300 break-inside-avoid"
          style={{ borderColor: "#E2E8F0" }}
        >
          {setup.image ? (
            <img
              src={setup.image}
              alt={setup.title}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-[4/3] flex items-center justify-center bg-slate-100">
              <ImageOff size={28} style={{ color: "#CBD5E1" }} />
            </div>
          )}
          <div
            className="px-3 py-2 border-t cursor-pointer"
            style={{ borderColor: "#F1F5F9" }}
            onClick={() => setExpandedTitleId((prev) => prev === setup.id ? null : setup.id)}
          >
            <p className={`text-[11px] font-semibold leading-snug text-[#0F172A] ${expandedTitleId === setup.id ? "" : "truncate"}`}>
              {setup.title}
            </p>
            {expandedTitleId === setup.id && setup.author && (
              <p className="text-[10px] text-[#727687] mt-0.5">by {setup.author}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
