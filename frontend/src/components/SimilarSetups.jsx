import React from "react";
import { Loader2 } from "lucide-react";
import { useSimilarSetups } from "../hooks/useSimilarSetups";
import { SimilarSetupsSkeleton } from "./CardSkeleton";
import { SetupCard } from "./explore/SetupCard";

const SimilarSetups = ({ currentSetupId, mobileMode = false }) => {
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
    <div className={mobileMode ? "flex flex-col" : "flex flex-col h-full min-h-0 flex-1"}>
      <h2 className="text-sm font-bold pb-3 shrink-0" style={{ color: "#0F172A" }}>
        Similar Setups
      </h2>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex flex-col rounded-xl border p-2.5 space-y-3 ${
          mobileMode ? "" : "overflow-y-auto min-h-0 flex-1"
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
                <SetupCard key={setup.id} setup={setup} />
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
