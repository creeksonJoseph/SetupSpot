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
          className="relative w-full cursor-zoom-in"
          style={{ maxHeight: "70vh" }}
          onClick={() => setLightboxOpen(true)}
          title="Click to expand"
        >
          <img
            src={imageUrl}
            alt="Setup"
            className="w-full block"
            style={{ maxHeight: "70vh", objectFit: "contain" }}
            draggable={false}
          />

          {/* Expand hint — appears on hover */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#ffffff", backdropFilter: "blur(4px)" }}
          >
            <Expand size={13} />
            Expand
          </div>

          {/* Item pins — stop propagation so clicking a pin doesn't open lightbox */}
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`absolute rounded-full border-2 transition-all cursor-pointer ${
                item.id === hoveredItemId ? "w-10 h-10 scale-125" : "w-6 h-6"
              }`}
              style={{
                top: `${item.y}%`,
                left: `${item.x}%`,
                transform: "translate(-50%, -50%)",
                borderColor: "#0066ff",
                backgroundColor:
                  item.id === hoveredItemId ? "rgba(0,102,255,0.3)" : "rgba(255,255,255,0.8)",
                boxShadow: item.id === hoveredItemId ? "0 0 0 4px rgba(0,102,255,0.2)" : "none",
                zIndex: 10,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: "#0066ff" }}
              >
                {index + 1}
              </div>
            </div>
          ))}
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
