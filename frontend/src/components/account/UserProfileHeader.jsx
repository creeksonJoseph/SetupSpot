import React from "react";
import { LogOut } from "lucide-react";

export const UserProfileHeader = ({ user, handleLogout }) => (
  <div className="flex items-center gap-4 mb-10">
    <div
      className="size-16 rounded-full flex items-center justify-center border"
      style={{ backgroundColor: "#f7f9fb", borderColor: "#E2E8F0" }}
    >
      <span className="material-symbols-outlined text-4xl" style={{ color: "#727687" }}>
        person
      </span>
    </div>
    <div className="flex-1">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
        @{user.username}
      </h1>
      <p className="text-sm" style={{ color: "#727687" }}>
        {user.email}
      </p>
    </div>
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg h-10 px-4 text-sm font-semibold transition-colors border"
      style={{ color: "#475569", borderColor: "#E2E8F0", backgroundColor: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <LogOut size={16} /> Sign Out
    </button>
  </div>
);
