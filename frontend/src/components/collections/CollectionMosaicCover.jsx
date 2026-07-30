import React from "react";
import { Folder } from "lucide-react";

/**
 * CollectionMosaicCover — Blurred-backdrop cover design.
 *
 * Instead of cramming images into tiny mosaic cells (which causes pixelation
 * on large landscape setup photos), we use the primary image as a full-bleed
 * blurred backdrop, then overlay clean, larger thumbnail(s) on top.
 *
 * Layouts:
 *  0 images → empty folder placeholder
 *  1 image  → clean full-bleed, no blur needed
 *  2 images → blurred bg + 2 overlaid cards side by side
 *  3 images → blurred bg + 1 large card left + 2 stacked right
 *  4+       → blurred bg + 2×2 grid of overlaid cards (larger cells)
 */
export const CollectionMosaicCover = ({ coverImages = [], name = "Collection" }) => {
  const images = coverImages.slice(0, 4);

  // ── 0: Empty Collection ──────────────────────────────────────────────────
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

  // ── 1: Single full-bleed — clean, no overlay needed ─────────────────────
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

  // ── Shared backdrop: blurred primary image at full scale ─────────────────
  // Overlaid thumbnails sit on top — they're big enough to look sharp
  const Backdrop = () => (
    <img
      src={images[0]}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover scale-110"
      style={{ filter: "blur(12px) brightness(0.55)", transform: "scale(1.15)" }}
      loading="lazy"
    />
  );

  // ── 2: Two images side by side ───────────────────────────────────────────
  if (images.length === 2) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <Backdrop />
        <div className="absolute inset-0 flex items-center justify-center gap-2 p-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-1 h-full rounded-lg overflow-hidden shadow-lg"
              style={{ maxHeight: "80%" }}
            >
              <img
                src={img}
                alt={`${name} ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 3: Large left + 2 stacked right ─────────────────────────────────────
  if (images.length === 3) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <Backdrop />
        <div className="absolute inset-0 flex items-center justify-center gap-2 p-3">
          {/* Left: large */}
          <div className="flex-[1.4] h-full rounded-lg overflow-hidden shadow-lg" style={{ maxHeight: "84%" }}>
            <img
              src={images[0]}
              alt={`${name} 1`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Right: 2 stacked */}
          <div className="flex-1 flex flex-col gap-2 h-full" style={{ maxHeight: "84%" }}>
            {images.slice(1).map((img, i) => (
              <div key={i} className="flex-1 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={img}
                  alt={`${name} ${i + 2}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── 4+: 2×2 grid of overlaid thumbnails ─────────────────────────────────
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Backdrop />
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5 p-3">
        {images.map((img, i) => (
          <div key={i} className="rounded-md overflow-hidden shadow-lg">
            <img
              src={img}
              alt={`${name} ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
