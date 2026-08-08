import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePublicProfile } from "../hooks/usePublicProfile";
import { ProfilePostsTab } from "../components/profile/ProfilePostsTab";
import { ProfileCollectionsTab } from "../components/profile/ProfileCollectionsTab";
import { ArrowLeft, Grid3X3, Layers, Share2 } from "lucide-react";
import { UserProfileSkeleton } from "../components/CardSkeleton";
import { ShareMenu } from "../components/ShareMenu";

const TABS = ["Setups", "Collections"];

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { profile, loading, error } = usePublicProfile(username);

  const [activeTab, setActiveTab] = useState("Setups");
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef(null);

  // Close share popover when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleShare = async () => {
    // On mobile/devices that support native share, trigger it directly
    const shareUrl = `${window.location.origin}/user/${username}`;
    const shareText = `Check out ${username}'s setups on SetupSpot`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${username} on SetupSpot`, text: shareText, url: shareUrl });
      } catch {
        // User cancelled
      }
    } else {
      // Desktop: show custom share popover
      setShareOpen((prev) => !prev);
    }
  };

  if (loading) {
    return <UserProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-lg font-bold" style={{ color: "#0F172A" }}>
          {error || "Profile not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
          style={{ backgroundColor: "#0066ff" }}
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  const avatarUrl = profile.avatar_url;
  const initials = profile.username?.charAt(0)?.toUpperCase() ?? "U";
  const setupCount = profile.post_count ?? 0;
  const collectionCount = profile.collection_count ?? 0;
  const profileUrl = `${window.location.origin}/user/${profile.username}`;

  return (
    <main className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Top bar: back + share */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-100 cursor-pointer"
          style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Share button */}
        <div className="relative" ref={shareRef}>
          <button
            id="profile-share-btn"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-slate-100 cursor-pointer"
            style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
          >
            <Share2 size={14} />
            Share
          </button>

          {shareOpen && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <ShareMenu
                customUrl={profileUrl}
                title={`Check out ${profile.username}'s setups on SetupSpot`}
                onClose={() => setShareOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <section className="flex flex-col sm:flex-row items-start gap-8 mb-8">
        <div className="shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 shadow-md"
              style={{ borderColor: "#E2E8F0" }}
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-md"
              style={{
                borderColor: "rgba(0,102,255,0.3)",
                backgroundColor: "rgba(0,102,255,0.08)",
                color: "#0066ff",
              }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: "#0F172A" }}>
            {profile.username}
          </h1>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#0066ff" }}>
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="text-sm mt-3 leading-relaxed max-w-2xl" style={{ color: "#475569" }}>
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: "#F1F5F9" }}>
            <div>
              <span className="text-lg font-black" style={{ color: "#0F172A" }}>
                {setupCount}
              </span>
              <span className="text-xs font-medium ml-1.5" style={{ color: "#727687" }}>
                {setupCount === 1 ? "Setup" : "Setups"}
              </span>
            </div>
            <div>
              <span className="text-lg font-black" style={{ color: "#0F172A" }}>
                {collectionCount}
              </span>
              <span className="text-xs font-medium ml-1.5" style={{ color: "#727687" }}>
                {collectionCount === 1 ? "Collection" : "Collections"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b pb-3" style={{ borderColor: "#E2E8F0" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === tab ? "rgba(0,102,255,0.08)" : "transparent",
              color: activeTab === tab ? "#0066ff" : "#727687",
            }}
          >
            {tab === "Setups" ? <Grid3X3 size={15} /> : <Layers size={15} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Active Tab View */}
      {activeTab === "Setups" ? (
        <ProfilePostsTab setups={profile.setups} />
      ) : (
        <ProfileCollectionsTab collections={profile.collections} />
      )}
    </main>
  );
};

export default UserProfilePage;
