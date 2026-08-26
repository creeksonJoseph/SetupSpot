import React, { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";
import { Expand } from "lucide-react";
import { getBlurPlaceholderUrl } from "../utils/imageOptimizer";

/**
 * SetupImageCanvas
 *
 * Displays the setup photo constrained to 70vh so it never forces page scroll.
 * Includes low-res blur-up placeholder while loading full-res image.
 * Clicking the image opens an Unsplash-style fullscreen lightbox with zoom/pan.
 * Item pins remain visible on the canvas and trigger hover state in the item list.
 */
const SetupImageCanvas = ({ imageUrl, items = [], hoveredItemId, setHoveredItemId }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const blurSrc = getBlurPlaceholderUrl(imageUrl);

  const handleImageLoad = (e) => {
    setLoaded(true);
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  return (
    <>
      <div
        className="w-full overflow-hidden relative group"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div
          className="relative w-full max-h-[68vh] cursor-zoom-in overflow-hidden flex items-center justify-center mx-auto transition-all duration-300"
          style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : "16/9" }}
          onClick={() => setLightboxOpen(true)}
          title="Click to expand"
        >
          {/* Low-res blurred background placeholder */}
          {blurSrc && !loaded && (
            <img
              src={blurSrc}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-contain filter blur-md scale-105 pointer-events-none transition-opacity duration-300 z-0"
            />
          )}

          {/* Main high-res image */}
          <img
            src={imageUrl}
            alt="Setup"
            onLoad={handleImageLoad}
            className={`w-full h-full max-h-[68vh] object-contain block relative z-1 transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
          />

          {/* Expand hint — appears on hover */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-sm z-10"
            style={{
              backgroundColor: "rgba(255,255,255,0.88)",
              color: "#0F172A",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
            }}
          >
            <Expand size={13} />
            Expand
          </div>

          {/* Item pins — 3-part design: focal dot + dotted leader line + number badge */}
          {items.map((item, index) => {
            const isHovered = item.id === hoveredItemId;
            return (
              <div
                key={item.id}
                className="absolute z-10 cursor-pointer select-none"
                style={{
                  top: `${item.y}%`,
                  left: `${item.x}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                {/* 1. Focal dot with pulse ring */}
                <div className="relative flex items-center justify-center">
                  <span
                    className={`absolute w-5 h-5 rounded-full animate-ping ${
                      isHovered ? "bg-[#0066ff] opacity-75" : "bg-white opacity-40"
                    }`}
                  />
                  <span
                    className={`relative w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-all ${
                      isHovered
                        ? "bg-[#0066ff] scale-125 ring-2 ring-[#0066ff]/40"
                        : "bg-slate-900 hover:scale-110 hover:bg-[#0066ff]"
                    }`}
                  />
                </div>

                {/* 2. Dotted leader line rising from the focal dot */}
                <svg
                  className="absolute pointer-events-none overflow-visible"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: "24px",
                    height: "44px",
                    transform: "translate(-12px, -44px)",
                  }}
                  viewBox="0 0 24 44"
                >
                  <line
                    x1="12" y1="44"
                    x2="12" y2="0"
                    stroke={isHovered ? "#0066ff" : "rgba(255,255,255,0.85)"}
                    strokeWidth="2"
                    strokeDasharray="2.5 2.5"
                  />
                </svg>

                {/* 3. Number badge at the top of the leader line */}
                <div
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -56px)",
                  }}
                >
                  <div
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black shadow-lg border transition-all duration-200 pointer-events-auto flex items-center justify-center min-w-[22px] h-[22px] ${
                      isHovered
                        ? "bg-[#0066ff] text-white border-white ring-2 ring-[#0066ff]/30 scale-110"
                        : "bg-[#0F172A] text-white border-white/30 hover:bg-[#0066ff]"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen lightbox portal */}
      {lightboxOpen && (
        <ImageLightbox
          imageUrl={imageUrl}
          alt="Setup image"
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};

export default SetupImageCanvas;
