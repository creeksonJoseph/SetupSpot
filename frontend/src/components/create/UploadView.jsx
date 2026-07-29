import React from "react";
import { usePhoneUploadSocket } from "../../hooks/usePhoneUploadSocket";
import {
  Upload,
  Image,
  Loader as Loader2,
  Smartphone,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
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
    sessionId,
    connected,
    statusText,
    receivedSuccess,
    isExpired,
    isReconnecting,
    justReconnected,
    isIdleTimeout,
    mobileUploadUrl,
    startQrSession,
    stopQrSession,
  } = usePhoneUploadSocket(handleRemoteImageUrl);

  // Derived: QR box should be blurred & masked when stale or reconnecting
  const isStale = isExpired || isReconnecting;

  // QR container border colour signals state at a glance
  const qrBorderColor = justReconnected
    ? "#10B981"   // emerald — fresh code ready
    : isExpired
    ? "#F59E0B"   // amber — expired
    : "#E2E8F0";  // slate — normal

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
                <circle cx="64" cy="64" r={RING_RADIUS} fill="none" stroke="#E2E8F0" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r={RING_RADIUS}
                  fill="none" stroke="#0066ff" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE - (uploadProgress / 100) * RING_CIRCUMFERENCE}
                  transform="rotate(-90 64 64)"
                  style={{ transition: "stroke-dashoffset 0.15s ease" }}
                />
                <text x="64" y="64" dominantBaseline="middle" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0F172A">
                  {uploadProgress}%
                </text>
              </svg>
              <p className={`text-xs font-medium ${textSecondary}`}>Uploading image…</p>
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

        {isPhoneLoading || receivedSuccess ? (
          /* ── Phone image loading progress ring ── */
          <div className="flex flex-col items-center gap-4 select-none my-2">
            <svg width="100" height="100" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={RING_RADIUS} fill="none" stroke="#E2E8F0" strokeWidth="10" />
              <circle
                cx="64" cy="64" r={RING_RADIUS}
                fill="none" stroke="#10B981" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE - (phoneProgress / 100) * RING_CIRCUMFERENCE}
                transform="rotate(-90 64 64)"
                style={{ transition: "stroke-dashoffset 0.15s ease" }}
              />
              <text x="64" y="64" dominantBaseline="middle" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0F172A">
                {phoneProgress}%
              </text>
            </svg>
            <p className="text-xs font-semibold text-emerald-600 animate-pulse">Reading image…</p>
          </div>

        ) : !isQrActive ? (
          /* ── Initial state: Generate button ── */
          <button
            onClick={startQrSession}
            className="px-6 py-3 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2.5 shadow-sm hover:bg-blue-700"
            style={{ backgroundColor: "#0066ff" }}
          >
            <QrCode size={18} />
            <span>Generate Phone QR Code</span>
          </button>

        ) : (
          /* ── QR active: code + state overlays ── */
          <div className="flex flex-col items-center w-full gap-2">

            {/* "Connection refreshed" badge — appears above QR, fades out after 6s */}
            {justReconnected && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 animate-in fade-in slide-in-from-top-1 duration-300">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <p className="text-[11px] font-semibold text-emerald-700">
                  Connection refreshed — scan this new code
                </p>
              </div>
            )}

            {/* QR code box — blurred & masked when stale */}
            <div
              className="relative flex items-center justify-center p-3.5 bg-white rounded-xl shadow-inner transition-colors duration-300"
              style={{
                border: `2px solid ${qrBorderColor}`,
                transition: "border-color 0.4s ease",
              }}
            >
              {/* The QR code itself (or the "generating" spinner) */}
              <div
                className="transition-all duration-300"
                style={{
                  filter: isStale ? "blur(6px)" : "none",
                  opacity: isStale ? 0.25 : 1,
                  pointerEvents: isStale ? "none" : "auto",
                  userSelect: isStale ? "none" : "auto",
                }}
              >
                {connected && mobileUploadUrl ? (
                  /*
                   * key={sessionId} makes React remount QRCodeSVG on every new
                   * session, triggering the zoom-in entrance animation automatically.
                   */
                  <QRCodeSVG
                    key={sessionId}
                    value={mobileUploadUrl}
                    size={160}
                    level="M"
                    includeMargin={false}
                    className="animate-in zoom-in duration-300"
                  />
                ) : (
                  <div className="w-[160px] h-[160px] flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="text-[11px] font-medium">Generating QR code...</span>
                  </div>
                )}
              </div>

              {/* ── Overlay — only rendered when stale ── */}
              {isStale && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[10px] bg-white/80 backdrop-blur-[2px]">
                  {isReconnecting ? (
                    /* Reconnecting spinner */
                    <>
                      <Loader2 size={22} className="animate-spin text-blue-600" />
                      <p className="text-xs font-semibold text-slate-600">Reconnecting…</p>
                    </>
                  ) : isIdleTimeout ? (
                    /* Idle for 60 s — require deliberate user action */
                    <button
                      onClick={startQrSession}
                      className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <RefreshCw size={26} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-600">Generate New Code</span>
                    </button>
                  ) : (
                    /* Expired but not idle yet — quick regenerate */
                    <>
                      <AlertTriangle size={20} className="text-amber-500" />
                      <p className="text-[11px] font-semibold text-slate-600 text-center px-2 leading-tight">
                        Session expired
                      </p>
                      <button
                        onClick={startQrSession}
                        className="mt-1 px-3.5 py-1.5 rounded-lg text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                        style={{ backgroundColor: "#0066ff" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
                      >
                        <QrCode size={12} />
                        Regenerate
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Status line below QR box */}
            {receivedSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs py-0.5">
                <CheckCircle2 size={14} />
                <span>{statusText}</span>
              </div>
            ) : !isExpired && (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium py-0.5">
                <Loader2 size={13} className="animate-spin text-blue-500" />
                <span>
                  {isReconnecting
                    ? "Reconnecting to server…"
                    : connected
                    ? statusText
                    : "Generating QR code…"}
                </span>
              </div>
            )}

            {/* Cancel button — bottom-right corner of the card */}
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
