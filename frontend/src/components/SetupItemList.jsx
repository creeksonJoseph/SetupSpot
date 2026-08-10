import React, { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Plus, ShoppingBag } from "lucide-react";

const SetupItemList = ({
  items = [],
  hoveredItemId,
  setHoveredItemId,
  onOpenModal,
}) => {
  const [expandedItemId, setExpandedItemId] = useState(null);

  const toggleExpand = (itemId) => {
    setExpandedItemId((prev) => (prev === itemId ? null : itemId));
  };

  const totalPrice = items.reduce((sum, item) => {
    const p = typeof item.price === "number" ? item.price : parseFloat(item.price);
    return sum + (isNaN(p) ? 0 : p);
  }, 0);

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      <div className="flex items-center justify-between pb-3 shrink-0">
        <h2 className="text-sm font-bold" style={{ color: "#0F172A" }}>
          Items in Setup ({items.length})
        </h2>
        {totalPrice > 0 && (
          <div
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold shadow-2xs"
            style={{
              backgroundColor: "rgba(0,102,255,0.06)",
              borderColor: "rgba(0,102,255,0.2)",
              color: "#0066ff",
            }}
          >
            <span>Est. Total:</span>
            <span className="font-extrabold">
              ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
      <div
        className="flex flex-col overflow-y-auto min-h-0 flex-1 border rounded-none"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
      >
        {items.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "#727687" }}>
            No tagged items.
          </p>
        ) : (
          items.map((item, index) => {
            const isExpanded = expandedItemId === item.id;
            const isHovered = hoveredItemId === item.id;

            return (
              <div
                key={item.id || index}
                className="border-b last:border-b-0 transition-colors"
                style={{
                  borderColor: "#E2E8F0",
                  backgroundColor: isExpanded
                    ? "rgba(0,102,255,0.02)"
                    : isHovered
                      ? "rgba(0,102,255,0.04)"
                      : "transparent",
                }}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                {/* ── Accordion Header ── */}
                <div
                  className="flex items-center gap-2.5 px-3 py-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(item.id)}
                >
                  {/* Item index badge */}
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{
                      backgroundColor: isExpanded || isHovered ? "#0066ff" : "#F1F5F9",
                      color: isExpanded || isHovered ? "#ffffff" : "#475569",
                    }}
                  >
                    {index + 1}
                  </span>

                  {/* Name & price */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate leading-snug"
                      style={{ color: isExpanded ? "#0066ff" : "#0F172A" }}
                    >
                      {item.name}
                    </p>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: "#0066ff" }}>
                      ${item.price}
                    </p>
                  </div>

                  {/* Expand chevron indicator */}
                  <div
                    className="p-1 rounded-md transition-transform duration-200 text-slate-400"
                    style={{ color: isExpanded ? "#0066ff" : "#94A3B8" }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {/* Add to Collection modal button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenModal(item);
                    }}
                    className="flex items-center justify-center rounded-lg h-7 w-7 shrink-0 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#64748B" }}
                    title="Add to Collection"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* ── Accordion Body (Expanded Content) ── */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t flex flex-col gap-2.5 bg-slate-50/50" style={{ borderColor: "#F1F5F9" }}>
                    {/* Item Image preview if available */}
                    {item.item_image_url && (
                      <div className="w-full h-28 overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E2E8F0" }}>
                        <img
                          src={item.item_image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Description */}
                    {item.description ? (
                      <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-xs italic" style={{ color: "#94A3B8" }}>
                        No description provided.
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      {item.link ? (
                        <a
                          href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-white self-end transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                          style={{ backgroundColor: "#0066ff" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
                        >
                          <ShoppingBag size={13} />
                          <span>Buy on Merchant Site</span>
                          <ExternalLink size={11} className="opacity-80" />
                        </a>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-medium bg-slate-100 self-end"
                          style={{ color: "#94A3B8" }}
                        >
                          <span>No merchant link available</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SetupItemList;
