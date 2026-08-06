import React, { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";
import { Expand } from "lucide-react";

/**
 * SetupImageCanvas
 *
 * Displays the setup photo constrained to 70vh so it never forces page scroll.
 * Clicking the image opens an Unsplash-style fullscreen lightbox with zoom/pan.
 * Item pins remain visible on the canvas and trigger hover state in the item list.
 */
const SetupImageCanvas = ({ imageUrl, items = [], hoveredItemId, setHoveredItemId }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div
        className="w-full rounded-xl border overflow-hidden relative group"
        style={{ backgroundColor: "#0F172A", borderColor: "#E2E8F0" }}
      >
        {/*
          Image is capped at 70vh with object-contain — always visible, no overflow.
          The entire image area is clickable to open the fullscreen lightbox.
        */}
        <div
          className="relative w-full aspect-[4/5] cursor-zoom-in overflow-hidden"
          onClick={() => setLightboxOpen(true)}
          title="Click to expand"
        >
          <img
            src={imageUrl}
            alt="Setup"
            className="w-full h-full object-cover block"
            draggable={false}
          />

          {/* Expand hint — appears on hover */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-sm"
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
