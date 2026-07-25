import React from "react";

const SetupImageCanvas = ({ imageUrl, items = [], hoveredItemId, setHoveredItemId }) => {
  return (
    <div className="flex-1 min-h-[50vh] lg:min-h-0">
      <div
        className="w-full h-full rounded-xl border overflow-hidden"
        style={{ backgroundColor: "#E2E8F0", borderColor: "#E2E8F0" }}
      >
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover rounded-xl relative"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        >
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
              }}
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
    </div>
  );
};

export default SetupImageCanvas;
