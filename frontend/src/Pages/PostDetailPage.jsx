import React, { useCallback, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { Loader2, ArrowLeft, ChevronDown } from "lucide-react";
import SetupImageCanvas from "../components/SetupImageCanvas";
import SetupItemList from "../components/SetupItemList";
import SimilarSetups from "../components/SimilarSetups";
import AddToCollectionModal from "../components/AddToCollectionModal";
import PostSocialBar from "../components/PostSocialBar";
import CommentSection from "../components/CommentSection";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ?itemId=N — when arriving from a collection item click, focus this single item
  const focusedItemId = searchParams.get("itemId")
    ? parseInt(searchParams.get("itemId"), 10)
    : null;

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

  const clearFocus = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen -m-8" style={{ backgroundColor: "#f7f9fb" }}>
        <Loader2 size={40} className="animate-spin" style={{ color: "#0066ff" }} />
        <p className="ml-4 text-lg" style={{ color: "#475569" }}>
          Loading Setup...
        </p>
      </div>
    );
  }

  if (error || !setup) {
    return (
      <div className="flex items-center justify-center h-screen -m-8 flex-col" style={{ backgroundColor: "#f7f9fb" }}>
        <p className="text-xl mb-2" style={{ color: "#0F172A" }}>
          {error || "Setup not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors"
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

  // When a focused item is set: show only that item in the item list
  // When cleared: show all items
  const focusedItem = focusedItemId ? allItems.find((it) => it.id === focusedItemId) : null;
  const displayedItems = focusedItem ? [focusedItem] : allItems;
  const hasOtherItems = focusedItem && allItems.length > 1;

  return (
    <div
      className="flex min-h-screen md:h-screen -m-8 overflow-y-auto md:overflow-hidden"
      style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      {/*
        3-column grid layout:
        - Left: standalone back button + image + social bar + scrollable comment section (1fr)
        - Middle: item list accordion (260px)
        - Right: similar setups recommendation column (300px)
      */}
      <div
        className="flex flex-1 gap-4 p-4 lg:p-5 overflow-y-auto md:overflow-hidden h-full w-full"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px 300px",
          alignItems: "start",
        }}
      >
        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div className={`flex flex-col gap-2.5 max-h-full pr-1 ${
          commentsOpen ? "overflow-y-auto" : "overflow-hidden"
        }`}>
          {/* Standalone Back button item */}
          <div className="shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm"
              style={{ backgroundColor: "#0066ff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
            >
              Back
            </button>
          </div>

          <div className="flex flex-col gap-0 rounded-xl border bg-white overflow-hidden shrink-0" style={{ borderColor: "#E2E8F0" }}>
            {/* Setup image — highlight focused pin when itemId is in URL */}
            <SetupImageCanvas
              imageUrl={setup.image_url}
              items={allItems}
              hoveredItemId={focusedItemId ?? hoveredItemId}
              setHoveredItemId={setHoveredItemId}
            />

            {/* Social bar */}
            <PostSocialBar
              author={setup.author}
              authorAvatar={setup.author_avatar}
              isLiked={setup.is_liked}
              likeCount={setup.like_count}
              commentCount={commentCount}
              commentsOpen={commentsOpen}
              onToggleLike={toggleLike}
              onToggleComments={() => setCommentsOpen((o) => !o)}
              onToggleFavorite={toggleFavorite}
            />

            {/* Comment section — lazy mount */}
            {commentsOpen && (
              <CommentSection
                setupId={setup.id}
                onCommentCountChange={handleCommentCountChange}
              />
            )}
          </div>
        </div>

        {/* ── MIDDLE COLUMN — item list (focused or all) ───────── */}
        <div className="h-full overflow-hidden flex flex-col gap-2">
          {/* Focused-item banner + "View all" button */}
          {focusedItem && (
            <div
              className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-semibold"
              style={{
                backgroundColor: "rgba(0,102,255,0.06)",
                borderColor: "rgba(0,102,255,0.2)",
                color: "#0066ff",
              }}
            >
              <span>Viewing saved item</span>
              {hasOtherItems && (
                <button
                  onClick={clearFocus}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-colors cursor-pointer"
                  style={{ backgroundColor: "#0066ff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
                  title="View all items in this setup"
                >
                  <ChevronDown size={12} />
                  View all items ({allItems.length})
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

        {/* ── RIGHT COLUMN — similar setups (always visible) ───── */}
        <div className="h-full overflow-hidden">
          <SimilarSetups currentSetupId={id} />
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
