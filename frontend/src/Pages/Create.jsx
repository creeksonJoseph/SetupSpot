import React, { useState, useEffect } from "react";
import { useCreateSetup } from "../hooks/useCreateSetup";
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
  X,
  CheckCircle2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { API } from "../hooks/api";

import { usePhoneUploadSocket } from "../hooks/usePhoneUploadSocket";

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/* ── Phone Upload QR Code Modal ────────────────────────────────────────── */
const PhoneUploadModal = ({ isOpen, onClose, onImageReceived }) => {
  const {
    sessionId,
    connected,
    statusText,
    receivedSuccess,
    mobileUploadUrl,
  } = usePhoneUploadSocket(isOpen, onImageReceived, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl relative flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Smartphone size={24} />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">Upload via Phone Camera</h3>
        <p className="text-xs text-slate-500 mb-5">
          Scan this QR code with your phone camera to snap or select a setup photo.
        </p>

        {/* QR Code Container */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-inner mb-4 flex items-center justify-center">
          {sessionId ? (
            <QRCodeSVG value={mobileUploadUrl} size={180} level="M" includeMargin={false} />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-blue-600" />
            </div>
          )}
        </div>

        {/* Connection & Upload Status */}
        {receivedSuccess ? (
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs py-1">
            <CheckCircle2 size={16} />
            <span>{statusText}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-600 text-xs font-medium py-1">
            <Loader2 size={14} className="animate-spin text-blue-600" />
            <span>{connected ? statusText : "Connecting to socket..."}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Annotation Hotspot Form Item ─────────────────────────────────────── */
const AnnotationForm = React.memo(
  ({ annotation, onRemove, onChange, annotations, textPrimary, darkMode }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className={`text-lg font-medium ${textPrimary}`}>
          Editing Item{" "}
          {annotations.findIndex((a) => a.id === annotation.id) + 1}
        </h4>
        <button
          onClick={() => onRemove(annotation.id)}
          className={`p-2 rounded-full transition-colors text-[#ba1a1a] hover:bg-[rgba(186,26,26,0.08)]`}
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
        className="w-full p-3 border rounded-lg text-sm outline-none transition-all"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          color: "#0F172A",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#0050cb";
          e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E2E8F0";
          e.target.style.boxShadow = "none";
        }}
      />
      <input
        type="text"
        name="price"
        value={annotation.price}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Price (Matches Item.price, e.g., $1,599)"
        className="w-full p-3 border rounded-lg text-sm outline-none transition-all"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          color: "#0F172A",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#0050cb";
          e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E2E8F0";
          e.target.style.boxShadow = "none";
        }}
      />
      <input
        type="url"
        name="link"
        value={annotation.link}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Merchant Link (Matches Item.link)"
        className="w-full p-3 border rounded-lg text-sm outline-none transition-all"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          color: "#0F172A",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#0050cb";
          e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E2E8F0";
          e.target.style.boxShadow = "none";
        }}
      />
      <textarea
        name="description"
        value={annotation.description || ""}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Item description (optional)"
        rows={4}
        className="w-full p-3 border rounded-lg text-sm outline-none transition-all resize-none"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          color: "#0F172A",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#0050cb";
          e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E2E8F0";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  )
);

/* ── Initial File & QR Upload Options View ─────────────────────────────── */
const UploadView = ({
  handleFileUpload,
  onOpenPhoneModal,
  textPrimary,
  textSecondary,
  darkMode,
  cardBg,
  isUploading,
  uploadProgress,
}) => (
  <div
    className={`p-8 rounded-2xl shadow-xl ${cardBg} w-full max-w-2xl text-center`}
  >
    <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>
      Upload Setup Photo
    </h2>
    <p className={`mb-8 ${textSecondary}`}>
      To start annotating, please upload a high-quality image of your desk setup.
    </p>

    <label
      htmlFor="file-upload"
      className="w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer"
      style={{
        borderColor: isUploading ? "#0050cb" : "#E2E8F0",
        backgroundColor: isUploading ? "rgba(0,80,203,0.04)" : "#f7f9fb",
        cursor: isUploading ? "wait" : "pointer",
      }}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-4 select-none">
          <svg width="128" height="128" viewBox="0 0 128 128">
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
              fontSize="22"
              fontWeight="700"
              fill="#0F172A"
            >
              {uploadProgress}%
            </text>
          </svg>
          <p className={`text-sm font-medium ${textSecondary}`}>
            Reading image…
          </p>
        </div>
      ) : (
        <>
          <Upload size={48} className="mb-2" style={{ color: "#727687" }} />
          <p className={`font-medium ${textPrimary}`}>Click to Upload Image</p>
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

    {/* Divider & Phone QR Option */}
    <div className="my-6 flex items-center justify-center gap-3">
      <div className="h-[1px] bg-slate-200 flex-1" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OR</span>
      <div className="h-[1px] bg-slate-200 flex-1" />
    </div>

    <button
      onClick={onOpenPhoneModal}
      className="w-full py-3 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm hover:bg-blue-50 hover:border-blue-200"
      style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0066ff" }}
    >
      <Smartphone size={18} />
      <span>Scan QR Code to Upload from Phone</span>
      <QrCode size={16} className="ml-auto opacity-70" />
    </button>
  </div>
);

