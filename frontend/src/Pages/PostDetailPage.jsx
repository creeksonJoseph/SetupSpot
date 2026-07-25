import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { Loader2 } from "lucide-react";
import SetupImageCanvas from "../components/SetupImageCanvas";
import SetupItemList from "../components/SetupItemList";
import ItemDetailsSidebar from "../components/ItemDetailsSidebar";
import SimilarSetups from "../components/SimilarSetups";
import AddToCollectionModal from "../components/AddToCollectionModal";
import PostSocialBar from "../components/PostSocialBar";
import CommentSection from "../components/CommentSection";

const PostDetailPage = () => {
  const { id } = useParams();

  const {
    setup,
    loading,
    error,
    hoveredItemId,
    setHoveredItemId,
    isModalOpen,
    isSidebarOpen,
    selectedItemForDetail,
    selectedItemForCollection,
    handleOpenSidebar,
    handleCloseSidebar,
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
      </div>
    );
  }

  const items = setup.items || [];
  const commentCount = liveCommentCount ?? setup.comment_count;

  return (
    <div
      className="flex h-screen -m-8 overflow-hidden"
      style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      {/*
        Fixed 3-column grid layout:
        - Left: image + social bar + lazy comment section (1fr)
        - Middle: item list (260px)
        - Right: item detail panel OR similar setups recommendation column (300px)
      */}
      <div
        className="flex flex-1 gap-4 p-4 lg:p-5 overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px 300px",
          alignItems: "start",
        }}
      >
        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl border" style={{ borderColor: "#E2E8F0" }}>
          {/* Setup image */}
          <SetupImageCanvas
            imageUrl={setup.image_url}
            items={items}
            hoveredItemId={hoveredItemId}
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

        {/* ── MIDDLE COLUMN — item list ────────────────────────── */}
        <div className="h-full overflow-hidden">
          <SetupItemList
            items={items}
            hoveredItemId={hoveredItemId}
            setHoveredItemId={setHoveredItemId}
            onOpenSidebar={handleOpenSidebar}
            onOpenModal={handleOpenModal}
          />
        </div>

        {/* ── RIGHT COLUMN — item detail panel OR similar setups ────────────────── */}
        <div className="h-full overflow-hidden">
          {isSidebarOpen && selectedItemForDetail ? (
            <ItemDetailsSidebar
              isOpen={isSidebarOpen}
              onClose={handleCloseSidebar}
              item={selectedItemForDetail}
            />
          ) : (
            <SimilarSetups currentSetupId={id} />
          )}
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
