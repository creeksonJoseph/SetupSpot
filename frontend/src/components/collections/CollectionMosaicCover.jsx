import React from "react";
import { Folder } from "lucide-react";

export const CollectionMosaicCover = ({ coverImages = [], name = "Collection" }) => {
  const images = coverImages.slice(0, 4);

  if (images.length === 0) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-4 transition-colors"
        style={{
          background: "linear-gradient(135deg, rgba(0,102,255,0.06) 0%, rgba(15,23,42,0.03) 100%)",
          color: "#727687",
        }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 border shadow-xs" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0066ff" }}>
          <Folder size={22} />
        </div>
        <span className="text-xs font-semibold" style={{ color: "#475569" }}>
          Empty Collection
        </span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    );
  }

  return (
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 bg-slate-200 overflow-hidden">
      {images.map((img, idx) => (
        <div key={idx} className="relative overflow-hidden w-full h-full bg-slate-100">
          <img
            src={img}
            alt={`${name} preview ${idx + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ))}
      {/* Fill remaining quadrants if less than 4 */}
      {Array.from({ length: 4 - images.length }).map((_, idx) => (
        <div key={`empty-${idx}`} className="w-full h-full bg-slate-100/60" />
      ))}
    </div>
  );
};
