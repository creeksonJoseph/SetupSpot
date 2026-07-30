import React from "react";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import { CollectionMosaicCover } from "../collections/CollectionMosaicCover";

export const ProfileCollectionsTab = ({ collections = [] }) => {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Layers size={40} style={{ color: "#CBD5E1" }} />
        <p className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
          No public collections yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {collections.map((col) => (
        <Link
          key={col.id}
          to={`/collections?id=${col.id}`}
          className="group relative rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div className="aspect-[4/3] relative w-full overflow-hidden bg-slate-100">
            <CollectionMosaicCover coverImages={col.cover_images} name={col.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
              <h3 className="font-extrabold text-base leading-tight truncate drop-shadow-md">
                {col.name}
              </h3>
              <p className="text-[11px] font-medium text-white/80 mt-0.5 drop-shadow">
                {col.item_count} {col.item_count === 1 ? "saved item" : "saved items"}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
