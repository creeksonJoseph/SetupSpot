import React from "react";
import { Trash2, FolderOpen } from "lucide-react";

export const AdminCollectionsTab = ({
  filteredCollections,
  selectedCollectionIds,
  setSelectedCollectionIds,
  handleBulkDeleteCollections,
  handleDeleteCollection,
  visibleLimits,
  setVisibleLimits,
}) => {
  return (
    <div className=" border bg-white overflow-hidden shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
      <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between gap-4" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-sm font-bold" style={{ color: "#0F172A" }}>
          All Collections ({filteredCollections.length})
        </h3>
        {selectedCollectionIds.length > 0 && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <span className="text-xs font-bold text-slate-700">
              {selectedCollectionIds.length} collection{selectedCollectionIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleBulkDeleteCollections}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 size={13} /> Delete Selected ({selectedCollectionIds.length})
            </button>
            <button
              onClick={() => setSelectedCollectionIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      {filteredCollections.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400">No collections found matching your query.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredCollections.length > 0 &&
                      selectedCollectionIds.length === filteredCollections.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCollectionIds(filteredCollections.map((c) => c.id));
                      } else {
                        setSelectedCollectionIds([]);
                      }
                    }}
                    className="rounded cursor-pointer accent-blue-600"
                  />
                </th>
                <th className="p-3.5">Collection Name</th>
                <th className="p-3.5">Owner</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Created</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.slice(0, visibleLimits.collections).map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-50/60 transition-colors ${selectedCollectionIds.includes(c.id) ? "bg-blue-50/40" : ""
                    }`}
                >
                  <td className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCollectionIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCollectionIds((prev) => [...prev, c.id]);
                        } else {
                          setSelectedCollectionIds((prev) => prev.filter((id) => id !== c.id));
                        }
                      }}
                      className="rounded cursor-pointer accent-blue-600"
                    />
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <FolderOpen size={16} className="text-blue-600" />
                    <span>{c.name}</span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">@{c.owner}</td>
                  <td className="p-3.5 font-bold text-slate-900">{c.item_count} items</td>
                  <td className="p-3.5 text-slate-500">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeleteCollection(c)}
                      className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Collection"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCollections.length > visibleLimits.collections && (
            <div className="p-3 text-center border-t bg-slate-50/50" style={{ borderColor: "#F1F5F9" }}>
              <button
                onClick={() => setVisibleLimits((prev) => ({ ...prev, collections: prev.collections + 25 }))}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Load More Collections ({filteredCollections.length - visibleLimits.collections} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
