import React from "react";
import { Trash2, ShoppingBag, X } from "lucide-react";
import { useCollections } from "../hooks/useCollections";

const Collections = () => {
  const {
    collections,
    loading,
    selectedCollection,
    setSelectedCollection,
    removeItem,
    deleteCollection,
  } = useCollections();

  const inputBase = "w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all";
  const inputStyle = { backgroundColor: "#ffffff", border: "1px solid #E2E8F0", color: "#0F172A" };

  return (
    <div className="px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 px-2">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]" style={{ color: "#0F172A" }}>Your Collections</h1>
          <p className="text-base font-normal leading-normal mt-2" style={{ color: "#475569" }}>Curated lists of gear from setups you love.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex items-center gap-3" style={{ color: "#727687" }}>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" style={{ color: "#0066ff" }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
              </svg>
              <span className="text-sm font-medium">Loading collections...</span>
            </div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: "#E2E8F0" }}>bookmarks</span>
            <p className="text-base" style={{ color: "#727687" }}>No collections yet. Add items from setup pages to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="rounded-2xl overflow-hidden border cursor-pointer transition-all hover:shadow-md"
                style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
                onClick={() => setSelectedCollection(collection)}
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white">{collection.name}</h3>
                    <p className="text-white/70 text-sm">{collection.items.length} items</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection Detail Modal */}
      {selectedCollection && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}>
            <div className="flex flex-col md:flex-row">
              {/* Left */}
              <div className="md:w-1/2 p-6">
                <img
                  src={selectedCollection.image}
                  alt={selectedCollection.name}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <h2 className="text-2xl font-bold mt-4" style={{ color: "#0F172A" }}>{selectedCollection.name}</h2>
                <p className="text-sm mt-1" style={{ color: "#727687" }}>{selectedCollection.items.length} items</p>
                <button
                  onClick={() => deleteCollection(selectedCollection.id)}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#ba1a1a" }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#93000a")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#ba1a1a")}
                >
                  Delete Collection
                </button>
              </div>

              {/* Right */}
              <div className="md:w-1/2 p-6" style={{ backgroundColor: "#f7f9fb" }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: "#0F172A" }}>Items</h3>
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className="p-2 rounded-full transition-colors"
                    style={{ color: "#727687" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E2E8F0")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[50vh]">
                  {selectedCollection.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 rounded-xl border"
                      style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
                    >
                      <div>
                        <h4 className="font-semibold text-sm" style={{ color: "#0F172A" }}>{item.name}</h4>
                        <p className="text-sm" style={{ color: "#727687" }}>${item.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeItem(selectedCollection.id, item.id)}
                          className="p-2 rounded-full transition-colors"
                          style={{ color: "#ba1a1a" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(186,26,26,0.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Trash2 size={16} />
                        </button>
                        <a
                          href={item.link}
                          className="px-3 py-2 rounded-full flex items-center gap-2 text-sm font-semibold text-white transition-colors"
                          style={{ backgroundColor: "#0066ff" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
                        >
                          <ShoppingBag size={14} />
                          Buy
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
