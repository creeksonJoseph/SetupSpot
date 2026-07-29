import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MoreVertical, Trash2, Edit3, Share2, ArrowLeft, ShoppingBag, Folder, Sparkles } from "lucide-react";
import { useCollections } from "../hooks/useCollections";
import { CollectionMosaicCover } from "../components/collections/CollectionMosaicCover";
import { ItemSpotlightModal } from "../components/collections/ItemSpotlightModal";
import { useToast } from "../context/ToastContext";

const Collections = () => {
  const {
    collections,
    loading,
    selectedCollection,
    setSelectedCollection,
    createCollection,
    renameCollection,
    removeItem,
    deleteCollection,
  } = useCollections();

  const { showToast } = useToast();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [editingCollection, setEditingCollection] = useState(null);
  const [editFolderTitle, setEditFolderTitle] = useState("");
  const [spotlightItem, setSpotlightItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCreateCollectionSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createCollection(newFolderTitle.trim());
      setNewFolderTitle("");
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!editingCollection || !editFolderTitle.trim()) return;
    await renameCollection(editingCollection.id, editFolderTitle.trim());
    setEditingCollection(null);
    setEditFolderTitle("");
  };

  const handleShareCollection = (e, col) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(null);
    const shareUrl = `${window.location.origin}/collections?id=${col.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast("Collection link copied to clipboard!", "success");
    } else {
      showToast(`Collection link: ${shareUrl}`, "info");
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 md:px-8">
      {/* Item Spotlight Modal */}
      <ItemSpotlightModal
        item={spotlightItem}
        onClose={() => setSpotlightItem(null)}
      />

      {/* Create New Collection Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl border shadow-2xl max-w-sm w-full p-5 relative"
            style={{ borderColor: "#E2E8F0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold mb-1" style={{ color: "#0F172A" }}>
              Create New Collection
            </h3>
            <p className="text-xs mb-4" style={{ color: "#727687" }}>
              Organize workspace setup items into custom gear folders.
            </p>

            <form onSubmit={handleCreateCollectionSubmit} className="space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Dream Desk Gear, Audio Setup"
                value={newFolderTitle}
                onChange={(e) => setNewFolderTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-blue-500"
                style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
              />
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-50 transition-colors"
                  style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderTitle.trim() || isSubmitting}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#0066ff" }}
                >
                  {isSubmitting ? "Creating..." : "Create Folder"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Collection Modal */}
      {editingCollection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setEditingCollection(null)}
        >
          <div
            className="bg-white rounded-2xl border shadow-2xl max-w-sm w-full p-5 relative"
            style={{ borderColor: "#E2E8F0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold mb-1" style={{ color: "#0F172A" }}>
              Rename Collection
            </h3>
            <p className="text-xs mb-4" style={{ color: "#727687" }}>
              Update title for this gear folder.
            </p>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={editFolderTitle}
                onChange={(e) => setEditFolderTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-blue-500"
                style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
              />
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="flex-1 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-50 transition-colors"
                  style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editFolderTitle.trim()}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#0066ff" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        {!selectedCollection ? (
          <div className="flex items-center justify-between mb-8 px-1">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]" style={{ color: "#0F172A" }}>
                Your Collections
              </h1>
              <p className="text-sm font-normal leading-normal mt-1" style={{ color: "#475569" }}>
                Curated gear folders and wishlists from setup posts you love.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
              style={{ backgroundColor: "#0066ff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
            >
              <Plus size={16} />
              <span>New Collection</span>
            </button>
          </div>
        ) : (
          /* Collection Detail Header */
          <div className="mb-6 px-1 flex flex-col gap-2">
            <button
              onClick={() => setSelectedCollection(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold self-start transition-all hover:bg-slate-100 shadow-2xs cursor-pointer"
              style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
            >
              <ArrowLeft size={15} />
              <span>All Collections</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: "#0F172A" }}>
                    {selectedCollection.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border" style={{ backgroundColor: "rgba(0,102,255,0.06)", borderColor: "rgba(0,102,255,0.2)", color: "#0066ff" }}>
                    {selectedCollection.item_count} {selectedCollection.item_count === 1 ? "item" : "items"}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: "#727687" }}>
                  Saved gear items in this collection. Click any item to view its spotlight details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingCollection(selectedCollection);
                    setEditFolderTitle(selectedCollection.name);
                  }}
                  className="px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                  style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                >
                  <Edit3 size={14} />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => handleShareCollection(e, selectedCollection)}
                  className="px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                  style={{ borderColor: "#E2E8F0", color: "#0066ff", backgroundColor: "rgba(0,102,255,0.04)" }}
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => deleteCollection(selectedCollection.id)}
                  className="px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                  style={{ borderColor: "rgba(186,26,26,0.2)", color: "#ba1a1a", backgroundColor: "rgba(186,26,26,0.04)" }}
                >
                  <Trash2 size={14} />
                  <span>Delete Folder</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex items-center gap-3" style={{ color: "#727687" }}>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" style={{ color: "#0066ff" }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
              </svg>
              <span className="text-xs font-semibold">Loading collections...</span>
            </div>
          </div>
        ) : !selectedCollection ? (
          /* Collections Folder Cards Grid */
          collections.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed text-center bg-white"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border"
                style={{ backgroundColor: "rgba(0,102,255,0.06)", borderColor: "rgba(0,102,255,0.2)", color: "#0066ff" }}
              >
                <Folder size={28} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: "#0F172A" }}>
                No collections yet
              </h3>
              <p className="text-xs mt-1 max-w-sm" style={{ color: "#727687" }}>
                Create custom gear collections or save tagged items while exploring setup posts.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-xs"
                style={{ backgroundColor: "#0066ff" }}
              >
                <Plus size={16} />
                Create Your First Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setSelectedCollection(col)}
                  className="group relative rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  {/* 4-Quadrant Setup Photo Collage Cover */}
                  <div className="aspect-[4/3] relative w-full overflow-hidden bg-slate-100">
                    <CollectionMosaicCover coverImages={col.cover_images} name={col.name} />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* 3-Dots Menu Button */}
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId((prev) => (prev === col.id ? null : col.id));
                        }}
                        className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                        title="Collection options"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === col.id && (
                        <div
                          className="absolute top-8 right-0 z-30 w-36 bg-white rounded-xl shadow-xl border p-1 text-xs font-semibold space-y-0.5"
                          style={{ borderColor: "#E2E8F0" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setEditingCollection(col);
                              setEditFolderTitle(col.name);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 size={14} /> Rename
                          </button>
                          <button
                            onClick={(e) => handleShareCollection(e, col)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Share2 size={14} style={{ color: "#0066ff" }} /> Share
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(null);
                              deleteCollection(col.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Title Info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                      <h3 className="font-extrabold text-base leading-tight truncate drop-shadow-md">
                        {col.name}
                      </h3>
                      <p className="text-[11px] font-medium text-white/80 mt-0.5 drop-shadow">
                        {col.item_count} {col.item_count === 1 ? "saved item" : "saved items"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Single Collection Items View */
          selectedCollection.items.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed text-center bg-white"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border"
                style={{ backgroundColor: "rgba(0,102,255,0.06)", borderColor: "rgba(0,102,255,0.2)", color: "#0066ff" }}
              >
                <Sparkles size={22} />
              </div>
              <h3 className="text-base font-bold" style={{ color: "#0F172A" }}>
                No items in this collection yet
              </h3>
              <p className="text-xs mt-1 max-w-sm" style={{ color: "#727687" }}>
                Browse workspace setups and click <strong>"+ Add to Collection"</strong> on tagged items to save them here.
              </p>
              <Link
                to="/explore"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-xs text-white transition-all shadow-xs"
                style={{ backgroundColor: "#0066ff" }}
              >
                Explore Setups
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {selectedCollection.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSpotlightItem(item)}
                  className="group rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  {/* Setup Photo Preview */}
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

                    {/* Price Tag Overlay */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-xs font-black shadow-md" style={{ color: "#0F172A" }}>
                      ${item.price}
                    </div>

                    {/* Remove Item Button — top left */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(selectedCollection.id, item.id);
                      }}
                      className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hover:bg-red-700 cursor-pointer"
                      title="Remove from collection"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Origin Setup Banner */}
                    {item.setup_title && (
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white/90 text-[11px] font-medium truncate drop-shadow">
                        From setup: <span className="font-bold text-white">{item.setup_title}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Details */}
                  <div className="p-3.5 flex items-center justify-between gap-2 border-t" style={{ borderColor: "#F1F5F9" }}>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm truncate" style={{ color: "#0F172A" }}>
                        {item.name}
                      </h4>
                    </div>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all hover:bg-blue-50 shrink-0 cursor-pointer"
                        style={{ borderColor: "rgba(0,102,255,0.3)", color: "#0066ff", backgroundColor: "rgba(0,102,255,0.04)" }}
                      >
                        <ShoppingBag size={12} />
                        Buy
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Collections;
