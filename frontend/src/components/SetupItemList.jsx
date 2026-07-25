import React from "react";
import { Plus } from "lucide-react";

const SetupItemList = ({
  items = [],
  hoveredItemId,
  setHoveredItemId,
  onOpenSidebar,
  onOpenModal,
}) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-bold pb-3 shrink-0" style={{ color: "#0F172A" }}>
        Items ({items.length})
      </h2>
      <div
        className="flex flex-col overflow-y-auto flex-1 border"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b last:border-b-0"
            style={{
              backgroundColor: item.id === hoveredItemId ? "rgba(0,102,255,0.04)" : "transparent",
              borderColor: "#E2E8F0",
            }}
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId(null)}
            onClick={() => onOpenSidebar(item)}
          >


            {/* Name & price */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#0F172A" }}>
                {item.name}
              </p>
              <p className="text-xs" style={{ color: "#727687" }}>${item.price}</p>
            </div>

            {/* Add to Collection */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenModal(item); }}
              className="flex items-center justify-center rounded-lg h-8 w-8 shrink-0 transition-colors"
              style={{ backgroundColor: "#f7f9fb", border: "1px solid #E2E8F0" }}
              title="Add to Collection"
            >
              <Plus size={16} style={{ color: "#727687" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupItemList;
