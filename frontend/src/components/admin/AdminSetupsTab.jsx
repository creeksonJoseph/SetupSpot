import React from "react";
import { Trash2 } from "lucide-react";

export const AdminSetupsTab = ({
  filteredSetups,
  selectedSetupIds,
  setSelectedSetupIds,
  handleBulkDeleteSetups,
  handleDeleteSetup,
  visibleLimits,
  setVisibleLimits,
}) => {
  return (
    <div className="border bg-white overflow-hidden shadow-2xs" style={{ borderColor: "#E2E8F0" }}>

      <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between gap-4" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-sm font-bold" style={{ color: "#0F172A" }}>
          All Setups ({filteredSetups.length})
        </h3>
        {selectedSetupIds.length > 0 && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <span className="text-xs font-bold text-slate-700">
              {selectedSetupIds.length} setup{selectedSetupIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleBulkDeleteSetups}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 size={13} /> Delete Selected ({selectedSetupIds.length})
            </button>
            <button
              onClick={() => setSelectedSetupIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      {filteredSetups.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400">No setups found matching your query.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b" style={{ borderColor: "#E2E8F0" }}>
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredSetups.length > 0 &&
                      selectedSetupIds.length === filteredSetups.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSetupIds(filteredSetups.map((s) => s.id));
                      } else {
                        setSelectedSetupIds([]);
                      }
                    }}
                    className="rounded cursor-pointer accent-blue-600"
                  />
                </th>
                <th className="p-3.5">Setup</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Created</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#F1F5F9" }}>
              {filteredSetups.slice(0, visibleLimits.setups).map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    selectedSetupIds.includes(s.id) ? "bg-blue-50/40" : ""
                  }`}
                >
                  <td className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedSetupIds.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSetupIds((prev) => [...prev, s.id]);
                        } else {
                          setSelectedSetupIds((prev) => prev.filter((id) => id !== s.id));
                        }
                      }}
                      className="rounded cursor-pointer accent-blue-600"
                    />
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-3">
                    <img
                      src={s.image_url}
                      alt={s.name}
                      className="w-10 h-10 rounded-xl object-cover border"
                      style={{ borderColor: "#E2E8F0" }}
                    />
                    <span>{s.name}</span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">@{s.author}</td>
                  <td className="p-3.5 font-bold text-slate-900">{s.item_count} items</td>
                  <td className="p-3.5 text-slate-500">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeleteSetup(s)}
                      className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Setup"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSetups.length > visibleLimits.setups && (
            <div className="p-3 text-center border-t bg-slate-50/50" style={{ borderColor: "#F1F5F9" }}>
              <button
                onClick={() => setVisibleLimits((prev) => ({ ...prev, setups: prev.setups + 25 }))}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Load More Setups ({filteredSetups.length - visibleLimits.setups} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
