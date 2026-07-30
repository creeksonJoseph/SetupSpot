import React from "react";
import { useSimilarCollections } from "../../hooks/useSimilarCollections";
import { CollectionMosaicCover } from "./CollectionMosaicCover";

/**
 * SimilarCollections — pure UI component.
 * Consumes useSimilarCollections hook for backend-computed similar collections state.
 */
export const SimilarCollections = ({ collectionId, onSelectCollection }) => {
  const { similar, loading } = useSimilarCollections(collectionId);

  if (loading) {

    return (
      <div className="mt-12 pt-8 border-t" style={{ borderColor: "#E2E8F0" }}>
        <div className="h-4 w-48 rounded-lg bg-slate-100 animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!similar.length) return null;

  return (
    <div className="mt-12 pt-8 border-t" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-base font-black" style={{ color: "#0F172A" }}>
          Similar Collections
        </h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,102,255,0.08)", color: "#0066ff" }}>
          {similar.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {similar.map((col) => (
          <button
            key={col.id}
            onClick={() => onSelectCollection && onSelectCollection(col)}
            className="group relative rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer text-left w-full"
            style={{ borderColor: "#E2E8F0" }}
          >
            {/* Cover */}
            <div className="aspect-[4/3] relative w-full overflow-hidden bg-slate-100">
              <CollectionMosaicCover coverImages={col.cover_images} name={col.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Bottom text */}
              <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                <h3 className="font-extrabold text-sm leading-tight truncate drop-shadow-md">
                  {col.name}
                </h3>
                <p className="text-[11px] font-medium text-white/80 mt-0.5 drop-shadow">
                  {col.item_count} {col.item_count === 1 ? "item" : "items"}
                  {col.author_username && (
                    <span className="ml-1 opacity-70">· @{col.author_username}</span>
                  )}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
