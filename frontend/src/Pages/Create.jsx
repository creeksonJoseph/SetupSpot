import React from "react";
import { useCreateSetup } from "../hooks/useCreateSetup";
import { usePhoneUploadSocket } from "../hooks/usePhoneUploadSocket";
import {
  Upload,
  Save,
  ArrowLeft,
  Trash2,
  CreditCard as Edit3,
  Image,
  Loader as Loader2,
  Smartphone,
  QrCode,
  CheckCircle2,
  Tag,
  X,
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/* ── Initial Upload View: Side-by-Side Desktop File Picker & On-Demand Mobile QR Panel ── */
const UploadView = ({
  handleFileUpload,
  handleRemoteImageUrl,
  textPrimary,
  textSecondary,
  cardBg,
  isUploading,
  uploadProgress,
}) => {
  const {
    isQrActive,
    connected,
    statusText,
    receivedSuccess,
    mobileUploadUrl,
    startQrSession,
    stopQrSession,
  } = usePhoneUploadSocket(handleRemoteImageUrl);

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      {/* ── Left Panel: Desktop File Upload Dropzone ── */}
      <div className={`p-8 rounded-2xl shadow-sm border flex flex-col items-center justify-center text-center ${cardBg}`}>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shrink-0">
          <Upload size={24} />
        </div>
        <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>
          Upload from Computer
        </h2>
        <p className={`text-xs mb-6 max-w-xs ${textSecondary}`}>
          Drag and drop or select a high-quality desk setup image from your device.
        </p>

        <label
          htmlFor="file-upload"
          className="w-full flex-1 min-h-[220px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer p-6 hover:border-blue-400 hover:bg-blue-50/20"
          style={{
            borderColor: isUploading ? "#0050cb" : "#E2E8F0",
            backgroundColor: isUploading ? "rgba(0,80,203,0.04)" : "#f7f9fb",
            cursor: isUploading ? "wait" : "pointer",
          }}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4 select-none">
              <svg width="100" height="100" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#0066ff"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={
                    RING_CIRCUMFERENCE - (uploadProgress / 100) * RING_CIRCUMFERENCE
                  }
                  transform="rotate(-90 64 64)"
                  style={{ transition: "stroke-dashoffset 0.15s ease" }}
                />
                <text
                  x="64"
                  y="64"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="700"
                  fill="#0F172A"
                >
                  {uploadProgress}%
                </text>
              </svg>
              <p className={`text-xs font-medium ${textSecondary}`}>
                Reading image…
              </p>
            </div>
          ) : (
            <>
              <Image size={40} className="mb-2 text-slate-400" />
              <p className={`text-xs font-semibold ${textPrimary}`}>Click or Drag to Select File</p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
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

      {/* ── Right Panel: On-Demand Mobile QR Code Phone Upload ── */}
      <div className={`p-8 rounded-2xl shadow-sm border flex flex-col items-center justify-center text-center relative ${cardBg}`}>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shrink-0">
          <Smartphone size={24} />
        </div>
        <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>
          Upload via Phone Camera
        </h2>
        <p className={`text-xs mb-5 max-w-xs ${textSecondary}`}>
          Generate a secure live QR code to snap a photo from your phone camera directly to your screen.
        </p>

        {!isQrActive ? (
          <button
            onClick={startQrSession}
            className="px-6 py-3 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2.5 shadow-sm hover:bg-blue-700"
            style={{ backgroundColor: "#0066ff" }}
          >
            <QrCode size={18} />
            <span>Generate Phone QR Code</span>
          </button>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200 w-full">
            {/* Real-time QR Code Display */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-inner mb-3 flex items-center justify-center">
              {connected && mobileUploadUrl ? (
                <QRCodeSVG value={mobileUploadUrl} size={160} level="M" includeMargin={false} />
              ) : (
                <div className="w-[160px] h-[160px] flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                  <span className="text-[11px] font-medium">Generating QR code...</span>
                </div>
              )}
            </div>

            {/* Connection & status message */}
            {receivedSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs py-1">
                <CheckCircle2 size={16} />
                <span>{statusText}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-600 text-xs font-medium py-1">
                <Loader2 size={14} className="animate-spin text-blue-600" />
                <span>{connected ? statusText : "Generating QR code..."}</span>
              </div>
            )}

            {/* Cancel button placed at bottom right of card */}
            <button
              onClick={stopQrSession}
              className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm"
              style={{ backgroundColor: "#dc2626" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Annotation Item Form Component ───────────────────────────────────── */
const AnnotationForm = React.memo(
  ({ annotation, onRemove, onChange, annotations, textPrimary }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center pb-1">
        <h4 className={`text-sm font-bold ${textPrimary}`}>
          Edit Item #{annotations.findIndex((a) => a.id === annotation.id) + 1}
        </h4>
        <button
          onClick={() => onRemove(annotation.id)}
          className="p-1.5 rounded-lg transition-colors text-rose-600 hover:bg-rose-50"
          title="Remove Item"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <input
        type="text"
        name="name"
        value={annotation.name}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Product Name (e.g. Apple Studio Display)"
        className="w-full p-2.5 border rounded-lg text-xs outline-none transition-all"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
        onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
      <input
        type="text"
        name="price"
        value={annotation.price}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Price (e.g. $1,599)"
        className="w-full p-2.5 border rounded-lg text-xs outline-none transition-all"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
        onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
      <input
        type="url"
        name="link"
        value={annotation.link}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Merchant Link (e.g. https://apple.com/...)"
        className="w-full p-2.5 border rounded-lg text-xs outline-none transition-all"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
        onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
      <textarea
        name="description"
        value={annotation.description || ""}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Item description (optional)"
        rows={3}
        className="w-full p-2.5 border rounded-lg text-xs outline-none transition-all resize-none"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
        onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
    </div>
  )
);

/* ── Full Viewport 3-Column Annotation View (No Page Scroll) ───────────── */
const AnnotationView = ({
  cardBg,
  textPrimary,
  textSecondary,
  annotations,
  selectedAnnotationId,
  setSelectedAnnotationId,
  selectedAnnotation,
  uploadedImageSrc,
  handleImageClick,
  handleInputChange,
  handleRemoveAnnotation,
  setupName,
  setSetupName,
  totalCost,
  apiMessage,
  handleSaveData,
  loading,
}) => (
  <div
    className="w-full flex-1 gap-4 overflow-hidden"
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 280px 320px",
      maxHeight: "calc(100vh - 120px)",
    }}
  >
    {/* ── Column 1: Setup Title & Interactive Image Canvas ── */}
    <div className={`p-4 rounded-2xl shadow-sm border flex flex-col h-full overflow-hidden ${cardBg}`}>
      <div className="flex justify-between items-center pb-3 shrink-0">
        <input
          type="text"
          value={setupName}
          onChange={(e) => setSetupName(e.target.value)}
          placeholder="Setup Title (e.g. Minimalist Studio Desk Setup)"
          className="w-full p-2.5 border rounded-lg text-xs font-semibold outline-none transition-all"
          style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
          onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
          onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
        />
      </div>

      <div
        onClick={handleImageClick}
        className="w-full flex-1 rounded-xl relative overflow-hidden cursor-crosshair border flex items-center justify-center bg-slate-900/5"
        style={{ borderColor: "#E2E8F0" }}
      >
        {uploadedImageSrc ? (
          <img
            src={uploadedImageSrc}
            alt="Uploaded Setup"
            className="w-full h-full object-contain block"
          />
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <Image size={40} />
            <span className="text-xs mt-2">No image loaded</span>
          </div>
        )}

        {/* Hotspot Pins */}
        {annotations.map((ann) => (
          <div
            key={ann.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAnnotationId(ann.id);
            }}
            className={`absolute w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 transform ${
              ann.id === selectedAnnotationId
                ? "bg-red-500 border-white scale-125 ring-4 ring-red-300 z-10"
                : "bg-white border-[#E2E8F0] hover:bg-blue-50"
            }`}
            style={{
              left: `${ann.x}%`,
              top: `${ann.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            title={ann.name || "Click to edit"}
          >
            <span
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold pointer-events-none"
              style={{ color: ann.id === selectedAnnotationId ? "#ffffff" : "#0F172A" }}
            >
              {annotations.findIndex((a) => a.id === ann.id) + 1}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* ── Column 2: Tagged Items List ── */}
    <div className={`p-4 rounded-2xl shadow-sm border flex flex-col h-full overflow-hidden ${cardBg}`}>
      <div className="flex justify-between items-center pb-3 border-b shrink-0" style={{ borderColor: "#E2E8F0" }}>
        <h3 className={`text-xs font-bold ${textPrimary}`}>
          Tagged Items ({annotations.length})
        </h3>
        <Tag size={14} className="text-slate-400" />
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-2">
        {annotations.length === 0 ? (
          <p className={`text-xs text-center py-8 ${textSecondary}`}>
            Click anywhere on the image to place product hotspots.
          </p>
        ) : (
          annotations.map((ann, index) => (
            <div
              key={ann.id}
              onClick={() => setSelectedAnnotationId(ann.id)}
              className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors border ${
                ann.id === selectedAnnotationId
                  ? "bg-blue-50/60 border-blue-200"
                  : "border-slate-100 hover:bg-slate-50"
              }`}
            >
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full text-white text-[11px] font-bold shrink-0"
                style={{ backgroundColor: ann.id === selectedAnnotationId ? "#0066ff" : "#94A3B8" }}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${textPrimary}`}>
                  {ann.name || "Untitled Item"}
                </p>
                <p className="text-[11px] font-medium text-blue-600 mt-0.5">
                  {ann.price || "Set Price"}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAnnotation(ann.id);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>

    {/* ── Column 3: Item Form & Post Button ── */}
    <div className={`p-4 rounded-2xl shadow-sm border flex flex-col h-full overflow-hidden justify-between ${cardBg}`}>
      <div className="flex-1 overflow-y-auto min-h-0">
        {!selectedAnnotation ? (
          <div className="min-h-[160px] py-8 flex flex-col items-center justify-center p-4 text-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Edit3 size={28} className="text-slate-400 mb-2" />
            <p className={`text-xs ${textSecondary}`}>
              Click a hotspot pin on the image to edit product details.
            </p>
          </div>
        ) : (
          <AnnotationForm
            annotation={selectedAnnotation}
            onRemove={handleRemoveAnnotation}
            onChange={handleInputChange}
            annotations={annotations}
            textPrimary={textPrimary}
          />
        )}
      </div>

      <div className="pt-3 mt-3 border-t shrink-0 space-y-2.5" style={{ borderColor: "#E2E8F0" }}>
        {apiMessage.text && (
          <div
            className="p-2.5 rounded-lg text-xs font-medium border"
            style={
              apiMessage.type === "success"
                ? { backgroundColor: "rgba(21,128,61,0.08)", borderColor: "rgba(21,128,61,0.2)", color: "#15803D" }
                : { backgroundColor: "rgba(186,26,26,0.08)", borderColor: "rgba(186,26,26,0.2)", color: "#ba1a1a" }
            }
          >
            {apiMessage.text}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className={`text-xs font-semibold ${textPrimary}`}>
            Total Cost:
          </span>
          <span className={`text-base font-extrabold ${annotations.length > 0 ? "text-[#0066ff]" : textSecondary}`}>
            {totalCost}
          </span>
        </div>

        {/* Post Setup Action Button */}
        <button
          onClick={handleSaveData}
          disabled={annotations.length === 0 || !setupName.trim() || loading}
          className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0066ff" }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#0050cb";
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#0066ff";
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Setup...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Post Setup</span>
            </>
          )}
        </button>

        {/* Validation hint if form incomplete */}
        {(annotations.length === 0 || !setupName.trim()) && (
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-0.5">
            <AlertCircle size={12} />
            <span>
              {!setupName.trim() && annotations.length === 0
                ? "Enter title & tag at least 1 item to post"
                : !setupName.trim()
                ? "Enter a setup title above"
                : "Click image to tag at least 1 item"}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

/* ── Main Create Page Component ────────────────────────────────────────── */
const Create = () => {
  const {
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
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden font-sans">
      {/* Header bar */}
      <div className="flex justify-between items-center pb-4 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Create Setup</h1>
          <p className="text-xs text-slate-500">Share your desk setup and tag your gear.</p>
        </div>

        {isAnnotating && (
          <button
            onClick={resetState}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={14} /> Restart Upload
          </button>
        )}
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
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
          />
        )}
      </div>
    </div>
  );
};

export default Create;
