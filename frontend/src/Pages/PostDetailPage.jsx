import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { Loader2 } from "lucide-react";
import SetupImageCanvas from "../components/SetupImageCanvas";
import SetupItemList from "../components/SetupItemList";
import ItemDetailsSidebar from "../components/ItemDetailsSidebar";
import AddToCollectionModal from "../components/AddToCollectionModal";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    toggleFavorite,
  } = usePostDetail(id);

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
        <button onClick={() => navigate("/explore")} className="text-sm hover:underline" style={{ color: "#0066ff" }}>
          Go Back
        </button>
      </div>
    );
  }

  const items = setup.items || [];

  return (
    <div className="flex flex-col h-screen -m-8" style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
      {/* Body */}
      <div className="flex flex-1 flex-col lg:flex-row gap-6 p-4 lg:p-6 relative overflow-hidden">
        <SetupImageCanvas
          imageUrl={setup.image_url}
          items={items}
          hoveredItemId={hoveredItemId}
          setHoveredItemId={setHoveredItemId}
        />

        <SetupItemList
          items={items}
          hoveredItemId={hoveredItemId}
          setHoveredItemId={setHoveredItemId}
          onOpenSidebar={handleOpenSidebar}
          onOpenModal={handleOpenModal}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      <AddToCollectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItemForCollection}
      />

      <ItemDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        item={selectedItemForDetail}
        hoveredItemId={hoveredItemId}
      />
    </div>
  );
};

export default PostDetailPage;
