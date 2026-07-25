import React from "react";
import { X, ShoppingBag } from "lucide-react";

const ItemDetailsSidebar = ({ isOpen, onClose, item, hoveredItemId }) => {
  const isVisible = isOpen && item;
  if (!item) return null;

  return (
    <div
      className={`fixed top-0 right-0 w-full md:w-1/2 lg:w-96 h-full p-6 flex flex-col gap-6 overflow-y-auto z-50 transition-transform duration-300 border-l ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold" style={{ color: "#0F172A" }}>
          Item Details
        </h3>
        <button onClick={onClose} className="transition-colors" style={{ color: "#727687" }}>
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        <div
          className="w-full aspect-video rounded-xl flex items-center justify-center border-2"
          style={{
            backgroundColor: "#f7f9fb",
            borderColor: item.id === hoveredItemId ? "#0066ff" : "#E2E8F0",
          }}
        >
          <img src={item.item_image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
        </div>
        <div>
          <h4 className="text-lg font-bold" style={{ color: "#0F172A" }}>
            {item.name}
          </h4>
          <p className="text-sm font-light" style={{ color: "#727687" }}>
            Price: ${item.price}
          </p>
        </div>
        <p className="text-sm" style={{ color: "#475569" }}>
          {item.description}
        </p>
      </div>

      <div className="mt-auto">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-lg h-11 px-4 text-sm font-bold text-white gap-2 transition-colors"
          style={{ backgroundColor: "#0066ff" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
        >
          <ShoppingBag size={18} /> Buy on Merchant Site
        </a>
      </div>
    </div>
  );
};

export default ItemDetailsSidebar;