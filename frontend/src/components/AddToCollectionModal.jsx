import React from "react";
import { X } from "lucide-react";
import { useAddToCollection } from "../hooks/useAddToCollection";

/**
 * AddToCollectionModal — pure render component.
 * All collection fetch / create / add logic lives in useAddToCollection.
 */
const AddToCollectionModal = ({ isOpen, onClose, item }) => {
  const {
    collections,
    selectedCollection,
    setSelectedCollection,
    newCollectionName,
    setNewCollectionName,
    showCreateNew,
    setShowCreateNew,
    loading,
    createCollection,
    addItemToCollection,
  } = useAddToCollection({ isOpen });

  const inputStyle = { backgroundColor: "#ffffff", border: "1px solid #E2E8F0", color: "#0F172A" };
  const onFocus = (e) => {
    e.target.style.borderColor = "#0050cb";
    e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "#E2E8F0";
    e.target.style.boxShadow = "none";
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="rounded-xl p-6 w-full max-w-sm border"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
      >
        <div
          className="flex justify-between items-center mb-4 pb-3 border-b"
          style={{ borderColor: "#E2E8F0" }}
        >
          <h3 className="text-lg font-bold" style={{ color: "#0F172A" }}>
            Add to Collection
          </h3>
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
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Select a collection</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
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
              onMouseEnter={(e) =>
                !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0050cb")
              }
              onMouseLeave={(e) =>
                !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0066ff")
              }
            >
              {loading ? "Adding…" : "Add to Collection"}
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
              onFocus={onFocus}
              onBlur={onBlur}
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
                onMouseEnter={(e) =>
                  !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0050cb")
                }
                onMouseLeave={(e) =>
                  !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#0066ff")
                }
              >
                {loading ? "Creating…" : "Create"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToCollectionModal;