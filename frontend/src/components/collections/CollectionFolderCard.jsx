import React from "react";
import { MoreVertical, Edit3, Share2, Trash2 } from "lucide-react";
import { CollectionMosaicCover } from "./CollectionMosaicCover";

export const CollectionFolderCard = ({
  collection,
  onSelect,
  openMenuId,
  setOpenMenuId,
  onRename,
  onShare,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className="group relative rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
      style={{ borderColor: "#E2E8F0" }}
    >
      {/* 4-Quadrant Setup Photo Collage Cover */}
      <div className="aspect-[4/3] relative w-full overflow-hidden bg-slate-100">
        <CollectionMosaicCover coverImages={collection.cover_images} name={collection.name} />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* 3-Dots Menu Button */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenMenuId((prev) => (prev === collection.id ? null : collection.id));
            }}
            className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
            title="Collection options"
          >
            <MoreVertical size={15} />
          </button>

          {/* Dropdown Menu */}
          {openMenuId === collection.id && (
            <div
              className="absolute top-8 right-0 z-30 w-36 bg-white rounded-xl shadow-xl border p-1 text-xs font-semibold space-y-0.5"
              style={{ borderColor: "#E2E8F0" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setOpenMenuId(null);
                  onRename(collection);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Edit3 size={14} /> Rename
              </button>
              <button
                onClick={(e) => onShare(e, collection)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Share2 size={14} style={{ color: "#0066ff" }} /> Share
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenMenuId(null);
                  onDelete(collection.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Bottom Title Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
          <h3 className="font-extrabold text-base leading-tight truncate drop-shadow-md">
            {collection.name}
          </h3>
          <p className="text-[11px] font-medium text-white/80 mt-0.5 drop-shadow">
            {collection.item_count} {collection.item_count === 1 ? "saved item" : "saved items"}
          </p>
        </div>
      </div>
    </div>
  );
};
