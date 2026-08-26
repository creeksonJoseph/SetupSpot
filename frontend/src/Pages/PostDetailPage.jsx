import React, { useCallback, useMemo, useRef, useState, Suspense } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { useAuth } from "../context/AuthContext";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  Eye, EyeOff, Heart, MessageCircle, MoreHorizontal,
  ArrowLeft, Expand, Plus, ChevronDown, ChevronUp,
  ShoppingBag, ExternalLink, Info, Trash2, Share2, Pencil,
} from "lucide-react";
import { PostDetailSkeleton, SimilarSetupsSkeleton, SetupHeroSkeleton, ItemsListSkeleton } from "../components/CardSkeleton";

import SetupImageCanvas from "../components/SetupImageCanvas";
import SetupItemList from "../components/SetupItemList";
import SimilarSetups from "../components/SimilarSetups";
import AddToCollectionModal from "../components/AddToCollectionModal";
import PostSocialBar from "../components/PostSocialBar";
import CommentSection from "../components/CommentSection";
import AuthPromptModal from "../components/auth/AuthPromptModal";
import { ImageLightbox } from "../components/ImageLightbox";
import { ShareMenu } from "../components/ShareMenu";
import { getBlurPlaceholderUrl } from "../utils/imageOptimizer";
import { useSEO } from "../hooks/useSEO";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileImageLoaded, setMobileImageLoaded] = useState(false);
  const [mobileAspectRatio, setMobileAspectRatio] = useState(null);

  // Scroll to top immediately when viewing a setup detail page
  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [id]);

  const { isLoggedIn } = useCurrentUser();

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

  // ── Dynamic SEO ────────────────────────────────────────────────────────────
  const seoJsonLd = useMemo(() => {
    if (!setup) return undefined;
    const items = setup.items || [];
    const priceTotal = items.reduce((sum, it) => {
      const p = typeof it.price === "number" ? it.price : parseFloat(it.price);
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
    const itemDescParts = items.slice(0, 5).map((it) => it.name).filter(Boolean);
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: setup.name,
      description: `Desk setup by ${setup.username || setup.author || "a creator"} on SetupSpot${
        itemDescParts.length ? ` featuring ${itemDescParts.join(", ")}` : ""
      }.`,
      url: `https://setupspot.com/setup/${setup.id}`,
      numberOfItems: items.length,
      itemListElement: items.map((it, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: it.name,
          ...(it.price ? { offers: { "@type": "Offer", price: it.price, priceCurrency: "USD" } } : {}),
          ...(it.link ? { url: it.link } : {}),
        },
      })),
      ...(priceTotal > 0 ? { totalPrice: `$${priceTotal.toFixed(2)} USD` } : {}),
    };
  }, [setup]);

  const seoDescription = useMemo(() => {
    if (!setup) return undefined;
    const items = setup.items || [];
    const author = setup.username || setup.author || "a creator";
    const featured = items.slice(0, 3).map((it) => it.name).filter(Boolean);
    return `See ${author}'s desk setup on SetupSpot${
      featured.length ? ` featuring ${featured.join(", ")}` : ""
    }. Discover the gear and get inspired.`;
  }, [setup]);

  useSEO({
    title: setup ? `${setup.name} by @${setup.username || setup.author || "creator"} | SetupSpot` : "Setup | SetupSpot",
    description: seoDescription,
    image: setup?.image_url || undefined,
    url: `https://setupspot.com/setup/${id}`,
    type: "article",
    jsonLd: seoJsonLd,
    jsonLdId: "setup-detail-jsonld",
  });
  // ──────────────────────────────────────────────────────────────────────────

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
  const [localFavorited, setLocalFavorited] = useState(false);
  const mobileMoreRef = useRef(null);

  // Sync localFavorited with setup data once loaded
  React.useEffect(() => { if (setup) setLocalFavorited(Boolean(setup.isFavorited)); }, [setup?.isFavorited]);

  // Close mobile 3-dot popup when user clicks anywhere else on the screen
  React.useEffect(() => {
    if (!mobileMoreOpen) return;
    const handleClickOutside = (e) => {
      if (mobileMoreRef.current && !mobileMoreRef.current.contains(e.target)) {
        setMobileMoreOpen(false);
        setMobileDeleteConfirm(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [mobileMoreOpen]);

  const itemRefs = useRef({});

  const handleRowTap = (item) => {
    setFlashedPinId(item.id);
    setTimeout(() => setFlashedPinId(null), 1200);
  };
  // ────────────────────────────────────────────────────────────────

  if (!loading && (error || !setup)) {
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

  const allItems = setup?.items || [];
  const commentCount = liveCommentCount ?? setup?.comment_count ?? 0;

  const initialFocusedItem = initialFocusedItemId
    ? allItems.find((it) => it.id === initialFocusedItemId)
    : null;

  const isFocusMode = initialFocusedItem && !showAllItems;
  const displayedItems = isFocusMode ? [initialFocusedItem] : allItems;
  const hasOtherItems = initialFocusedItem && allItems.length > 1;
  const totalSetupPrice = allItems.reduce((sum, item) => {
    const p = typeof item.price === "number" ? item.price : parseFloat(item.price);
    return sum + (isNaN(p) ? 0 : p);
  }, 0);

  return (
    <div
      className={isLoggedIn ? "lg:-m-6 lg:-my-6 h-full max-h-full min-h-0 overflow-hidden flex flex-col flex-1" : "flex flex-col"}
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
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold shadow-2xs mb-3 shrink-0"
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
              {/* Hero image with pins — uncropped dynamic aspect ratio */}
              <div
                className="relative w-full max-h-[65vh] overflow-hidden flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: "#0F172A",
                  aspectRatio: mobileAspectRatio ? `${mobileAspectRatio}` : "16/9",
                }}
              >
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
                  onLoad={(e) => {
                    setMobileImageLoaded(true);
                    const { naturalWidth, naturalHeight } = e.target;
                    if (naturalWidth && naturalHeight) {
                      setMobileAspectRatio(naturalWidth / naturalHeight);
                    }
                  }}
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

                {/* Hotspot Pins — styled to match the create page (focal dot + dotted leader + number badge) */}
                {displayedItems.map((item, index) => {
                  const isHovered = item.id === hoveredItemId;
                  return (
                    <div
                      key={item.id}
                      className="absolute z-10 cursor-pointer select-none"
                      style={{
                        top: `${item.y}%`,
                        left: `${item.x}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => setHoveredItemId(isHovered ? null : item.id)}
                    >
                      {/* 1. Focal dot with pulse ring */}
                      <div className="relative flex items-center justify-center">
                        <span
                          className={`absolute w-5 h-5 rounded-full animate-ping ${
                            isHovered ? "bg-[#0066ff] opacity-75" : "bg-white opacity-40"
                          }`}
                        />
                        <span
                          className={`relative w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-all ${
                            isHovered
                              ? "bg-[#0066ff] scale-125 ring-2 ring-[#0066ff]/40"
                              : "bg-slate-900 hover:scale-110 hover:bg-[#0066ff]"
                          }`}
                        />
                      </div>

                      {/* 2. Dotted leader line rising from the focal dot */}
                      <svg
                        className="absolute pointer-events-none overflow-visible"
                        style={{
                          left: "50%",
                          top: "50%",
                          width: "24px",
                          height: "44px",
                          transform: "translate(-12px, -44px)",
                        }}
                        viewBox="0 0 24 44"
                      >
                        <line
                          x1="12" y1="44"
                          x2="12" y2="0"
                          stroke={isHovered ? "#0066ff" : "rgba(255,255,255,0.85)"}
                          strokeWidth="2"
                          strokeDasharray="2.5 2.5"
                        />
                      </svg>

                      {/* 3. Number badge at the top of the leader line */}
                      <div
                        className="absolute pointer-events-none flex items-center justify-center"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -56px)",
                        }}
                      >
                        <div
                          className={`px-2 py-0.5 rounded-full text-[11px] font-black shadow-lg border transition-all duration-200 pointer-events-auto flex items-center justify-center min-w-[22px] h-[22px] ${
                            isHovered
                              ? "bg-[#0066ff] text-white border-white ring-2 ring-[#0066ff]/30 scale-110"
                              : "bg-[#0F172A] text-white border-white/30 hover:bg-[#0066ff]"
                          }`}
                        >
                          {index + 1}
                        </div>
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

              {/* Title + Author + action icons row (Attached to Image Bottom) */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-white border-t"
                style={{ borderColor: "#E2E8F0" }}
              >
              <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                <h1 className="text-base font-black tracking-tight leading-snug text-[#0F172A] truncate">
                  {setup.name || setup.title}
                </h1>
                <Link to={`/profile/${setup.author}`} className="flex items-center gap-1.5 group shrink-0">
                  {setup.author_avatar ? (
                    <img
                      src={setup.author_avatar}
                      alt={setup.author}
                      className="w-4.5 h-4.5 rounded-full object-cover border"
                      style={{ borderColor: "#E2E8F0" }}
                    />
                  ) : (
                    <div
                      className="w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                      style={{ backgroundColor: "#0066ff" }}
                    >
                      {setup.author?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-500 group-hover:underline">
                    @{setup.author}
                  </span>
                </Link>
              </div>

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
                <div className="relative" ref={mobileMoreRef}>
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
                      className="absolute bottom-11 right-0 z-30 w-44 bg-white rounded-2xl shadow-xl border overflow-hidden"
                      style={{ borderColor: "#E2E8F0" }}
                    >
                      {/* Save to Favourites — optimistic */}
                      {isLoggedIn && (
                        <button
                          onClick={async () => {
                            const prev = localFavorited;
                            const next = !prev;
                            setLocalFavorited(next);
                            setMobileMoreOpen(false);
                            try {
                              await toggleFavorite?.(setup.id, prev);
                            } catch {
                              setLocalFavorited(prev);
                            }
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-left cursor-pointer"
                          style={{ color: localFavorited ? "#e11d48" : "#0F172A", borderBottom: "1px solid #E2E8F0" }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px", color: localFavorited ? "#e11d48" : "#64748B" }}>
                            {localFavorited ? "favorite" : "bookmark"}
                          </span>
                          {localFavorited ? "Saved" : "Save"}
                        </button>
                      )}
                      <button
                        onClick={() => { setMobileMoreOpen(false); setMobileShareOpen(true); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-left cursor-pointer"
                        style={{ color: "#0F172A", borderBottom: isOwner ? "1px solid #E2E8F0" : "none" }}
                      >
                        <Share2 size={16} style={{ color: "#64748B" }} />
                        Share Setup
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => {
                            setMobileMoreOpen(false);
                            navigate(`/create?edit=${setup.id}`);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-left cursor-pointer"
                          style={{ color: "#0F172A", borderBottom: "1px solid #E2E8F0" }}
                        >
                          <Pencil size={16} style={{ color: "#64748B" }} />
                          Edit Setup
                        </button>
                      )}
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
            {displayedItems.length > 0 && (
              <div className="px-1 pt-5 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-bold" style={{ color: "#0F172A" }}>
                    {isFocusMode ? "Focused Item" : "Items in Setup"}{" "}
                    <span style={{ color: "#64748B", fontWeight: 600 }}>({displayedItems.length})</span>
                  </h2>
                  {totalSetupPrice > 0 && (
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold shadow-2xs"
                      style={{
                        backgroundColor: "rgba(0,102,255,0.06)",
                        borderColor: "rgba(0,102,255,0.2)",
                        color: "#0066ff",
                      }}
                    >
                      <span>Est. Total:</span>
                      <span className="font-extrabold">
                        ${totalSetupPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="rounded-none overflow-hidden border"
                  style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}
                >
                  {displayedItems.map((item) => {
                    const itemPinNumber = allItems.findIndex((it) => it.id === item.id) + 1;
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
                            {itemPinNumber}
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
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-white self-end transition-all shadow-2xs active:scale-95 cursor-pointer"
                                style={{ backgroundColor: "#0066ff" }}
                              >
                                <ShoppingBag size={13} />
                                <span>Buy on Merchant Site</span>
                                <ExternalLink size={11} className="opacity-80" />
                              </a>
                            ) : (
                              <div
                                className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-medium self-end"
                                style={{ backgroundColor: "#F1F5F9", color: "#94A3B8" }}
                              >
                                <span>No merchant link available</span>
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
          className="flex flex-1 gap-3 lg:gap-4 p-3 lg:p-4 h-full w-full overflow-hidden"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) clamp(220px, 24vw, 290px) clamp(240px, 25vw, 320px)",
            alignItems: "stretch",
          }}
        >
          {/* LEFT COLUMN — Hero Canvas & Social Actions & Comments */}
          <div className="flex flex-col gap-2.5 h-full overflow-y-auto pr-1">
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

            {!setup ? (
              <SetupHeroSkeleton />
            ) : (
              <div
                className="flex flex-col gap-0 rounded-xl border bg-white overflow-hidden shrink-0 mb-4"
                style={{ borderColor: "#E2E8F0" }}
              >
                <SetupImageCanvas
                  imageUrl={setup.image_url}
                  items={displayedItems}
                  hoveredItemId={initialFocusedItemId ?? hoveredItemId}
                  setHoveredItemId={setHoveredItemId}
                />

                <PostSocialBar
                  setupId={setup.id}
                  title={setup.name || setup.title}
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
            )}
          </div>

          {/* MIDDLE COLUMN — Equipment Items Breakdown */}
          <div className="h-full overflow-y-auto flex flex-col min-h-0 pr-1">
            {!setup ? (
              <ItemsListSkeleton count={5} />
            ) : (
              <>
                {initialFocusedItem && (
                  <div
                    className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shadow-2xs mb-2"
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
              </>
            )}
          </div>

          {/* RIGHT COLUMN — independent Suspense boundary */}
          <div className="h-full overflow-y-auto flex flex-col min-h-0 pr-1">
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



