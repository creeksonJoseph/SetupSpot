import React from "react";
import { usePhoneUploadSocket } from "../../hooks/usePhoneUploadSocket";
import {
  Upload,
  Image,
  Loader as Loader2,
  Smartphone,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const UploadView = ({
  handleFileUpload,
  handleRemoteImageUrl,
  textPrimary,
  textSecondary,
  cardBg,
  isUploading,
  uploadProgress,
  isPhoneLoading,
  phoneProgress,
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

        {isPhoneLoading ? (
          <div className="flex flex-col items-center gap-4 select-none my-2">
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
                stroke="#10B981"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={
                  RING_CIRCUMFERENCE - (phoneProgress / 100) * RING_CIRCUMFERENCE
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
                {phoneProgress}%
              </text>
            </svg>
            <p className="text-xs font-semibold text-emerald-600 animate-pulse">
              Reading image…
            </p>
          </div>
        ) : !isQrActive ? (
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
