import React from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, ExternalLink } from "lucide-react";

export const ItemSpotlightModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border shadow-2xl max-w-lg w-full overflow-hidden relative transition-all"
        style={{ borderColor: "#E2E8F0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors shadow-md cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Setup Photo Preview with Pin Spotlight */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
          {item.setup_image_url ? (
            <img
              src={item.setup_image_url}
              alt={item.setup_title || item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
              No setup image available
            </div>
          )}

          {/* Dark Overlay gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

          {/* Centered Pulse Spotlight Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-xl text-xs font-bold animate-bounce" style={{ color: "#0F172A" }}>
              <span>{item.name}</span>
            </div>
          </div>

          {/* Origin Setup Banner Tag */}
          {item.setup_title && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span className="truncate">Discovered in <strong className="text-white font-bold">{item.setup_title}</strong></span>
              {item.author_username && (
                <span className="text-white/70 text-[11px] shrink-0">@{item.author_username}</span>
              )}
            </div>
          )}
        </div>

        {/* Item Details Content */}
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight" style={{ color: "#0F172A" }}>
                {item.name}
              </h3>
              <span className="px-2.5 py-1 rounded-lg text-sm font-extrabold" style={{ backgroundColor: "rgba(0,102,255,0.08)", color: "#0066ff" }}>
                ${item.price}
              </span>
            </div>
            {item.description && (
              <p className="text-xs mt-2 leading-relaxed" style={{ color: "#475569" }}>
                {item.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-xs cursor-pointer"
                style={{ backgroundColor: "#0066ff" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
              >
                <ShoppingBag size={15} />
                <span>Buy / View Product</span>
              </a>
            )}

            {item.setup_id && (
              <Link
                to={`/setup/${item.setup_id}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-50 shadow-2xs"
                style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
              >
                <ExternalLink size={15} />
                <span>View Setup Post</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
