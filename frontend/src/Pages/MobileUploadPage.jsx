import React from "react";
import { Camera, CheckCircle2, Upload, Loader2, AlertCircle } from "lucide-react";
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
            <h2 className="text-lg font-bold text-slate-900 mb-1">Photo Sent!</h2>
            <p className="text-xs text-slate-500 mb-6 max-w-[240px]">
              Your photo is now displayed on your desktop screen.
            </p>
            <button
              onClick={resetSelection}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Take / Select Another Photo
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-base font-bold text-slate-900 mb-1">Upload Setup Photo</h1>
            <p className="text-xs text-slate-500 mb-6">
              Snap a picture of your desk setup or select one from your gallery to send directly to your desktop.
            </p>

            {error && (
              <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="w-full flex flex-col items-center gap-4">
              {/* Photo Preview or File Selector Dropzone */}
              <label className="w-full h-56 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 transition-colors overflow-hidden relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Camera size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Tap to Take or Select Photo</span>
                    <span className="text-[11px] text-slate-400">Camera / Gallery</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
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
