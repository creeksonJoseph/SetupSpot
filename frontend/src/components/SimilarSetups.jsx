import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSimilarSetups } from "../hooks/useSimilarSetups";
import { SimilarSetupsSkeleton } from "./CardSkeleton";

const SimilarSetups = ({ currentSetupId, mobileMode = false }) => {
  const [expandedTitleId, setExpandedTitleId] = useState(null);
  const {
    recommendedSetups,
    loading,
    loadingMore,
    hasMore,
    scrollContainerRef,
    handleScroll,
    loadNextPage,
  } = useSimilarSetups(currentSetupId);

  return (
    <div className={mobileMode ? "flex flex-col" : "flex flex-col h-full"}>
      <h2 className="text-sm font-bold pb-3 shrink-0" style={{ color: "#0F172A" }}>
        More Similar Setups
      </h2>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex flex-col rounded-xl border p-2.5 space-y-3 ${
          mobileMode ? "" : "overflow-y-auto flex-1"
        }`}
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
      >
        {loading ? (
          <SimilarSetupsSkeleton count={6} />
        ) : recommendedSetups.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "#727687" }}>
            No similar setups found.
          </p>
        ) : (
          <>
            <div className="columns-2 gap-2 space-y-2">
              {recommendedSetups.map((setup) => (
                <div key={setup.id} className="break-inside-avoid relative group">
                  <Link
                    to={`/setup/${setup.id}`}
                    className="block relative overflow-hidden rounded-lg border transition-transform duration-200 hover:scale-[1.03]"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    <img
                      src={setup.image}
                      alt={setup.title}
                      className="w-full h-auto object-cover rounded-lg"
                      loading="lazy"
                    />
                    {/* Subtle dark gradient overlay with title — hover only (desktop) */}
                    <div className="hidden sm:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <p className="text-white font-semibold text-xs leading-tight truncate">
                        {setup.title}
                      </p>
                      <p className="text-white/80 text-[10px] truncate mt-0.5">
                        {setup.author}
                      </p>
                    </div>
                  </Link>

                  {/* Mobile caption — only on phones */}
                  <div
                    className="sm:hidden mt-1 px-0.5 cursor-pointer"
                    onClick={() => setExpandedTitleId((prev) => prev === setup.id ? null : setup.id)}
                  >
                    <p className={`text-[10px] font-semibold leading-snug text-[#0F172A] ${expandedTitleId === setup.id ? "" : "truncate"}`}>
                      {setup.title}
                    </p>
                    {expandedTitleId === setup.id && (
                      <p className="text-[9px] text-[#727687] mt-0.5">{setup.author}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Loading indicator or manual Load More button */}
            {loadingMore ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 size={16} className="animate-spin" style={{ color: "#0066ff" }} />
                <span className="ml-2 text-xs font-medium" style={{ color: "#475569" }}>
                  Loading more...
                </span>
              </div>
            ) : (
              hasMore && (
                <div className="flex justify-center pt-2 pb-1">
                  <button
                    onClick={loadNextPage}
                    className="text-xs font-semibold py-1.5 px-4 rounded-lg border transition-colors hover:bg-slate-50"
                    style={{ borderColor: "#E2E8F0", color: "#0066ff" }}
                  >
                    Load More
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SimilarSetups;