/* ── Setup Annotation View ───────────────────────────────────────────── */
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
  handleInputChange,
  handleRemoveAnnotation,
  setupName,
  setSetupName,
  totalCost,
  apiMessage,
  handleSaveData,
  loading,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl">
    {/* Left column: image (fits top-to-bottom) + items list below */}
    <div className="flex flex-col gap-6">
      <div className={`p-6 rounded-2xl shadow-xl ${cardBg}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${textPrimary}`}>
            Setup Details & Annotations
          </h2>
          <span className={`text-sm font-medium ${textSecondary}`}>
            {annotations.length} Items Tagged
          </span>
        </div>

        <input
          type="text"
          value={setupName}
          onChange={(e) => setSetupName(e.target.value)}
          placeholder="Tell everyone about your setup :)"
          className="w-full p-3 mb-4 border rounded-lg text-sm outline-none transition-all"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #E2E8F0",
            color: "#0F172A",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#0050cb";
            e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#E2E8F0";
            e.target.style.boxShadow = "none";
          }}
        />

        <div
          onClick={handleImageClick}
          className="w-full rounded-xl relative overflow-hidden cursor-crosshair border"
          style={{ backgroundColor: "#f7f9fb", borderColor: "#E2E8F0", maxHeight: "calc(100vh - 320px)" }}
        >
          {uploadedImageSrc ? (
            <img
              src={uploadedImageSrc}
              alt="Uploaded Setup"
              className="w-full h-auto max-h-[calc(100vh-320px)] object-contain block"
            />
          ) : (
            <div
              className="w-full aspect-[16/9] flex items-center justify-center"
              style={{ backgroundColor: "#E2E8F0" }}
            >
              <Image size={48} style={{ color: "#727687" }} />
            </div>
          )}

          {annotations.map((ann) => (
            <div
              key={ann.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAnnotationId(ann.id);
              }}
              className={`absolute w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 transform ${ann.id === selectedAnnotationId
                ? "bg-red-500 border-white scale-125 ring-4 ring-red-300"
                : "bg-white border-[#E2E8F0] hover:bg-[rgba(0,102,255,0.1)]"
                }`}
              style={{
                left: `${ann.x}%`,
                top: `${ann.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              title={ann.name || "Click to edit"}
            >
              <span
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none"
                style={{ color: "#0F172A" }}
              >
                {annotations.findIndex((a) => a.id === ann.id) + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Items list below the image */}
      <div className={`p-6 rounded-2xl shadow-xl ${cardBg}`}>
        <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>
          Tagged Items
        </h3>
        {annotations.length === 0 ? (
          <p className={`text-sm ${textSecondary}`}>
            Click the image above to add items.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {annotations.map((ann, index) => (
              <li
                key={ann.id}
                onClick={() => setSelectedAnnotationId(ann.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${ann.id === selectedAnnotationId
                  ? "bg-[rgba(0,102,255,0.08)]"
                  : "hover:bg-[#f7f9fb]"
                  }`}
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: "#0066ff" }}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${textPrimary}`}>
                    {ann.name || "Untitled item"}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>
                    {ann.price || "—"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAnnotation(ann.id);
                  }}
                  className="p-1.5 rounded-full transition-colors"
                  style={{ color: "#ba1a1a" }}
                  onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(186,26,26,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {/* Right column: annotation form */}
    <div
      className={`p-6 rounded-2xl shadow-xl ${cardBg} flex flex-col lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto`}
    >
      <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>Item Details</h3>

      {!selectedAnnotation ? (
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed"
          style={{ borderColor: "#E2E8F0", backgroundColor: "#f7f9fb" }}
        >
          <Edit3 size={32} className={textSecondary} />
          <p className={`mt-3 text-center ${textSecondary}`}>
            Click a hotspot on the image (or click the image to create a new
            one) to edit its details here.
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

      <div className="mt-6 pt-6 border-t" style={{ borderColor: "#E2E8F0" }}>
        {apiMessage.text && (
          <div
            className="p-3 mb-4 rounded-lg text-sm font-medium border"
            style={
              apiMessage.type === "success"
                ? {
                  backgroundColor: "rgba(21,128,61,0.08)",
                  borderColor: "rgba(21,128,61,0.2)",
                  color: "#15803D",
                }
                : {
                  backgroundColor: "rgba(186,26,26,0.08)",
                  borderColor: "rgba(186,26,26,0.2)",
                  color: "#ba1a1a",
                }
            }
          >
            {apiMessage.text}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <span className={`text-lg font-medium ${textPrimary}`}>
            Total Estimated Cost:
          </span>
          <span
            className={`text-2xl font-extrabold ${annotations.length > 0 ? "text-[#0066ff]" : textSecondary}`}
          >
            {totalCost}
          </span>
        </div>
        <button
          onClick={handleSaveData}
          disabled={annotations.length === 0 || !setupName || loading}
          className="w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0066ff", color: "#f8f7ff" }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled)
              e.currentTarget.style.backgroundColor = "#0050cb";
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled)
              e.currentTarget.style.backgroundColor = "#0066ff";
          }}
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
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

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
    handleRemoteImageUrl,
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
            className="px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: "#E2E8F0", color: "#475569" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#cbd5e1")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#E2E8F0")
            }
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
            onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            darkMode={darkMode}
            cardBg={cardBg}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}
      </div>

      {/* QR Code Phone Upload Modal */}
      <PhoneUploadModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onImageReceived={handleRemoteImageUrl}
      />
    </div>
  );
};

export default Create;
