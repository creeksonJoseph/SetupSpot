import React, { useCallback, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { Eye, EyeOff } from "lucide-react";
import { PostDetailSkeleton } from "../components/CardSkeleton";

import SetupImageCanvas from "../components/SetupImageCanvas";
import SetupItemList from "../components/SetupItemList";
import SimilarSetups from "../components/SimilarSetups";
import AddToCollectionModal from "../components/AddToCollectionModal";
import PostSocialBar from "../components/PostSocialBar";
import CommentSection from "../components/CommentSection";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ?itemId=N — when arriving from a collection item click, focus this single item
  const initialFocusedItemId = searchParams.get("itemId")
    ? parseInt(searchParams.get("itemId"), 10)
    : null;

  // Toggle state: when true, shows all items and pins; when false, shows focused item/pin only
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
    commentsOpen,
    setCommentsOpen,
  } = usePostDetail(id);

  // Track live comment count from CommentSection (lazy-updated)
  const [liveCommentCount, setLiveCommentCount] = useState(null);

  const handleCommentCountChange = useCallback((count) => {
    setLiveCommentCount(count);
  }, []);

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (error || !setup) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col" style={{ backgroundColor: "#f7f9fb" }}>
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

  // Focused item logic
  const initialFocusedItem = initialFocusedItemId
    ? allItems.find((it) => it.id === initialFocusedItemId)
    : null;

  // In focus mode, only show the clicked item (and its pin). When showAllItems is true, show all.
  const isFocusMode = initialFocusedItem && !showAllItems;
  const displayedItems = isFocusMode ? [initialFocusedItem] : allItems;
  const hasOtherItems = initialFocusedItem && allItems.length > 1;

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      {/* ══════════════════════════════════════════════════════════
          MOBILE & TABLET LAYOUT  (hidden on lg+, < 1024px)
      ══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen px-3 sm:px-4 pt-1 pb-24" style={{ backgroundColor: "#F7F9FB" }}>
        {!setup ? (
          <div className="space-y-6 pt-2">
            <SetupHeroSkeleton />
            <ItemsListSkeleton count={4} />
          </div>
        ) : (
          <>
            {/* Focused Item Banner on Mobile */}
            {initialFocusedItem && (
              <div
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold shadow-2xs mb-3"
                style={{
                  backgroundColor: "rgba(0,102,255,0.06)",
                  borderColor: "rgba(0,102,255,0.2)",
                }}
              >
                <span className="text-[11px] font-semibold shrink-0" style={{ color: "#0066ff" }}>
                  {isFocusMode ? "Focused item pin" : "All setup pins"}
                </span>
                {hasOtherItems && (
                  <button
                    onClick={() => setShowAllItems((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer shrink-0 shadow-xs"
                    style={{ backgroundColor: "#0066ff" }}
                  >
                    {isFocusMode ? (
                      <>
                        <Eye size={12} />
                        Show all items ({allItems.length})
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} />
                        Show focused item only
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Unified Card Container (Photo + Author Row attached) */}
            <div className="rounded-2xl border bg-white shadow-xs overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
              {/* Hero image with pins — contained without cropping */}
              <div className="relative w-full max-h-[65vh] min-h-[280px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
                {setup.image_url && !mobileImageLoaded && (
                  <img
                    src={getBlurPlaceholderUrl(setup.image_url)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-contain filter blur-md scale-105 pointer-events-none transition-opacity duration-300 z-0"
                  />
                )}

                <img
                  src={setup.image_url}
                  alt={setup.title || "Setup"}
                  onLoad={() => setMobileImageLoaded(true)}
                  className={`w-full h-full max-h-[65vh] object-contain block relative z-1 transition-opacity duration-300 ${
                    mobileImageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Back pill */}
                <button
                  onClick={() => navigate(-1)}
                  className="absolute top-3 left-3 flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-md cursor-pointer z-10"
                  style={{ backgroundColor: "rgba(15,23,42,0.65)" }}
                >
                  <ArrowLeft size={14} className="mr-1" /> Back
                </button>

                {/* Hotspot Pins */}
                {displayedItems.map((item) => {
                  const isHovered = item.id === hoveredItemId;
                  const pinNumber = allItems.findIndex((it) => it.id === item.id) + 1;
                  return (
                    <div
                      key={item.id}
                      className="absolute z-10 w-11 h-11 flex items-center justify-center cursor-pointer select-none"
                      style={{
                        top: `${item.y}%`,
                        left: `${item.x}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => setHoveredItemId(isHovered ? null : item.id)}
                    >
                      <span
                        className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md transition-transform duration-200"
                        style={{
                          backgroundColor: isHovered ? "#0066ff" : "rgba(255,255,255,0.9)",
                          color: isHovered ? "#ffffff" : "#0F172A",
                          transform: isHovered ? "scale(1.25)" : "scale(1)",
                          boxShadow: isHovered
                            ? "0 0 0 3px rgba(0,102,255,0.35)"
                            : "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      >
                        {pinNumber}
                      </span>
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
                  {displayedItems.map((item) => {
                    const isFlashed = flashedPinId === item.id;
                    const isExpanded = mobileExpandedItemId === item.id;
                    const itemNumber = allItems.findIndex((it) => it.id === item.id) + 1;
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
                            {itemNumber}
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
          </>
        )}

        {/* Similar Setups — independent Suspense boundary, loads in parallel with the rest */}
        <div className="px-1 pt-6 pb-8">
          <Suspense fallback={<SimilarSetupsSkeleton count={6} />}>
            <SimilarSetups currentSetupId={id} mobileMode />
          </Suspense>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP & MID-LEVEL SCREEN LAYOUT  (hidden below lg [1024px], fluid 3-column grid)
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-full w-full max-h-screen overflow-hidden">
        <div
          className="flex gap-4 w-full items-start"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
          }}
        >
          {/* lg+ : 3 columns. Below lg: single column, stacked in order */}
          <div
            className="contents lg:grid"
            style={{ gridTemplateColumns: "minmax(0, 1fr) 260px 300px", gap: "1rem" }}
          >
            {/* ── LEFT COLUMN (image + social bar + comments) ────────── */}
            <div className={`flex flex-col gap-2.5 lg:max-h-[calc(100vh-2.5rem)] lg:pr-1 ${
              commentsOpen ? "lg:overflow-y-auto" : "lg:overflow-hidden"
            }`}>
              {/* Back button */}
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

              <div className="flex flex-col gap-0 rounded-xl border bg-white overflow-hidden shrink-0" style={{ borderColor: "#E2E8F0" }}>
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
                />

                {commentsOpen && (
                  <CommentSection
                    setupId={setup.id}
                    onCommentCountChange={handleCommentCountChange}
                  />
                )}
              </div>
            </div>

            {/* ── MIDDLE COLUMN — item list (focused or all) ───────── */}
            <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:h-full lg:overflow-hidden">
              {/* Focused-item banner + persistent toggle button */}
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
                        <>
                          <Eye size={13} />
                          <span>Show all ({allItems.length})</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} />
                          <span>Focus only</span>
                        </>
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

            {/* ── RIGHT COLUMN — similar setups ───── */}
            <div className="mt-4 lg:mt-0 lg:h-full lg:overflow-hidden">
              <SimilarSetups currentSetupId={id} />
            </div>
          </div>
        </div>
      </div>

      {/* Add to Collection modal (portal-style) */}
      <AddToCollectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItemForCollection}
      />
    </div>
  );
};

export default PostDetailPage;
