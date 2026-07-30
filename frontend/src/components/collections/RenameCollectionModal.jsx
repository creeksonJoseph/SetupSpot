import React from "react";

export const RenameCollectionModal = ({
  collection,
  onClose,
  title,
  setTitle,
  onSubmit,
}) => {
  if (!collection) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
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

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-blue-500"
            style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
          />
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-50 transition-colors"
              style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: "#0066ff" }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
