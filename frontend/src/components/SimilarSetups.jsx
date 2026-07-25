import React from "react";
import { Link } from "react-router-dom";
import { useSetups } from "../hooks/useSetups";
import { Loader2 } from "lucide-react";

const SimilarSetups = ({ currentSetupId }) => {
  const { setups, loading } = useSetups();

  // Exclude the currently viewed setup from recommendations
  const recommendedSetups = setups.filter(
    (s) => String(s.id) !== String(currentSetupId)
  );

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-bold pb-3 shrink-0" style={{ color: "#0F172A" }}>
        More Similar Setups
      </h2>

      <div
        className="flex flex-col rounded-xl overflow-y-auto flex-1 border p-2.5"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin" style={{ color: "#0066ff" }} />
          </div>
        ) : recommendedSetups.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "#727687" }}>
            No similar setups found.
          </p>
        ) : (
          <div className="columns-2 gap-2 space-y-2">
            {recommendedSetups.map((setup) => (
              <div key={setup.id} className="break-inside-avoid relative group">
                <Link
                  to={`/post/${setup.id}`}
                  className="block relative overflow-hidden rounded-lg border transition-transform duration-200 hover:scale-[1.03]"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <img
                    src={setup.image}
                    alt={setup.title}
                    className="w-full h-auto object-cover rounded-lg"
                    loading="lazy"
                  />
                  {/* Subtle dark gradient overlay with title */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <p className="text-white font-semibold text-xs leading-tight truncate">
                      {setup.title}
                    </p>
                    <p className="text-white/80 text-[10px] truncate mt-0.5">
                      {setup.author}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarSetups;
