import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Share2, Trash2 } from "lucide-react";
import { DeletePostModal } from "./DeletePostModal";
import { ShareMenu } from "../ShareMenu";
import { SetupGridSkeleton } from "../CardSkeleton";

export const UserSetupsGrid = ({ setups = [], loading = false, deleteSetup }) => {
  const [pendingDeleteSetup, setPendingDeleteSetup] = useState(null);
  const [shareSetup, setShareSetup] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedTitleId, setExpandedTitleId] = useState(null);
  const [visibleLimit, setVisibleLimit] = useState(24);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Automatic Infinite Scroll Handler
  useEffect(() => {
    if (visibleLimit >= (setups?.length || 0) || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleLimit((prev) => prev + 24);
        }
      },
      { rootMargin: "300px" }
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [visibleLimit, setups?.length]);

  return (
    <section className="mb-16">
      {/* Share Modal */}
      {shareSetup && (
        <ShareMenu setup={shareSetup} onClose={() => setShareSetup(null)} />
      )}

      {/* Delete Confirmation Modal */}
      <DeletePostModal
        isOpen={!!pendingDeleteSetup}
        onClose={() => setPendingDeleteSetup(null)}
        onConfirm={async () => {
          if (pendingDeleteSetup) {
            await deleteSetup(pendingDeleteSetup.id);
          }
        }}
        setupTitle={pendingDeleteSetup?.title}
        setupImage={pendingDeleteSetup?.image}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h2 className="text-xl md:text-3xl font-black tracking-[-0.033em]" style={{ color: "#0F172A" }}>
          Your Setups
        </h2>
      </div>

      {/* Loading Skeleton state — NEVER flash empty state during data loading */}
      {loading || !setups ? (
        <SetupGridSkeleton count={10} />
      ) : setups.length === 0 ? (
        /* Empty State — Only shown after loading completes and setups count is genuinely 0 */
        <div
          className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed text-center"
          style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(0,102,255,0.08)", color: "#0066ff" }}
          >
            <span className="material-symbols-outlined text-3xl">photo_camera</span>
          </div>
          <h3 className="text-lg font-bold" style={{ color: "#0F172A" }}>
            No setups created yet
          </h3>
          <p className="text-sm mt-1 max-w-sm" style={{ color: "#727687" }}>
            Share your workspace setup with the community and get inspired by others.
          </p>
          <Link
            to="/create"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-sm hover:shadow-md cursor-pointer"
            style={{ backgroundColor: "#0066ff" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Your First Setup
          </Link>
        </div>
      ) : (
        /* Responsive Multi-Column Masonry Layout — Matches Explore Page */
        <div>
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
            {setups.slice(0, visibleLimit).map((setup) => (
              <div
                key={setup.id}
                className="break-inside-avoid mb-4 relative group transition-all duration-300 ease-out hover:scale-[1.02] hover:drop-shadow-xl"
              >
                <Link to={`/setup/${setup.id}`} className="block relative overflow-hidden rounded-2xl">
                  <img
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    alt={setup.title}
                    src={setup.image}
                    loading="lazy"
                  />

                  {/* Dark shade overlay — hover only */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* 3-Dots Menu Button — top right */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId((prev) => (prev === setup.id ? null : setup.id));
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-full shadow-md bg-white/90 backdrop-blur-xs text-slate-700 hover:text-slate-900 opacity-0 group-hover:opacity-100 active:scale-95 transition-all duration-200 cursor-pointer hover:bg-white"
                      title="Setup options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Options Dropdown */}
                    {openMenuId === setup.id && (
                      <div
                        className="absolute top-10 right-0 z-30 w-36 bg-white rounded-xl shadow-xl border p-1 text-xs font-semibold space-y-0.5"
                        style={{ borderColor: "#E2E8F0" }}
                      >
                        <button
                          onClick={(e) => handleSharePost(e, setup)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Share2 size={14} className="text-slate-500" />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setPendingDeleteSetup(setup);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} className="text-red-500" />
                          <span>Delete Setup</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gradient overlay with setup title — hover only (desktop) */}
                  <div className="hidden sm:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-14 pb-4 pl-4 pr-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-white font-semibold text-base leading-tight drop-shadow truncate">
                      {setup.title}
                    </p>
                  </div>
                </Link>

                {/* Mobile caption — only on phones */}
                <div
                  className="sm:hidden mt-1.5 px-0.5 cursor-pointer"
                  onClick={() => setExpandedTitleId((prev) => prev === setup.id ? null : setup.id)}
                >
                  <p className={`text-[11px] font-semibold leading-snug text-[#0F172A] ${expandedTitleId === setup.id ? "" : "truncate"}`}>
                    {setup.title}
                  </p>
                  {expandedTitleId === setup.id && (
                    <p className="text-[10px] text-[#727687] mt-0.5">@{setup.author || setup.username}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Automatic Infinite Scroll Sentinel */}
          {visibleLimit < setups.length && (
            <div ref={sentinelRef} className="h-12 w-full flex items-center justify-center my-4">
              <span className="text-xs font-medium text-slate-400">Loading more setups...</span>
            </div>
          )}
        </div>
      )}

      {/* Explore More Collections Footer Button */}
      {setups.length > 0 && (
        <div className="mt-14 flex justify-center">
          <Link
            to="/explore"
            className="px-8 py-3.5 border rounded-full font-semibold text-sm flex items-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md group"
            style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            <span className="material-symbols-outlined text-[20px] group-hover:translate-y-0.5 transition-transform">
              expand_more
            </span>
            Explore More Collections
          </Link>
        </div>
      )}
    </section>
  );
};
