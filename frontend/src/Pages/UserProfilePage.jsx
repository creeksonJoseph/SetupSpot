import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePublicProfile } from "../hooks/usePublicProfile";
import { CollectionMosaicCover } from "../components/collections/CollectionMosaicCover";
import { ArrowLeft, Loader2, Grid3X3, Layers, ImageOff } from "lucide-react";

const TABS = ["Posts", "Collections"];

const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, loading, error } = usePublicProfile(id);
  const [activeTab, setActiveTab] = useState("Posts");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: "#f7f9fb" }}>
        <div className="flex items-center gap-3" style={{ color: "#475569" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "#0066ff" }} />
          <span className="text-base font-semibold">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-lg font-bold" style={{ color: "#0F172A" }}>
          {error || "Profile not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
          style={{ backgroundColor: "#0066ff" }}
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  const avatarUrl = profile.avatar_url;
  const initials = profile.username?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <main className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold mb-6 transition-all hover:bg-slate-100 cursor-pointer"
        style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* ── Profile Header ────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row items-start gap-8 mb-8">
        {/* Avatar */}
        <div className="shrink-0">
          <div
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 shadow-lg overflow-hidden flex items-center justify-center text-white"
            style={{
              borderColor: "#ffffff",
              background: "linear-gradient(135deg, #0066ff 0%, #5a27f1 100%)",
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="font-black text-4xl uppercase">{initials}</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-[-0.033em]" style={{ color: "#0F172A" }}>
            @{profile.username}
          </h1>
          {profile.bio && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "#475569" }}>
              {profile.bio}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-5">
            <div className="flex flex-col items-start">
              <span className="font-extrabold text-2xl" style={{ color: "#0F172A" }}>
                {profile.post_count}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#727687" }}>
                Posts
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-extrabold text-2xl" style={{ color: "#0F172A" }}>
                {profile.collection_count}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#727687" }}>
                Collections
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tab switcher ──────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-8 border-b" style={{ borderColor: "#E2E8F0" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-all relative cursor-pointer"
            style={{
              color: activeTab === tab ? "#0066ff" : "#727687",
              borderBottom: activeTab === tab ? "2px solid #0066ff" : "2px solid transparent",
            }}
          >
            {tab === "Posts" ? <Grid3X3 size={15} /> : <Layers size={15} />}
            {tab}
          </button>
        ))}
      </div>

      {/* ── Posts tab ─────────────────────────────────────────── */}
      {activeTab === "Posts" && (
        profile.setups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ImageOff size={40} style={{ color: "#CBD5E1" }} />
            <p className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
              No posts yet
            </p>
          </div>
        ) : (
          /* Masonry columns — preserves natural image aspect ratios */
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {profile.setups.map((setup) => (
              <Link
                key={setup.id}
                to={`/setup/${setup.id}`}
                className="group block mb-4 rounded-2xl overflow-hidden border bg-white shadow-2xs hover:shadow-xl transition-all duration-300 break-inside-avoid"
                style={{ borderColor: "#E2E8F0" }}
              >
                {setup.image ? (
                  <img
                    src={setup.image}
                    alt={setup.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] flex items-center justify-center bg-slate-100">
                    <ImageOff size={28} style={{ color: "#CBD5E1" }} />
                  </div>
                )}
                <div className="px-3 py-2.5 border-t" style={{ borderColor: "#F1F5F9" }}>
                  <p className="text-xs font-bold truncate" style={{ color: "#0F172A" }}>
                    {setup.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* ── Collections tab ───────────────────────────────────── */}
      {activeTab === "Collections" && (
        profile.collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Layers size={40} style={{ color: "#CBD5E1" }} />
            <p className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
              No public collections yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {profile.collections.map((col) => (
              <Link
                key={col.id}
                to={`/collections?id=${col.id}`}
                className="group relative rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="aspect-[4/3] relative w-full overflow-hidden bg-slate-100">
                  <CollectionMosaicCover coverImages={col.cover_images} name={col.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                    <h3 className="font-extrabold text-base leading-tight truncate drop-shadow-md">
                      {col.name}
                    </h3>
                    <p className="text-[11px] font-medium text-white/80 mt-0.5 drop-shadow">
                      {col.item_count} {col.item_count === 1 ? "saved item" : "saved items"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </main>
  );
};

export default UserProfilePage;
