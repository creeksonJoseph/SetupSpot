import React, { useCallback, useRef, useState, Suspense } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { useAuth } from "../context/AuthContext";
import {
  Eye, EyeOff, Heart, MessageCircle, MoreHorizontal,
  ArrowLeft, Expand, Plus, ChevronDown, ChevronUp,
  ShoppingBag, ExternalLink, Info, Trash2, Share2,
} from "lucide-react";
import { PostDetailSkeleton, SimilarSetupsSkeleton } from "../components/CardSkeleton";

import SetupImageCanvas from "../components/SetupImageCanvas";
import SetupItemList from "../components/SetupItemList";
import SimilarSetups from "../components/SimilarSetups";
import AddToCollectionModal from "../components/AddToCollectionModal";
import PostSocialBar from "../components/PostSocialBar";
import CommentSection from "../components/CommentSection";
import AuthPromptModal from "../components/auth/AuthPromptModal";
import { ImageLightbox } from "../components/ImageLightbox";
import { ShareMenu } from "../components/ShareMenu";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { auth } = useAuth();
  const isLoggedIn = Boolean(auth?.token || auth?.user);

  const initialFocusedItemId = searchParams.get("itemId")
    ? parseInt(searchParams.get("itemId"), 10)
    : null;

  const [showAllItems, setShowAllItems] = useState(false);

  const {
    setup,
    loading,
    error,
    hoveredItemId,
    setHoveredItemId,
    isModalOpen,
    selectedItemForCollection,
    handleOpenModal,
    handleCloseModal,
    toggleLike,
    toggleFavorite,
    deleteSetup,
    isOwner,
    commentsOpen,
    setCommentsOpen,
    authModalState,
    closeAuthModal,
  } = usePostDetail(id);

  const [liveCommentCount, setLiveCommentCount] = useState(null);
  const handleCommentCountChange = useCallback((count) => {
    setLiveCommentCount(count);
  }, []);

  // ── Mobile-only state ────────────────────────────────────────────
  const [flashedPinId, setFlashedPinId] = useState(null);
  const [mobileLightboxOpen, setMobileLightboxOpen] = useState(false);
  const [mobileExpandedItemId, setMobileExpandedItemId] = useState(initialFocusedItemId || null);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileShareOpen, setMobileShareOpen] = useState(false);
  const [mobileDeleteConfirm, setMobileDeleteConfirm] = useState(false);
  const itemRefs = useRef({});

  const flashItem = (itemId) => {
    setFlashedPinId(itemId);
    const el = itemRefs.current[itemId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setFlashedPinId(null), 1200);
  };

  const handleRowTap = (item) => {
    setFlashedPinId(item.id);
    setTimeout(() => setFlashedPinId(null), 1200);
  };
  // ────────────────────────────────────────────────────────────────

  if (loading) return <PostDetailSkeleton />;

  if (error || !setup) {
    return (
      <div className="flex items-center justify-center h-screen -m-8 flex-col" style={{ backgroundColor: "#f7f9fb" }}>
        <p className="text-xl mb-2" style={{ color: "#0F172A" }}>
          {error || "Setup not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
          style={{ backgroundColor: "#0066ff" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
        >
          Back
        </button>
      </div>
    );
  }

  const allItems = setup.items || [];
  const commentCount = liveCommentCount ?? setup.comment_count;

  const initialFocusedItem = initialFocusedItemId
    ? allItems.find((it) => it.id === initialFocusedItemId)
    : null;

  const isFocusMode = initialFocusedItem && !showAllItems;
  const displayedItems = isFocusMode ? [initialFocusedItem] : allItems;
  const hasOtherItems = initialFocusedItem && allItems.length > 1;

  return (
    <div
      className={isLoggedIn ? "lg:-m-8" : "p-4 sm:p-6"}
      style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      {/* ══════════════════════════════════════════════════════════
          MOBILE & TABLET LAYOUT  (hidden on lg+)
      ══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen px-3 sm:px-4 pt-1 pb-24" style={{ backgroundColor: "#F7F9FB" }}>

        {/* Unified Card Container (Photo + Author Row attached) */}
        <div className="rounded-2xl border bg-white shadow-xs overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
          {/* Hero image with pins */}
          <div className="relative aspect-[4/5] w-full" style={{ backgroundColor: "#0F172A" }}>
            <img
              src={setup.image_url}
              alt={setup.title || "Setup"}
              className="w-full h-full object-cover block"
            />

            {/* Back pill */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: "rgba(255,255,255,0.88)",
                color: "#0F172A",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            {/* Expand pill */}
            <button
              onClick={() => setMobileLightboxOpen(true)}
              className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: "rgba(255,255,255,0.88)",
                color: "#0F172A",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
              }}
            >
              <Expand size={13} />
              Expand
            </button>

            {/* Numbered hotspot pins — 44px touch target wrapper around refined 26px dot */}
            {allItems.map((item, index) => {
              const isFlashed = flashedPinId === item.id;
              return (
                <div
                  key={item.id}
                  className="absolute z-10 w-11 h-11 flex items-center justify-center cursor-pointer select-none"
                  style={{
                    top: `${item.y}%`,
                    left: `${item.x}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => flashItem(item.id)}
                >
                  <div
                    className={`rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-200 ${
                      isFlashed ? "w-8 h-8 scale-110 shadow-lg" : "w-6.5 h-6.5 shadow-md"
                    }`}
                    style={{
                      backgroundColor: "#0066ff",
                      border: "2px solid rgba(255,255,255,0.9)",
                      boxShadow: isFlashed ? "0 0 0 4px rgba(0,102,255,0.3)" : "0 2px 6px rgba(0,0,0,0.35)",
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
              );
            })}

            {/* "Tap a pin to shop" badge */}
            {allItems.length > 0 && (
              <div
                className="absolute bottom-3 right-3 z-10 text-[11.5px] font-bold px-2.5 py-1.5 rounded-full shadow-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.88)",
                  color: "#0F172A",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
                }}
              >
                Tap a pin to shop
              </div>
            )}
          </div>

          {/* Author + action icons row (Attached to Image Bottom) */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-white border-t"
            style={{ borderColor: "#E2E8F0" }}
          >
          <Link to={`/profile/${setup.author}`} className="flex items-center gap-2.5">
            {setup.author_avatar ? (
              <img
                src={setup.author_avatar}
                alt={setup.author}
                className="w-9 h-9 rounded-full object-cover border-2"
                style={{ borderColor: "#0066ff" }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style={{ backgroundColor: "#0066ff" }}
              >
                {setup.author?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>
              @{setup.author}
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {/* Like */}
            <button
              onClick={toggleLike}
              className="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
              style={{ border: "none", background: "transparent" }}
            >
              <Heart
                size={20}
                style={{
                  color: setup.is_liked ? "#ef4444" : "#64748B",
                  fill: setup.is_liked ? "#ef4444" : "none",
                }}
              />
            </button>

            {/* Comment */}
            <button
              onClick={() => setCommentsOpen((o) => !o)}
              className="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
              style={{ border: "none", background: "transparent" }}
            >
              <MessageCircle
                size={20}
                style={{ color: commentsOpen ? "#0066ff" : "#64748B" }}
              />
            </button>

            {/* More options */}
            <div className="relative">
              <button
                onClick={() => {
                  setMobileMoreOpen((o) => !o);
                  setMobileDeleteConfirm(false);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
                style={{ border: "none", background: "transparent" }}
              >
                <MoreHorizontal size={20} style={{ color: "#64748B" }} />
              </button>

              {mobileMoreOpen && (
                <div
                  className="absolute top-11 right-0 z-30 w-44 bg-white rounded-2xl shadow-xl border overflow-hidden"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <button
                    onClick={() => { setMobileMoreOpen(false); setMobileShareOpen(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-left cursor-pointer"
                    style={{ color: "#0F172A", borderBottom: "1px solid #E2E8F0" }}
                  >
                    <Share2 size={16} style={{ color: "#64748B" }} />
                    Share Setup
                  </button>
                  {isOwner && !mobileDeleteConfirm && (
                    <button
                      onClick={() => setMobileDeleteConfirm(true)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-left cursor-pointer"
                      style={{ color: "#ba1a1a", background: "transparent", border: "none" }}
                    >
                      <Trash2 size={16} />
                      Delete Setup
                    </button>
                  )}
                  {isOwner && mobileDeleteConfirm && (
                    <div className="px-4 py-3 flex flex-col gap-2" style={{ backgroundColor: "rgba(186,26,26,0.04)" }}>
                      <p className="text-xs font-bold" style={{ color: "#ba1a1a" }}>Delete this setup?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMobileDeleteConfirm(false)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer"
                          style={{ borderColor: "#E2E8F0", color: "#475569", backgroundColor: "#ffffff" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setMobileMoreOpen(false);
                            setMobileDeleteConfirm(false);
                            deleteSetup?.();
                          }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                          style={{ backgroundColor: "#ba1a1a", border: "none" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments (lazy mount - expanding seamlessly inside the card) */}
        {commentsOpen && (
          <CommentSection
            setupId={setup.id}
            onCommentCountChange={handleCommentCountChange}
          />
        )}
        </div>

        {/* Items in Setup */}
        {allItems.length > 0 && (
          <div className="px-1 pt-5 pb-2">
            <h2 className="text-[15px] font-bold mb-3" style={{ color: "#0F172A" }}>
              Items in Setup{" "}
              <span style={{ color: "#64748B", fontWeight: 600 }}>({allItems.length})</span>
            </h2>

            <div
              className="rounded-2xl overflow-hidden border"
              style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
            >
              {allItems.map((item, index) => {
                const isFlashed = flashedPinId === item.id;
                const isExpanded = mobileExpandedItemId === item.id;
                return (
                  <div
                    key={item.id}
                    ref={(el) => { itemRefs.current[item.id] = el; }}
                    className="border-b last:border-b-0 transition-colors duration-500"
                    style={{
                      borderColor: "#E2E8F0",
                      backgroundColor: isFlashed ? "#EAF2FF" : "transparent",
                    }}
                  >
                    {/* Row */}
                    <div
                      className="flex items-center gap-3 px-3.5 py-3.5 cursor-pointer select-none"
                      onClick={() => {
                        handleRowTap(item);
                        setMobileExpandedItemId((prev) =>
                          prev === item.id ? null : item.id
                        );
                      }}
                    >
                      <span
                        className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 transition-colors duration-300"
                        style={{
                          width: "26px", height: "26px",
                          backgroundColor: isFlashed ? "#0066ff" : "#F1F5F9",
                          color: isFlashed ? "#ffffff" : "#475569",
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#0F172A" }}>
                          {item.name}
                        </p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: "#0066ff" }}>
                          ${item.price}
                        </p>
                      </div>
                      <div style={{ color: "#94A3B8" }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                        className="flex items-center justify-center rounded-xl flex-shrink-0 cursor-pointer"
                        style={{
                          width: "36px", height: "36px",
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          color: "#64748B",
                        }}
                        title="Add to Collection"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Expanded accordion body */}
                    {isExpanded && (
                      <div
                        className="px-3.5 pb-3.5 pt-1 border-t flex flex-col gap-2.5"
                        style={{ borderColor: "#F1F5F9", backgroundColor: "rgba(248,250,252,0.5)" }}
                      >
                        {item.item_image_url && (
                          <div
                            className="w-full h-28 rounded-xl overflow-hidden border bg-white"
                            style={{ borderColor: "#E2E8F0" }}
                          >
                            <img
                              src={item.item_image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {item.description ? (
                          <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
                            {item.description}
                          </p>
                        ) : (
                          <p className="text-xs italic" style={{ color: "#94A3B8" }}>
                            No description provided.
                          </p>
                        )}
                        {item.link ? (
                          <a
                            href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white"
                            style={{ backgroundColor: "#0066ff" }}
                          >
                            <ShoppingBag size={14} />
                            Buy on Merchant Site
                            <ExternalLink size={12} className="ml-auto opacity-80" />
                          </a>
                        ) : (
                          <div
                            className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs"
                            style={{ backgroundColor: "#F1F5F9", color: "#94A3B8" }}
                          >
                            No merchant link available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hint row */}
            <div className="flex items-center gap-1.5 mt-2.5 text-xs" style={{ color: "#64748B" }}>
              <Info size={13} />
              Tap a numbered pin on the photo to jump here
            </div>
          </div>
        )}

        {/* Similar Setups — independent Suspense boundary, loads in parallel with the rest */}
        <div className="px-1 pt-6 pb-8">
          <Suspense fallback={<SimilarSetupsSkeleton count={6} />}>
            <SimilarSetups currentSetupId={id} mobileMode />
          </Suspense>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (hidden below lg, 3-column grid)
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-screen overflow-y-auto">
        <div
          className="flex flex-1 gap-4 p-4 lg:p-5 overflow-y-auto h-full w-full"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 260px 300px",
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-2.5 max-h-full overflow-y-auto pr-1">
            <div className="shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm cursor-pointer"
                style={{ backgroundColor: "#0066ff" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
              >
                Back
              </button>
            </div>

            <div
              className="flex flex-col gap-0 rounded-xl border bg-white overflow-hidden shrink-0"
              style={{ borderColor: "#E2E8F0" }}
            >
              <SetupImageCanvas
                imageUrl={setup.image_url}
                items={displayedItems}
                hoveredItemId={initialFocusedItemId ?? hoveredItemId}
                setHoveredItemId={setHoveredItemId}
              />

              <PostSocialBar
                author={setup.author}
                authorAvatar={setup.author_avatar}
                isLiked={setup.is_liked}
                likeCount={setup.like_count}
                isFavorited={setup.is_favorited}
                commentCount={commentCount}
                commentsOpen={commentsOpen}
                onToggleLike={toggleLike}
                onToggleComments={() => setCommentsOpen((o) => !o)}
                onToggleFavorite={toggleFavorite}
                isOwner={isOwner}
                onDeleteSetup={deleteSetup}
              />

              {commentsOpen && (
                <CommentSection
                  setupId={setup.id}
                  onCommentCountChange={handleCommentCountChange}
                />
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN */}
          <div className="h-full overflow-hidden flex flex-col gap-2">
            {initialFocusedItem && (
              <div
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shadow-2xs"
                style={{
                  backgroundColor: "rgba(0,102,255,0.06)",
                  borderColor: "rgba(0,102,255,0.2)",
                }}
              >
                <span className="text-[11px] font-semibold shrink-0" style={{ color: "#0066ff" }}>
                  {isFocusMode ? "Focused item" : "All items"}
                </span>
                {hasOtherItems && (
                  <button
                    onClick={() => setShowAllItems((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer shrink-0 shadow-xs"
                    style={{ backgroundColor: "#0066ff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
                  >
                    {isFocusMode ? (
                      <><Eye size={13} /><span>Show all ({allItems.length})</span></>
                    ) : (
                      <><EyeOff size={13} /><span>Focus only</span></>
                    )}
                  </button>
                )}
              </div>
            )}

            <SetupItemList
              items={displayedItems}
              hoveredItemId={hoveredItemId}
              setHoveredItemId={setHoveredItemId}
              onOpenModal={handleOpenModal}
            />
          </div>

          {/* RIGHT COLUMN — independent Suspense boundary, loads in parallel */}
          <div className="h-full overflow-hidden">
            <Suspense fallback={<SimilarSetupsSkeleton count={6} />}>
              <SimilarSetups currentSetupId={id} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Shared modals */}
      <AddToCollectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItemForCollection}
      />
      <AuthPromptModal
        isOpen={authModalState.isOpen}
        onClose={closeAuthModal}
        actionName={authModalState.actionName}
      />
      {mobileLightboxOpen && (
        <ImageLightbox
          imageUrl={setup.image_url}
          alt="Setup image"
          onClose={() => setMobileLightboxOpen(false)}
        />
      )}
      {mobileShareOpen && (
        <ShareMenu setup={setup} onClose={() => setMobileShareOpen(false)} />
      )}
    </div>
  );
};

export default PostDetailPage;



