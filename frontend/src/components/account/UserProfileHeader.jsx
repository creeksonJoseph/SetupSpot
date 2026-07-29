import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, KeyRound, User } from "lucide-react";


export const UserProfileHeader = ({ user, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const setupCount = user?.post_count ?? user?.setups?.length ?? 0;
  const avatarUrl = user?.avatar_url || user?.avatar || user?.profile_picture;

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="flex flex-col sm:flex-row items-start gap-8 mb-12">
      {/* Avatar Container */}
      <div className="relative shrink-0">
        <div
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 shadow-lg overflow-hidden flex items-center justify-center text-white"
          style={{
            borderColor: "#ffffff",
            background: "linear-gradient(135deg, #0066ff 0%, #5a27f1 100%)",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.username || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-black text-4xl uppercase tracking-wider">
              {user?.username ? user.username.charAt(0) : "U"}
            </span>
          )}
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex-1 text-left w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl font-black tracking-[-0.033em]"
              style={{ color: "#0F172A" }}
            >
              @{user?.username}
            </h1>
            <p className="text-sm font-medium mt-1" style={{ color: "#727687" }}>
              {user?.email}
            </p>
          </div>

          <div className="flex items-center justify-start sm:justify-end gap-3 flex-wrap relative" ref={menuRef}>
            {/* Settings Popup Menu Toggle */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 shadow-sm"
                style={{
                  borderColor: "#E2E8F0",
                  backgroundColor: menuOpen ? "rgba(0,102,255,0.08)" : "#ffffff",
                  color: menuOpen ? "#0066ff" : "#0F172A",
                }}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                Settings
              </button>

              {/* Popup Dropdown Menu */}
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/settings?tab=profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-left transition-colors hover:bg-slate-50"
                    style={{ color: "#0F172A" }}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ color: "#0066ff" }}>
                      edit_note
                    </span>
                    Edit Bio & Profile
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/settings?tab=security");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-left transition-colors hover:bg-slate-50"
                    style={{ color: "#0F172A" }}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ color: "#0066ff" }}>
                      lock_reset
                    </span>
                    Change Password
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200"
              style={{
                borderColor: "rgba(186,26,26,0.2)",
                color: "#ba1a1a",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(186,26,26,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>


        {/* Bio */}
        <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: "#475569" }}>
          {user?.bio ||
            "Digital creator and tech enthusiast exploring the intersection of minimalist design and high-performance workspaces. Crafting clean aesthetics for modern productivity."}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-start gap-8 mt-6">
          <div className="flex flex-col items-start">
            <span className="font-extrabold text-2xl" style={{ color: "#0F172A" }}>
              {setupCount}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#727687" }}>
              Posts
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};



