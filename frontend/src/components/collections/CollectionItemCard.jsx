import React, { useState, useEffect } from "react";
import { MoreVertical, Share2, Trash2, ShoppingBag } from "lucide-react";
import { ShareMenu } from "../ShareMenu";

export const CollectionItemCard = ({
  item,
  collectionId,
  onNavigate,
  onRemoveItem,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    if (menuOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const itemUrl = `${window.location.origin}/setup/${item.setup_id}?itemId=${item.id}`;
  const itemTitle = `Check out ${item.name} on SetupSpot!`;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);

    const shareData = {
      title: item.name,
      text: itemTitle,
      url: itemUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed native share sheet
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onRemoveItem(collectionId, item.id);
  };

  return (
    <>
      {/* Share Menu Modal (for desktop browsers without navigator.share) */}
      {shareModalOpen && (
        <ShareMenu
          customUrl={itemUrl}
          title={itemTitle}
          onClose={() => setShareModalOpen(false)}
        />
      )}

      <div
        onClick={onNavigate}
        className="group rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        style={{ borderColor: "#E2E8F0" }}
      >
        {/* Setup Photo Area */}
        <div className="aspect-[4/3] relative w-full overflow-hidden bg-slate-900">
          {item.setup_image_url ? (
            <img
              src={item.setup_image_url}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs">
              No setup photo
            </div>
          )}

          {/* Subtle top/bottom overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

          {/* Price Tag Overlay */}
          <div
            className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-xs font-black shadow-md"
            style={{ color: "#0F172A" }}
          >
            ${item.price}
          </div>

          {/* 3-Dots Options Menu Button — top left */}
          <div className="absolute top-2.5 left-2.5 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              title="Item options"
            >
              <MoreVertical size={15} />
            </button>

            {/* Options Dropdown Menu */}
            {menuOpen && (
              <div
                className="absolute top-8 left-0 z-30 w-32 bg-white rounded-xl shadow-xl border p-1 text-xs font-semibold space-y-0.5"
                style={{ borderColor: "#E2E8F0" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Share2 size={14} style={{ color: "#0066ff" }} /> Share
                </button>
                <button
                  onClick={handleRemove}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Origin Setup Banner overlay on image */}
          {item.setup_title && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white/90 text-[11px] font-medium truncate drop-shadow">
              From setup: <span className="font-bold text-white">{item.setup_title}</span>
            </div>
          )}
        </div>

        {/* Segmented White Content Block Below */}
        <div
          className="p-4 flex items-center justify-between gap-3 bg-white border-t"
          style={{ borderColor: "#F1F5F9" }}
        >
          <div className="min-w-0 flex-1">
            <h4
              className="font-bold text-sm leading-snug truncate"
              style={{ color: "#0F172A" }}
            >
              {item.name}
            </h4>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: "#727687" }}>
              {item.setup_total_items > 0
                ? `${item.setup_total_items} items in setup`
                : "Saved item"}
            </p>
          </div>

          {item.link ? (
            <a
              href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all hover:bg-blue-50 shrink-0 cursor-pointer shadow-2xs"
              style={{
                borderColor: "rgba(0,102,255,0.3)",
                color: "#0066ff",
                backgroundColor: "rgba(0,102,255,0.04)",
              }}
            >
              <ShoppingBag size={13} />
              Buy
            </a>
          ) : (
            <div
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 bg-slate-50 border"
              style={{ borderColor: "#E2E8F0" }}
            >
              Saved
            </div>
          )}
        </div>
      </div>
    </>
  );
};
