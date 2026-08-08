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
      <div className="p-4 lg:p-5 w-full">
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
