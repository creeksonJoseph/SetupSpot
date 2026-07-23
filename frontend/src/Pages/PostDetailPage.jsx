import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { useAddToCollection } from "../hooks/useAddToCollection";
import { ArrowLeft, Plus, ShoppingBag, X, Loader2 } from "lucide-react";

/**
 * AddToCollectionModal — pure render component.
 * All collection fetch / create / add logic lives in useAddToCollection.
 */
const AddToCollectionModal = ({ isOpen, onClose, item }) => {
  const {
    collections,
    selectedCollection, setSelectedCollection,
    newCollectionName,  setNewCollectionName,
    showCreateNew,      setShowCreateNew,
    loading,
    createCollection,
    addItemToCollection,
  } = useAddToCollection({ isOpen });

  const inputStyle = { backgroundColor: "#ffffff", border: "1px solid #E2E8F0", color: "#0F172A" };
  const onFocus = (e) => { e.target.style.borderColor = "#0050cb"; e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)"; };
  const onBlur  = (e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-xl p-6 w-full max-w-sm border" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}>
        <div className="flex justify-between items-center mb-4 pb-3 border-b" style={{ borderColor: "#E2E8F0" }}>
          <h3 className="text-lg font-bold" style={{ color: "#0F172A" }}>Add to Collection</h3>
          <button onClick={onClose} className="transition-colors" style={{ color: "#727687" }}>
            <X size={20} />
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: "#475569" }}>
          Adding <strong style={{ color: "#0F172A" }}>{item?.name || "Item"}</strong> to a collection.
        </p>

        {!showCreateNew ? (
          <>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full p-2 mb-4 rounded-lg text-sm outline-none"
              style={inputStyle}
              onFocus={onFocus} onBlur={onBlur}
            >
              <option value="">Select a collection</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button
              onClick={() => setShowCreateNew(true)}
              className="w-full py-2 mb-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#f7f9fb", color: "#475569", border: "1px solid #E2E8F0" }}
            >
              Create New Collection
            </button>
            <button
              onClick={() => addItemToCollection(item?.id, onClose)}
              disabled={!selectedCollection || loading}
              className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#0066ff" }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0050cb")}
              onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0066ff")}
            >
              {loading ? 'Adding…' : 'Add to Collection'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full p-2 mb-4 rounded-lg text-sm outline-none"
              style={inputStyle}
              onFocus={onFocus} onBlur={onBlur}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateNew(false)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: "#f7f9fb", color: "#475569", border: "1px solid #E2E8F0" }}
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                disabled={!newCollectionName.trim() || loading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#0066ff" }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0050cb")}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0066ff")}
              >
                {loading ? 'Creating…' : 'Create'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ItemDetailsSidebar = ({ isOpen, onClose, item, hoveredItemId }) => {
  const isVisible = isOpen && item;
  if (!item) return null;

  return (
    <div
      className={`fixed top-0 right-0 w-full md:w-1/2 lg:w-96 h-full p-6 flex flex-col gap-6 overflow-y-auto z-50 transition-transform duration-300 border-l ${isVisible ? "translate-x-0" : "translate-x-full"}`}
      style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold" style={{ color: "#0F172A" }}>Item Details</h3>
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
          <h4 className="text-lg font-bold" style={{ color: "#0F172A" }}>{item.name}</h4>
          <p className="text-sm font-light" style={{ color: "#727687" }}>Price: ${item.price}</p>
        </div>
        <p className="text-sm" style={{ color: "#475569" }}>{item.description}</p>
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

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    setup, loading, error,
    hoveredItemId, setHoveredItemId,
    isModalOpen, isSidebarOpen,
    selectedItemForDetail, selectedItemForCollection,
    handleOpenSidebar, handleCloseSidebar,
    handleOpenModal, handleCloseModal,
    toggleFavorite,
  } = usePostDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen -m-8" style={{ backgroundColor: "#f7f9fb" }}>
        <Loader2 size={40} className="animate-spin" style={{ color: "#0066ff" }} />
        <p className="ml-4 text-lg" style={{ color: "#475569" }}>Loading Setup...</p>
      </div>
    );
  }

  if (error || !setup) {
    return (
      <div className="flex items-center justify-center h-screen -m-8 flex-col" style={{ backgroundColor: "#f7f9fb" }}>
        <p className="text-xl mb-2" style={{ color: "#0F172A" }}>{error || "Setup not found"}</p>
        <button onClick={() => navigate('/explore')} className="text-sm hover:underline" style={{ color: "#0066ff" }}>
          Go Back
        </button>
      </div>
    );
  }

  const items = setup.items;

  return (
    <div className="flex flex-col h-screen -m-8" style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 lg:p-6 sticky top-0 z-10 border-b" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}>
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
          style={{ backgroundColor: "#f7f9fb", color: "#475569" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E2E8F0")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em]" style={{ color: "#0F172A" }}>
            {setup.name}
          </p>
          <p className="text-sm md:text-base font-normal" style={{ color: "#727687" }}>By {setup.author}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col lg:flex-row gap-6 p-4 lg:p-6 relative overflow-hidden">
        {/* Image */}
        <div className="flex-1 min-h-[50vh] lg:min-h-0">
          <div className="w-full h-full rounded-xl border overflow-hidden" style={{ backgroundColor: "#E2E8F0", borderColor: "#E2E8F0" }}>
            <div className="w-full h-full bg-center bg-no-repeat bg-cover rounded-xl relative" style={{ backgroundImage: `url("${setup.image_url}")` }}>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`absolute rounded-full border-2 transition-all cursor-pointer ${
                    item.id === hoveredItemId
                      ? "w-10 h-10 scale-125"
                      : "w-6 h-6"
                  }`}
                  style={{
                    top: `${item.y}%`, left: `${item.x}%`,
                    transform: "translate(-50%, -50%)",
                    borderColor: "#0066ff",
                    backgroundColor: item.id === hoveredItemId ? "rgba(0,102,255,0.3)" : "rgba(255,255,255,0.8)",
                    boxShadow: item.id === hoveredItemId ? "0 0 0 4px rgba(0,102,255,0.2)" : "none",
                  }}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0066ff" }}>
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items list */}
        <div className="lg:w-1/3 flex flex-col">
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-4" style={{ color: "#0F172A" }}>
            Items in this Setup ({items.length})
          </h2>
          <div className="flex flex-col rounded-xl overflow-y-auto flex-1 border" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}>
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
                  <div className="aspect-square rounded-lg size-[50px] shrink-0 flex items-center justify-center border" style={{ backgroundColor: "#f7f9fb", borderColor: "#E2E8F0" }}>
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
                    onClick={() => handleOpenSidebar(item)}
                    className="flex-1 items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-colors"
                    style={{ backgroundColor: "rgba(0,102,255,0.08)", color: "#0066ff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,102,255,0.14)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,102,255,0.08)")}
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => toggleFavorite(item.id, item.is_favorited)}
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
                    >favorite</span>
                  </button>

                  <button
                    onClick={() => handleOpenModal(item)}
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
      </div>

      <AddToCollectionModal isOpen={isModalOpen} onClose={handleCloseModal} item={selectedItemForCollection} />
      <ItemDetailsSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} item={selectedItemForDetail} hoveredItemId={hoveredItemId} />
    </div>
  );
};

export default PostDetailPage;
