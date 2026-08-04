import React from "react";
import { useCreateSetup } from "../hooks/useCreateSetup";
import { UploadView } from "../components/create/UploadView";
import { AnnotationView } from "../components/create/AnnotationView";
import { ArrowLeft } from "lucide-react";

const Create = () => {
  const {
    isAnnotating,
    loading,
    apiMessage,
    isUploading,
    uploadProgress,
    isPhoneLoading,
    phoneProgress,
    uploadedImageSrc,
    setupName,
    setSetupName,
    annotations,
    selectedAnnotationId,
    setSelectedAnnotationId,
    selectedAnnotation,
    totalCost,
    textPrimary,
    textSecondary,
    cardBg,
    handleFileUpload,
    handleRemoteImageUrl,
    handleImageClick,
    handleInputChange,
    handleRemoveAnnotation,
    handleSaveData,
    resetState,
  } = useCreateSetup();

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto font-sans">
      {/* Header bar */}
      <div className="flex justify-between items-center pb-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Create Setup</h1>
          <p className="text-xs sm:text-sm text-slate-500">Share your desk setup and tag your gear.</p>
        </div>

        {isAnnotating && (
          <button
            onClick={resetState}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={15} /> Restart Upload
          </button>
        )}
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 w-full">
        {isAnnotating ? (
          <AnnotationView
            cardBg={cardBg}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            annotations={annotations}
            selectedAnnotationId={selectedAnnotationId}
            setSelectedAnnotationId={setSelectedAnnotationId}
            selectedAnnotation={selectedAnnotation}
            uploadedImageSrc={uploadedImageSrc}
            handleImageClick={handleImageClick}
            handleRemoveAnnotation={handleRemoveAnnotation}
            handleInputChange={handleInputChange}
            setupName={setupName}
            setSetupName={setSetupName}
            totalCost={totalCost}
            apiMessage={apiMessage}
            handleSaveData={handleSaveData}
            loading={loading}
          />
        ) : (
          <UploadView
            handleFileUpload={handleFileUpload}
            handleRemoteImageUrl={handleRemoteImageUrl}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            cardBg={cardBg}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            isPhoneLoading={isPhoneLoading}
            phoneProgress={phoneProgress}
          />
        )}
      </div>
    </div>
  );
};

export default Create;
