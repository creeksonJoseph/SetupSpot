import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

export const DeletePostModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Setup?",
  setupTitle,
  setupImage,
  confirmText = "Delete Setup",
  description,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
      setProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartDelete = async () => {
    setIsDeleting(true);
    setProgress(20);

    const timer1 = setTimeout(() => setProgress(55), 250);
    const timer2 = setTimeout(() => setProgress(85), 500);

    try {
      await onConfirm();
      setProgress(100);
      setTimeout(() => {
        setIsDeleting(false);
        setProgress(0);
        onClose();
      }, 400);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsDeleting(false);
      setProgress(0);
    }
  };

  const displayDescription =
    description || (
      <>
        Are you sure you want to delete{" "}
        <strong style={{ color: "#0F172A" }}>
          "{setupTitle || "this item"}"
        </strong>
        ? This action cannot be undone.
      </>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border shadow-2xl max-w-xs sm:max-w-sm w-full p-5 relative overflow-hidden transition-all transform scale-100"
        style={{ borderColor: "#E2E8F0" }}
      >
        {/* Close Button */}
        {!isDeleting && (
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border"
            style={{
              backgroundColor: "rgba(186,26,26,0.08)",
              borderColor: "rgba(186,26,26,0.2)",
              color: "#ba1a1a",
            }}
          >
            <Trash2 size={22} />
          </div>

          <h3 className="text-base font-bold" style={{ color: "#0F172A" }}>
            {title}
          </h3>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#727687" }}>
            {displayDescription}
          </p>
        </div>

        {/* Thumbnail Preview */}
        {setupImage && (
          <div className="mt-3.5 mb-1 rounded-xl overflow-hidden border h-28 relative" style={{ borderColor: '#E2E8F0' }}>
            <img src={setupImage} alt={setupTitle || 'Setup'} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Progress Bar View when Deleting */}
        {isDeleting ? (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold" style={{ color: '#0F172A' }}>
              <span className="flex items-center gap-1.5" style={{ color: '#ba1a1a' }}>
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: '#ba1a1a' }} />
                Deleting setup...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border" style={{ borderColor: '#E2E8F0' }}>
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%`, backgroundColor: '#ba1a1a' }}
              />
            </div>
          </div>
        ) : (
          /* Action Buttons */
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-xl border font-semibold text-xs transition-colors hover:bg-slate-50 shadow-xs"
              style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartDelete}
              className="flex-1 py-2 px-4 rounded-xl font-semibold text-xs text-white transition-all shadow-xs"
              style={{ backgroundColor: '#ba1a1a' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9e1414')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ba1a1a')}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
