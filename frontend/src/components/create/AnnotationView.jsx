import React from "react";
import { AnnotationForm } from "./AnnotationForm";
import {
  Save,
  Trash2,
  CreditCard as Edit3,
  Image,
  Loader as Loader2,
  Tag,
  AlertCircle,
} from "lucide-react";

export const AnnotationView = ({
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
  <div className="w-full flex-1 flex flex-col md:grid md:grid-cols-[1fr_280px_320px] gap-4 md:h-[calc(100vh-120px)] overflow-y-auto md:overflow-hidden pb-16 md:pb-0">
    {/* ── Column 1: Setup Title & Interactive Image Canvas ── */}
    <div
      className={`p-4 rounded-2xl shadow-sm border flex flex-col h-auto md:h-full overflow-hidden ${cardBg}`}
    >
      <div className="flex justify-between items-center pb-3 shrink-0">
        <input
          type="text"
          value={setupName}
          onChange={(e) => setSetupName(e.target.value)}
          placeholder="Tell the world about your setup (e.g. Minimalist Studio Desk Setup)"
          className="w-full p-3 border rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#E2E8F0",
            color: "#0F172A",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
          onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
        />
      </div>

      {/* Image canvas + pins */}
      <div
        className="w-full min-h-[300px] md:min-h-0 flex-1 overflow-auto flex items-center justify-center cursor-crosshair border rounded-xl bg-slate-900/5 p-1"
        style={{ borderColor: "#E2E8F0" }}
      >
        {uploadedImageSrc ? (
          <div
            className="relative inline-block max-w-full"
            onClick={handleImageClick}
          >
            <img
              src={uploadedImageSrc}
              alt="Uploaded Setup"
              className="block max-w-full rounded-lg object-contain"
              style={{ maxHeight: "calc(100vh - 260px)" }}
              draggable={false}
            />
            {/* Hotspot Pins */}
            {annotations.map((ann) => (
              <div
                key={ann.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnnotationId(ann.id);
                }}
                className={`absolute w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200 transform ${
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
                  style={{
                    color: ann.id === selectedAnnotationId ? "#ffffff" : "#0F172A",
                  }}
                >
                  {annotations.findIndex((a) => a.id === ann.id) + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-400 py-12">
            <Image size={40} />
            <span className="text-xs mt-2">No image loaded</span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-[#727687] text-center mt-2 font-medium">
        Tap or click anywhere on the photo to add gear pins
      </p>
    </div>

    {/* ── Column 2: Tagged Items List ── */}
    <div
      className={`p-4 rounded-2xl shadow-sm border flex flex-col h-auto md:h-full overflow-hidden ${cardBg}`}
    >
      <div
        className="flex justify-between items-center pb-3 border-b shrink-0"
        style={{ borderColor: "#E2E8F0" }}
      >
        <h3 className={`text-xs sm:text-sm font-black ${textPrimary}`}>
          Tagged Items ({annotations.length})
        </h3>
        <Tag size={16} className="text-[#0066ff]" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col mt-2">
        <div className="max-h-60 md:max-h-none overflow-y-auto space-y-2 pr-1">
          {annotations.length === 0 ? (
            <p className={`text-xs text-center py-6 ${textSecondary}`}>
              Tap anywhere on your setup photo to tag items.
            </p>
          ) : (
            annotations.map((ann, index) => (
              <div
                key={ann.id}
                onClick={() => setSelectedAnnotationId(ann.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                  ann.id === selectedAnnotationId
                    ? "bg-blue-50/80 border-[#0066ff]/40 shadow-xs"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-black shrink-0"
                  style={{
                    backgroundColor:
                      ann.id === selectedAnnotationId ? "#0066ff" : "#94A3B8",
                  }}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${textPrimary}`}>
                    {ann.name || "Untitled Item"}
                  </p>
                  <p className="text-[11px] font-semibold text-[#0066ff] mt-0.5">
                    {ann.price || "Set Price"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAnnotation(ann.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* ── Column 3: Item Form & Save Action ── */}
    <div
      className={`p-4 rounded-2xl shadow-sm border flex flex-col h-auto md:h-full overflow-hidden justify-between ${cardBg}`}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        {!selectedAnnotation ? (
          <div className="min-h-32 py-6 flex flex-col items-center justify-center p-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Edit3 size={24} className="text-slate-400 mb-2" />
            <p className={`text-xs ${textSecondary}`}>
              Select a pin on the photo to edit name, link, and price details.
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

      <div
        className="pt-3 mt-3 border-t shrink-0 space-y-2.5"
        style={{ borderColor: "#E2E8F0" }}
      >
        {apiMessage.text && (
          <div
            className="p-3 rounded-xl text-xs font-medium border"
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

        <div className="flex justify-between items-center px-1">
          <span className={`text-xs font-bold ${textPrimary}`}>
            Total Gear Cost:
          </span>
          <span
            className={`text-lg font-black ${annotations.length > 0 ? "text-[#0066ff]" : textSecondary}`}
          >
            {totalCost}
          </span>
        </div>

        {/* Post Setup Action Button */}
        <button
          onClick={handleSaveData}
          disabled={annotations.length === 0 || !setupName.trim() || loading}
          className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ backgroundColor: "#0066ff" }}
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
              <Loader2 size={18} className="animate-spin" />
              <span>Saving Setup...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Post Setup</span>
            </>
          )}
        </button>

        {/* Validation hint if form incomplete */}
        {(annotations.length === 0 || !setupName.trim()) && (
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-0.5">
            <AlertCircle size={13} />
            <span>
              {!setupName.trim() && annotations.length === 0
                ? "Enter title & tag at least 1 item to post"
                : !setupName.trim()
                  ? "Enter a setup title above"
                  : "Tap photo to tag at least 1 item"}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);
