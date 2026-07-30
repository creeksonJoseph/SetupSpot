import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, ArrowLeft, Edit3, Share2, Trash2, Folder, Sparkles } from "lucide-react";
import { useCollections } from "../hooks/useCollections";
import { SimilarCollections } from "../components/collections/SimilarCollections";
import { CreateCollectionModal } from "../components/collections/CreateCollectionModal";
import { RenameCollectionModal } from "../components/collections/RenameCollectionModal";
import { CollectionFolderCard } from "../components/collections/CollectionFolderCard";
import { CollectionItemCard } from "../components/collections/CollectionItemCard";
import { useToast } from "../context/ToastContext";

const Collections = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const {
    collections,
    loading,
    selectedCollection,
    setSelectedCollection,
    createCollection,
    renameCollection,
    removeItem,
    deleteCollection,
  } = useCollections(selectedId);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [editingCollection, setEditingCollection] = useState(null);
  const [editFolderTitle, setEditFolderTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelectCollection = (col) => {
    setSelectedCollection(col);
    if (col) {
      setSearchParams({ id: col.id });
    } else {
      setSearchParams({});
    }
  };

  const handleCreateCollectionSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await createCollection(newFolderTitle.trim());
      setNewFolderTitle("");
      setShowCreateModal(false);
      if (created) {
        handleSelectCollection(created);
      }
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
      {/* Create New Collection Modal */}
      <CreateCollectionModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={newFolderTitle}
        setTitle={setNewFolderTitle}
        onSubmit={handleCreateCollectionSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Rename Collection Modal */}
      <RenameCollectionModal
        collection={editingCollection}
        onClose={() => setEditingCollection(null)}
        title={editFolderTitle}
        setTitle={setEditFolderTitle}
        onSubmit={handleRenameSubmit}
      />

      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        {!selectedCollection ? (
          <div className="flex items-center justify-between mb-8 px-1">
            <div>
              <h1
                className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]"
                style={{ color: "#0F172A" }}
              >
                Your Collections
              </h1>
              <p
                className="text-sm font-normal leading-normal mt-1"
                style={{ color: "#475569" }}
              >
                Curated gear folders and wishlists from setup posts you love.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
              style={{ backgroundColor: "#0066ff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0050cb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#0066ff")
              }
            >
              <Plus size={16} />
              <span>New Collection</span>
            </button>
          </div>
        ) : (
          /* Collection Detail Header */
          <div className="mb-6 px-1 flex flex-col gap-2">
            <button
              onClick={() => handleSelectCollection(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold self-start transition-all hover:bg-slate-100 shadow-2xs cursor-pointer"
              style={{
                borderColor: "#E2E8F0",
                color: "#0F172A",
                backgroundColor: "#ffffff",
              }}
            >
              <ArrowLeft size={15} />
              <span>All Collections</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-black leading-tight"
                    style={{ color: "#0F172A" }}
                  >
                    {selectedCollection.name}
                  </h1>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#727687" }}
                  >
                    {selectedCollection.item_count}{" "}
                    {selectedCollection.item_count === 1 ? "item" : "items"}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: "#727687" }}>
                  Saved gear items in this collection. Click any item to view its setup post.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingCollection(selectedCollection);
                    setEditFolderTitle(selectedCollection.name);
                  }}
                  className="px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                  style={{
                    borderColor: "#E2E8F0",
                    color: "#0F172A",
                    backgroundColor: "transparent",
                  }}
                >
                  <Edit3 size={14} />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => handleShareCollection(e, selectedCollection)}
                  className="px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:bg-blue-50 hover:border-blue-200 flex items-center gap-1.5 cursor-pointer"
                  style={{
                    borderColor: "#E2E8F0",
                    color: "#0066ff",
                    backgroundColor: "transparent",
                  }}
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => deleteCollection(selectedCollection.id)}
                  className="px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:bg-red-50 hover:border-red-200 flex items-center gap-1.5 cursor-pointer"
                  style={{
                    borderColor: "rgba(186,26,26,0.2)",
                    color: "#ba1a1a",
                    backgroundColor: "transparent",
                  }}
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
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                style={{ color: "#0066ff" }}
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                />
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
                style={{
                  backgroundColor: "rgba(0,102,255,0.06)",
                  borderColor: "rgba(0,102,255,0.2)",
                  color: "#0066ff",
                }}
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-5">
              {collections.map((col) => (
                <CollectionFolderCard
                  key={col.id}
                  collection={col}
                  onSelect={() => handleSelectCollection(col)}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onRename={(c) => {
                    setEditingCollection(c);
                    setEditFolderTitle(c.name);
                  }}
                  onShare={handleShareCollection}
                  onDelete={deleteCollection}
                />
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
                style={{
                  backgroundColor: "rgba(0,102,255,0.06)",
                  borderColor: "rgba(0,102,255,0.2)",
                  color: "#0066ff",
                }}
              >
                <Folder size={22} />
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
            <>
              {/* Auto-Fill Grid Layout for Items */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-5">
                {selectedCollection.items.map((item) => (
                  <CollectionItemCard
                    key={item.id}
                    item={item}
                    collectionId={selectedCollection.id}
                    onNavigate={() =>
                      navigate(`/setup/${item.setup_id}?itemId=${item.id}`)
                    }
                    onRemoveItem={removeItem}
                  />
                ))}
              </div>

              {/* Similar Collections */}
              <SimilarCollections
                collectionId={selectedCollection.id}
                onSelectCollection={handleSelectCollection}
              />
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Collections;
