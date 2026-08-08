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

          {/* Item pins — 44px touch target wrapper around refined visual dot */}
          {items.map((item, index) => {
            const isHovered = item.id === hoveredItemId;
            return (
              <div
                key={item.id}
                className="absolute z-10 w-11 h-11 flex items-center justify-center cursor-pointer select-none"
                style={{
                  top: `${item.y}%`,
                  left: `${item.x}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <div
                  className={`rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-200 ${
                    isHovered ? "w-8 h-8 scale-110 shadow-lg" : "w-6.5 h-6.5 shadow-md"
                  }`}
                  style={{
                    backgroundColor: "#0066ff",
                    border: "2px solid rgba(255,255,255,0.9)",
                    boxShadow: isHovered ? "0 0 0 4px rgba(0,102,255,0.3)" : "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  {index + 1}
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
