import React from "react";
import { useCreateSetup } from "../hooks/useCreateSetup";
import {
  Upload,
  Save,
  ArrowLeft,
  Trash2,
  Edit3,
  Image,
  Loader2,
} from "lucide-react";

const AnnotationForm = React.memo(({
  annotation,
  onRemove,
  onChange,
  annotations,
  textPrimary,
  darkMode,
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h4 className={`text-lg font-medium ${textPrimary}`}>
        Editing Item {annotations.findIndex((a) => a.id === annotation.id) + 1}
      </h4>
      <button
        onClick={() => onRemove(annotation.id)}
        className={`p-2 rounded-full text-red-400 transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
        title="Remove Hotspot"
      >
        <Trash2 size={20} />
      </button>
    </div>

    <input
      type="text"
      name="name"
      value={annotation.name}
      onChange={(e) => onChange(annotation.id, e)}
      placeholder="Product Name (Matches Item.name)"
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
      }`}
    />
    <input
      type="text"
      name="price"
      value={annotation.price}
      onChange={(e) => onChange(annotation.id, e)}
      placeholder="Price (Matches Item.price, e.g., $1,599)"
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
      }`}
    />
    <input
      type="url"
      name="link"
      value={annotation.link}
      onChange={(e) => onChange(annotation.id, e)}
      placeholder="Product Link (Matches Item.link)"
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
      }`}
    />
  </div>
));

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const UploadView = ({ handleFileUpload, textPrimary, textSecondary, darkMode, cardBg, isUploading, uploadProgress }) => (
  <div className={`p-8 rounded-2xl shadow-xl ${cardBg} w-full max-w-2xl text-center`}>
    <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Upload Setup Photo</h2>
    <p className={`mb-8 ${textSecondary}`}>
      To start annotating, please upload a high-quality landscape or portrait image of your desk.
    </p>
    <label
      htmlFor="file-upload"
      className={`w-full aspect-video border-4 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
        isUploading
          ? darkMode ? "border-red-500 bg-gray-700/80 cursor-wait" : "border-indigo-500 bg-gray-200 cursor-wait"
          : darkMode
            ? "border-gray-600 hover:border-red-400 bg-gray-700/50 cursor-pointer"
            : "border-gray-300 hover:border-indigo-600 bg-gray-100 cursor-pointer"
      }`}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-4 select-none">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle
              cx="64" cy="64" r={RING_RADIUS}
              fill="none"
              stroke={darkMode ? "#374151" : "#e5e7eb"}
              strokeWidth="10"
            />
            <circle
              cx="64" cy="64" r={RING_RADIUS}
              fill="none"
              stroke="#ef4444"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE - (uploadProgress / 100) * RING_CIRCUMFERENCE}
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 0.15s ease" }}
            />
            <text
              x="64" y="64"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="22"
              fontWeight="700"
              fill={darkMode ? "#f9fafb" : "#111827"}
            >
              {uploadProgress}%
            </text>
          </svg>
          <p className={`text-sm font-medium ${textSecondary}`}>Reading image…</p>
        </div>
      ) : (
        <>
          <Upload size={48} className={`mb-2 ${textSecondary}`} />
          <p className={`font-medium ${textPrimary}`}>Click to Upload Image</p>
          <p className={`text-sm ${textSecondary}`}>16:9 Landscape recommended</p>
        </>
      )}
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isUploading}
      />
    </label>
  </div>
);

const AnnotationView = ({
  cardBg,
  textPrimary,
  textSecondary,
  darkMode,
  annotations,
  selectedAnnotationId,
  setSelectedAnnotationId,
  selectedAnnotation,
  uploadedImageSrc,
  handleImageClick,
  handleRemoveAnnotation,
  handleInputChange,
  setupName,
  setSetupName,
  totalCost,
  apiMessage,
  handleSaveData,
  loading,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
    <div className={`lg:col-span-2 p-6 rounded-2xl shadow-xl ${cardBg}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${textPrimary}`}>Setup Details & Annotations</h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${textSecondary}`}>
            {annotations.length} Items Tagged
          </span>
        </div>
      </div>

      <input
        type="text"
        value={setupName}
        onChange={(e) => setSetupName(e.target.value)}
        placeholder="Give your setup a name (e.g., Minimal Developer Setup)"
        className={`w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors ${
          darkMode
            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
        }`}
      />

      <div
        onClick={handleImageClick}
        className="w-full aspect-[16/9] rounded-xl relative shadow-2xl overflow-hidden cursor-crosshair bg-gray-900"
      >
        {uploadedImageSrc ? (
          <img src={uploadedImageSrc} alt="Uploaded Setup" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <Image size={48} className="text-gray-500" />
          </div>
        )}

        {annotations.map((ann) => (
          <div
            key={ann.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAnnotationId(ann.id);
            }}
            className={`absolute w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 transform ${
              ann.id === selectedAnnotationId
                ? "bg-red-500 border-white scale-125 ring-4 ring-red-300"
                : "bg-white/80 border-gray-900/50 hover:bg-red-400/80"
            }`}
            style={{
              left: `${ann.x}%`,
              top: `${ann.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            title={ann.name || "Click to edit"}
          >
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-900 pointer-events-none">
              {annotations.findIndex((a) => a.id === ann.id) + 1}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className={`lg:col-span-1 p-6 rounded-2xl shadow-xl ${cardBg} flex flex-col`}>
      <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>Item Details</h3>

      {!selectedAnnotation ? (
        <div
          className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-dashed border-2 ${
            darkMode ? "border-gray-700 bg-gray-700/30" : "border-gray-200 bg-gray-50"
          }`}
        >
          <Edit3 size={32} className={textSecondary} />
          <p className={`mt-3 text-center ${textSecondary}`}>
            Click a hotspot on the image (or click the image to create a new one) to edit its details here.
          </p>
        </div>
      ) : (
        <AnnotationForm
          annotation={selectedAnnotation}
          onRemove={handleRemoveAnnotation}
          onChange={handleInputChange}
          annotations={annotations}
          textPrimary={textPrimary}
          darkMode={darkMode}
        />
      )}

      <div className={`mt-6 pt-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        {apiMessage.text && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm font-medium ${
              apiMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {apiMessage.text}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <span className={`text-lg font-medium ${textPrimary}`}>Total Estimated Cost:</span>
          <span className={`text-2xl font-extrabold ${annotations.length > 0 ? "text-red-400" : textSecondary}`}>
            {totalCost}
          </span>
        </div>
        <button
          onClick={handleSaveData}
          disabled={annotations.length === 0 || !setupName || loading}
          className={`w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
            annotations.length > 0 && setupName && !loading
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Post Setup
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

const Create = () => {
  const {
    darkMode,
    isAnnotating,
    loading,
    apiMessage,
    isUploading,
    uploadProgress,
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
    bgColor,
    cardBg,
    handleFileUpload,
    handleImageClick,
    handleInputChange,
    handleRemoveAnnotation,
    handleSaveData,
    resetState,
  } = useCreateSetup();

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-8 transition-colors ${bgColor}`}
    >
      <div className="flex justify-end items-center w-full max-w-7xl mb-8">
        {isAnnotating && (
          <button
            onClick={resetState}
            className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
              darkMode
                ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <ArrowLeft size={20} /> Restart Upload
          </button>
        )}
      </div>

      <div className="w-full flex justify-center">
        {isAnnotating ? (
          <AnnotationView
            cardBg={cardBg}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            darkMode={darkMode}
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
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            darkMode={darkMode}
            cardBg={cardBg}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}
      </div>
    </div>
  );
};

export default Create;
