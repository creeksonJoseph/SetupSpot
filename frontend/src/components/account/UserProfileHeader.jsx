import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquarePlus } from "lucide-react";
import { SuggestFeatureModal } from "../feedback/SuggestFeatureModal";
import ConfirmSignOutModal from "../auth/ConfirmSignOutModal";

export const UserProfileHeader = ({ user, handleLogout }) => {
  const setupCount = user?.post_count ?? user?.setups?.length ?? 0;
  const totalLikes = user?.total_likes ?? user?.setups?.reduce((acc, s) => acc + (s.like_count ?? s.likes?.length ?? 0), 0) ?? 0;
  const avatarUrl = user?.avatar_url || user?.avatar || user?.profile_picture;
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <section className="flex flex-col gap-3 sm:gap-6 mb-4 sm:mb-8">
      <SuggestFeatureModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
      <ConfirmSignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Avatar, User Details & Desktop Top-Right Actions Row */}
      <div className="flex flex-row items-center justify-between gap-4 sm:gap-6 w-full">
        <div className="flex flex-row items-center gap-3 sm:gap-6 min-w-0 flex-1">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 sm:w-32 sm:h-32 rounded-full border-2 sm:border-4 shadow-md overflow-hidden flex items-center justify-center text-white"
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
                <span className="font-black text-xl sm:text-4xl uppercase tracking-wider">
                  {user?.username ? user.username.charAt(0) : "U"}
                </span>
              )}
            </div>
          </div>

          {/* Username & Email */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-xl sm:text-3xl md:text-4xl font-black tracking-[-0.033em] truncate"
              style={{ color: "#0F172A" }}
            >
              @{user?.username}
            </h1>
            <p className="text-xs sm:text-sm font-medium mt-0.5 text-[#727687] truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Action Buttons Row — Positioned Top-Right on Desktop, Hidden on Mobile */}
        <div className="hidden sm:flex items-center justify-end gap-2.5 shrink-0 flex-wrap">
          {/* Suggest Features Button */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md cursor-pointer"
            style={{ backgroundColor: "#0066ff" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
          >
            <MessageSquarePlus size={15} />
            <span>Suggest features</span>
          </button>

          {/* Settings Button */}
          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 shadow-2xs hover:bg-slate-50 cursor-pointer"
            style={{
              borderColor: "#E2E8F0",
              backgroundColor: "#ffffff",
              color: "#0F172A",
            }}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => setShowSignOutModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer"
            style={{
              borderColor: "rgba(186,26,26,0.2)",
              color: "#ba1a1a",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(186,26,26,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Bio */}
      {user?.bio ? (
        <p className="max-w-2xl text-xs sm:text-base leading-normal" style={{ color: "#475569" }}>
          {user.bio}
        </p>
      ) : null}

      {/* Stats */}
      <div className="flex items-center justify-start gap-6 sm:gap-8 mt-1 sm:mt-2">
        <div className="flex flex-col items-start">
          <span className="font-extrabold text-lg sm:text-2xl" style={{ color: "#0F172A" }}>
            {setupCount}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#727687" }}>
            Setups
          </span>
        </div>

        <div className="flex flex-col items-start">
          <span className="font-extrabold text-lg sm:text-2xl text-[#0F172A]">
            {totalLikes}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#727687" }}>
            Total Likes
          </span>
        </div>
      </div>
    </section>
  );
};
