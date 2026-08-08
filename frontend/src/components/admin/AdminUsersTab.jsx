import React from "react";
import { Trash2, UserCheck } from "lucide-react";

export const AdminUsersTab = ({
  filteredUsers,
  selectedUserIds,
  setSelectedUserIds,
  handleBulkDeleteUsers,
  handleDeleteUser,
  visibleLimits,
  setVisibleLimits,
}) => {
  return (
    <div className="border bg-white overflow-hidden shadow-2xs" style={{ borderColor: "#E2E8F0" }}>

      <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between gap-4" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-sm font-bold" style={{ color: "#0F172A" }}>
          Registered Users ({filteredUsers.length})
        </h3>
        {selectedUserIds.length > 0 && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <span className="text-xs font-bold text-slate-700">
              {selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleBulkDeleteUsers}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 size={13} /> Delete Selected ({selectedUserIds.length})
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredUsers.length > 0 &&
                    selectedUserIds.length ===
                      filteredUsers.filter((u) => u.email.toLowerCase() !== "charanajoseph@gmail.com").length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUserIds(
                        filteredUsers
                          .filter((u) => u.email.toLowerCase() !== "charanajoseph@gmail.com")
                          .map((u) => u.id)
                      );
                    } else {
                      setSelectedUserIds([]);
                    }
                  }}
                  className="rounded cursor-pointer accent-blue-600"
                />
              </th>
              <th className="p-3.5">User</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Setups</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Joined</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(0, visibleLimits.users).map((u) => (
              <tr
                key={u.id}
                className={`hover:bg-slate-50/60 transition-colors ${
                  selectedUserIds.includes(u.id) ? "bg-blue-50/40" : ""
                }`}
              >
                <td className="p-3.5 w-10 text-center">
                  {u.email.toLowerCase() !== "charanajoseph@gmail.com" && (
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds((prev) => [...prev, u.id]);
                        } else {
                          setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
                        }
                      }}
                      className="rounded cursor-pointer accent-blue-600"
                    />
                  )}
                </td>
                <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {u.username[0].toUpperCase()}
                  </div>
                  <span>@{u.username}</span>
                </td>
                <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                <td className="p-3.5 font-bold text-slate-900">{u.setup_count}</td>
                <td className="p-3.5">
                  {u.is_admin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      <UserCheck size={11} /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      Member
                    </span>
                  )}
                </td>
                <td className="p-3.5 text-slate-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="p-3.5 text-right">
                  {u.email.toLowerCase() !== "charanajoseph@gmail.com" ? (
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Primary Admin</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length > visibleLimits.users && (
          <div className="p-3 text-center border-t bg-slate-50/50" style={{ borderColor: "#F1F5F9" }}>
            <button
              onClick={() => setVisibleLimits((prev) => ({ ...prev, users: prev.users + 25 }))}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Load More Users ({filteredUsers.length - visibleLimits.users} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
