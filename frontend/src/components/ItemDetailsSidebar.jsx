import React from "react";
import { X, ShoppingBag } from "lucide-react";

/**
 * ItemDetailsSidebar — inline right-column panel (not fixed overlay).
 * Slides in as part of the grid layout when isSidebarOpen = true.
 */
const ItemDetailsSidebar = ({ isOpen, onClose, item }) => {
  return (
    <div
      className={`flex flex-col h-full  border overflow-hidden transition-all duration-300 ${isOpen && item ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
    >
      {item && (
        <>
          {/* Header */}
          <div
            className="flex justify-between items-center px-4 py-3 border-b shrink-0"
            style={{ borderColor: "#E2E8F0" }}
          >
            <h3 className="text-sm font-bold" style={{ color: "#0F172A" }}>
              Item Details
            </h3>
            <button onClick={onClose} className="transition-colors" style={{ color: "#727687" }}>
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">



            {/* Name & price */}
            <div>
              <h4 className="text-base font-bold" style={{ color: "#0F172A" }}>
                {item.name}
              </h4>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "#0066ff" }}>
                ${item.price}
              </p>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                {item.description}
              </p>
            )}
          </div>

          {/* Buy button */}
          <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: "#E2E8F0" }}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-lg h-10 px-4 text-sm font-bold text-white gap-2 transition-colors"
              style={{ backgroundColor: "#0066ff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
            >
              <ShoppingBag size={16} /> Buy on Merchant Site
            </a>
          </div>
        </>
      )
      }
    </div >
  );
};

export default ItemDetailsSidebar;