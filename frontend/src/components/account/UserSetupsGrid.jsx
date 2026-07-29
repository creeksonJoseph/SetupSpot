import React, { useState } from "react";
import { Link } from "react-router-dom";

export const UserSetupsGrid = ({ setups = [], deleteSetup }) => {
  const [viewMode, setViewMode] = useState("grid"); // "grid" (masonry) | "list"

  return (
    <section className="mb-16">
      {/* Header with Title and View Switcher */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-black tracking-[-0.033em]" style={{ color: "#0F172A" }}>
          Your Posts
        </h2>
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl border"
          style={{ backgroundColor: "#f7f9fb", borderColor: "#E2E8F0" }}
        >
          <button
            onClick={() => setViewMode("grid")}
            className="p-2 rounded-lg transition-all"
            style={{
              backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
              color: viewMode === "grid" ? "#0066ff" : "#727687",
              boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
            title="Masonry Grid View"
            aria-label="Masonry Grid View"
          >
            <span className="material-symbols-outlined text-[20px] block">grid_view</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className="p-2 rounded-lg transition-all"
            style={{
              backgroundColor: viewMode === "list" ? "#ffffff" : "transparent",
              color: viewMode === "list" ? "#0066ff" : "#727687",
              boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
            title="List View"
            aria-label="List View"
          >
            <span className="material-symbols-outlined text-[20px] block">list</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {setups.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed text-center"
          style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(0,102,255,0.08)", color: "#0066ff" }}
          >
            <span className="material-symbols-outlined text-3xl">photo_camera</span>
          </div>
          <h3 className="text-lg font-bold" style={{ color: "#0F172A" }}>
            No setups posted yet
          </h3>
          <p className="text-sm mt-1 max-w-sm" style={{ color: "#727687" }}>
            Share your workspace setup with the community and get inspired by others.
          </p>
          <Link
            to="/create"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-sm hover:shadow-md"
            style={{ backgroundColor: "#0066ff" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Your First Setup
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Responsive Multi-Column Masonry Layout */
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {setups.map((setup) => (
            <div
              key={setup.id}
              className="break-inside-avoid mb-4 relative group transition-all duration-300 ease-out hover:scale-[1.02] hover:drop-shadow-xl"
            >
              <Link to={`/post/${setup.id}`} className="block relative overflow-hidden rounded-2xl">
                <img
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  alt={setup.title}
                  src={setup.image}
                  loading="lazy"
                />

                {/* Subtle dark shade overlay on hover */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Delete button — top right */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteSetup(setup.id);
                  }}
                  className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10 active:scale-95 transition-all duration-200"
                  style={{ backgroundColor: "#ba1a1a", color: "#ffffff" }}
                  title="Delete setup"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    delete
                  </span>
                </button>

                {/* Gradient overlay with setup title */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-14 pb-4 pl-4 pr-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <p className="text-white font-semibold text-base leading-tight drop-shadow">
                    {setup.title}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {setups.map((setup) => (
            <div
              key={setup.id}
              className="group flex items-center gap-4 p-3 border rounded-2xl hover:shadow-md transition-all duration-200"
              style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
            >
              <Link to={`/post/${setup.id}`} className="shrink-0 w-24 h-24 rounded-xl overflow-hidden relative">
                <img
                  src={setup.image}
                  alt={setup.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/post/${setup.id}`} className="block">
                  <h3
                    className="font-bold text-lg transition-colors truncate"
                    style={{ color: "#0F172A" }}
                  >
                    {setup.title}
                  </h3>
                </Link>
                {setup.description && (
                  <p className="text-sm mt-1 line-clamp-1" style={{ color: "#727687" }}>
                    {setup.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pr-2">
                <Link
                  to={`/post/${setup.id}`}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "#727687" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0066ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#727687")}
                  title="View post"
                >
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteSetup(setup.id);
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "#ba1a1a" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(186,26,26,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  title="Delete setup"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explore More Collections Footer Button */}
      {setups.length > 0 && (
        <div className="mt-14 flex justify-center">
          <Link
            to="/explore"
            className="px-8 py-3.5 border rounded-full font-semibold text-sm flex items-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md group"
            style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            <span className="material-symbols-outlined text-[20px] group-hover:translate-y-0.5 transition-transform">
              expand_more
            </span>
            Explore More Collections
          </Link>
        </div>
      )}
    </section>
  );
};



