import React from "react";
import { Plus } from "lucide-react";

const SetupItemList = ({
  items = [],
  hoveredItemId,
  setHoveredItemId,
  onOpenSidebar,
  onOpenModal,
  onToggleFavorite,
}) => {
  return (
    <div className="lg:w-1/3 flex flex-col">
      <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-4" style={{ color: "#0F172A" }}>
        Items in this Setup ({items.length})
      </h2>
      <div
        className="flex flex-col rounded-xl overflow-y-auto flex-1 border"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 px-4 py-3 transition-colors border-b last:border-b-0"
            style={{
              backgroundColor: item.id === hoveredItemId ? "rgba(0,102,255,0.04)" : "transparent",
              borderColor: "#E2E8F0",
            }}
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId(null)}
          >
            <div className="flex items-start gap-3">
              <div
                className="aspect-square rounded-lg size-[50px] shrink-0 flex items-center justify-center border"
                style={{ backgroundColor: "#f7f9fb", borderColor: "#E2E8F0" }}
              >
                <img src={item.item_image_url} alt={item.name} className="size-8 object-contain" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-1">
                <p className="text-base font-medium leading-normal" style={{ color: "#0F172A" }}>
                  {index + 1}. {item.name}
                </p>
                <p className="text-sm font-normal" style={{ color: "#727687" }}>${item.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "#E2E8F0" }}>
              <button
                onClick={() => onOpenSidebar(item)}
                className="flex-1 items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-colors"
                style={{ backgroundColor: "rgba(0,102,255,0.08)", color: "#0066ff" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,102,255,0.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,102,255,0.08)")}
              >
                View Details
              </button>

              <button
                onClick={() => onToggleFavorite(item.id, item.is_favorited)}
                className="flex items-center justify-center rounded-lg h-10 px-2.5 transition-colors"
                style={{ backgroundColor: "#f7f9fb", border: "1px solid #E2E8F0" }}
                title="Favourite"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    color: item.is_favorited ? "#e11d48" : "#727687",
                    fontVariationSettings: item.is_favorited ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  favorite
                </span>
              </button>

              <button
                onClick={() => onOpenModal(item)}
                className="flex items-center justify-center rounded-lg h-10 px-2.5 transition-colors"
                style={{ backgroundColor: "#f7f9fb", border: "1px solid #E2E8F0" }}
                title="Add to Collection"
              >
                <Plus size={20} style={{ color: "#727687" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupItemList;
