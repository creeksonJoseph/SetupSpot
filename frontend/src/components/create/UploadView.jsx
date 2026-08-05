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
  Camera,
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

  const isStale = isExpired || isReconnecting;

  const qrBorderColor = justReconnected
    ? "#10B981"
    : isExpired
    ? "#F59E0B"
    : "#E2E8F0";

  return (
    <div className="w-full max-w-6xl flex flex-col md:grid md:grid-cols-2 gap-6 items-stretch p-2 sm:p-4">
      {/* ── Left Panel: Primary File / Camera Upload ── */}
      <div className="p-2 md:p-8 md:rounded-3xl md:shadow-sm md:border flex flex-col items-start text-left bg-transparent md:bg-white w-full">
        <div className="hidden md:flex w-12 h-12 rounded-2xl bg-blue-50 text-[#0066ff] items-center justify-center mb-3 shrink-0">
          <Upload size={24} />
        </div>
        <h2 className={`hidden md:block text-xl sm:text-2xl font-black mb-1 ${textPrimary}`}>
          Upload Setup Image
        </h2>
        <p className={`text-xs sm:text-sm mb-6 max-w-sm ${textSecondary}`}>
          Take a photo or select a high-quality desk setup image from your device.
        </p>

        <label
          htmlFor="file-upload"
          className="w-full flex-1 min-h-[200px] sm:min-h-[240px] border-0 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer p-6 hover:bg-blue-50/20 active:scale-[0.99]"
          style={{
            borderColor: isUploading ? "#0066ff" : "#E2E8F0",
            backgroundColor: isUploading ? "rgba(0,102,255,0.04)" : "#f7f9fb",
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
              <p className={`text-xs font-semibold ${textSecondary}`}>Uploading image…</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <Camera size={32} className="text-[#0066ff]" />
                <Image size={32} className="text-slate-400" />
              </div>
              <span className="px-5 py-2.5 rounded-xl bg-[#0066ff] text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-colors mb-2">
                Choose Photo / Take Picture
              </span>
              <p className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 10MB</p>
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

      {/* ── Right Panel: Desktop-Only Live QR Phone Upload ── */}
      <div className={`hidden md:flex p-8 rounded-3xl shadow-sm border flex-col items-center justify-center text-center relative ${cardBg}`}>
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shrink-0">
          <Smartphone size={28} />
        </div>
        <h2 className={`text-2xl font-black mb-1 ${textPrimary}`}>
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
            className="px-6 py-3 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2.5 shadow-sm hover:bg-blue-700 cursor-pointer"
            style={{ backgroundColor: "#0066ff" }}
          >
            <QrCode size={18} />
            <span>Generate Phone QR Code</span>
          </button>

        ) : (
          /* ── QR active: code + state overlays ── */
          <div className="flex flex-col items-center w-full gap-2">
            {justReconnected && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 animate-in fade-in slide-in-from-top-1 duration-300">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <p className="text-[11px] font-semibold text-emerald-700">
                  Connection refreshed — scan this new code
                </p>
              </div>
            )}

            <div
              className="relative flex items-center justify-center p-3.5 bg-white rounded-xl shadow-inner transition-colors duration-300"
              style={{
                border: `2px solid ${qrBorderColor}`,
                transition: "border-color 0.4s ease",
              }}
            >
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

              {isStale && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[10px] bg-white/80 backdrop-blur-[2px]">
                  {isReconnecting ? (
                    <>
                      <Loader2 size={22} className="animate-spin text-blue-600" />
                      <p className="text-xs font-semibold text-slate-600">Reconnecting…</p>
                    </>
                  ) : isIdleTimeout ? (
                    <button
                      onClick={startQrSession}
                      className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <RefreshCw size={26} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-600">Generate New Code</span>
                    </button>
                  ) : (
                    <>
                      <AlertTriangle size={20} className="text-amber-500" />
                      <p className="text-[11px] font-semibold text-slate-600 text-center px-2 leading-tight">
                        Session expired
                      </p>
                      <button
                        onClick={startQrSession}
                        className="mt-1 px-3.5 py-1.5 rounded-lg text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                        style={{ backgroundColor: "#0066ff" }}
                      >
                        <QrCode size={12} />
                        Regenerate
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

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

            <button
              onClick={stopQrSession}
              className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm"
              style={{ backgroundColor: "#dc2626" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
