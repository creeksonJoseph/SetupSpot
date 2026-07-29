import React from "react";
import { Camera, CheckCircle2, Upload, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { useMobileUpload } from "../hooks/useMobileUpload";

export default function MobileUploadPage() {
  const {
    sessionId,
    selectedFile,
    previewUrl,
    uploading,
    success,
    error,
    handleFileChange,
    handleUpload,
    resetSelection,
  } = useMobileUpload();

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center font-sans">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-lg font-bold text-slate-900 mb-2">Invalid Session</h1>
          <p className="text-xs text-slate-500">
            No active upload session found. Please scan a fresh QR code from your desktop screen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
        {/* Header Logo */}
        <div className="flex items-center gap-2 mb-6">
          <img src="/favicon_io/android-chrome-192x192.png" alt="SetupSpot" className="w-9 h-9 rounded-lg object-contain" />
          <span className="font-bold text-slate-900 text-lg tracking-tight">SetupSpot</span>
        </div>

        {success ? (
          <div className="py-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Image Sent!</h2>
            <p className="text-xs text-slate-500 max-w-[240px]">
              Your image was successfully sent to the desktop. You can now close this page.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-base font-bold text-slate-900 mb-1">Upload Setup Photo</h1>
            <p className="text-xs text-slate-500 mb-6">
              Select a photo from your gallery or snap a new picture to send directly to your desktop.
            </p>

            {error && (() => {
              // Detect session-expired errors (covers both the post-upload close
              // and the genuine TTL expiry) so we can show a more helpful message.
              const isSessionExpired =
                error.toLowerCase().includes("session") ||
                error.toLowerCase().includes("expired") ||
                error.toLowerCase().includes("closed");

              if (isSessionExpired) {
                return (
                  <div className="w-full mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-900 mb-0.5">
                          This QR code has expired
                        </p>
                        <p className="text-[11px] text-blue-700 leading-relaxed">
                          Look at your desktop screen — a new QR code may have been generated.
                          Close this page and scan the new code.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{success ? "QR session closed — your image was already sent to the desktop." : error}</span>
                </div>
              );
            })()}

            <form onSubmit={handleUpload} className="w-full flex flex-col items-center gap-4">
              {/* Photo Preview Container */}
              {previewUrl ? (
                <div className="w-full border rounded-2xl overflow-hidden relative border-slate-200 bg-slate-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto block object-contain max-h-[70vh]"
                  />
                  <button
                    type="button"
                    onClick={resetSelection}
                    className="absolute top-2 right-2 px-3 py-1 bg-black/60 text-white rounded-lg text-[11px] font-medium backdrop-blur-sm"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-3">
                  {/* Option 1: Explicit Photo Library / Gallery Button */}
                  <label className="w-full py-3.5 px-4 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ImageIcon size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs font-bold text-slate-900">Choose from Photo Library</p>
                      <p className="text-[11px] text-slate-500">Pick an existing setup photo</p>
                    </div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Option 2: Explicit Camera Button */}
                  <label className="w-full py-3.5 px-4 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-100/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                      <Camera size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs font-bold text-slate-900">Take Photo with Camera</p>
                      <p className="text-[11px] text-slate-500">Snap a new photo right now</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {selectedFile && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
                  style={{ backgroundColor: "#0066ff" }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending to Desktop...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Send to Desktop</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
