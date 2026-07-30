import React from "react";
import { Folder } from "lucide-react";

/**
 * CollectionMosaicCover — Adaptive Pinterest-style cover collage.
 * Dynamically adjusts grid layout based on available image count (0, 1, 2, 3, or 4+)
 * so there are ZERO blank/empty spaces on any collection cover.
 */
export const CollectionMosaicCover = ({ coverImages = [], name = "Collection" }) => {
  const images = coverImages.slice(0, 4);

  // Case 0: Empty Collection
  if (images.length === 0) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-4 transition-colors"
        style={{
          background: "linear-gradient(135deg, rgba(0,102,255,0.06) 0%, rgba(15,23,42,0.03) 100%)",
          color: "#727687",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 border shadow-xs"
          style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0066ff" }}
        >
          <Folder size={22} />
        </div>
        <span className="text-xs font-semibold" style={{ color: "#475569" }}>
          Empty Collection
        </span>
      </div>
    );
  }

  // Case 1: 1 Image — Full-bleed single cover photo
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

  // Case 2: 2 Images — 2 equal vertical split columns
  if (images.length === 2) {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-0.5 overflow-hidden bg-slate-900">
        <img
          src={images[0]}
          alt={`${name} preview 1`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <img
          src={images[1]}
          alt={`${name} preview 2`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  // Case 3: 3 Images — 1 large image on the left + 2 stacked images on the right
  if (images.length === 3) {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-0.5 overflow-hidden bg-slate-900">
        {/* Left half: 1 main large image */}
        <div className="w-full h-full overflow-hidden">
          <img
            src={images[0]}
            alt={`${name} main preview`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        {/* Right half: 2 stacked smaller images */}
        <div className="w-full h-full flex flex-col gap-0.5 overflow-hidden">
          <div className="w-full h-1/2 overflow-hidden">
            <img
              src={images[1]}
              alt={`${name} preview 2`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="w-full h-1/2 overflow-hidden">
            <img
              src={images[2]}
              alt={`${name} preview 3`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  }

  // Case 4+: 4 Images — 4-quadrant grid collage
  return (
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden bg-slate-900">
      {images.map((img, idx) => (
        <div key={idx} className="relative overflow-hidden w-full h-full">
          <img
            src={img}
            alt={`${name} preview ${idx + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};
