import React from "react";
import { LogOut, X } from "lucide-react";

/**
 * ConfirmSignOutModal — lightweight sign-out confirmation dialog.
 * Props:
 *  - isOpen   {boolean}
 *  - onClose  {() => void}  — called on Cancel or backdrop click
 *  - onConfirm {() => void} — called on "Sign Out" confirmation
 */
export default function ConfirmSignOutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="signout-modal-title"
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl border shadow-2xl p-6 flex flex-col items-center text-center"
        style={{ borderColor: "#E2E8F0", fontFamily: "Inter, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-[#727687] hover:text-[#0F172A] hover:bg-[#f7f9fb] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border"
          style={{
            backgroundColor: "rgba(186,26,26,0.07)",
            borderColor: "rgba(186,26,26,0.18)",
          }}
        >
          <LogOut size={26} style={{ color: "#ba1a1a" }} />
        </div>

        {/* Text */}
        <h2
          id="signout-modal-title"
          className="text-xl font-bold mb-1"
          style={{ color: "#0F172A", letterSpacing: "-0.02em" }}
        >
          Sign out?
        </h2>
        <p className="text-sm font-light mb-6" style={{ color: "#475569" }}>
          You'll need to sign back in to access your setups and collections.
        </p>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer"
            style={{
              borderColor: "#E2E8F0",
              color: "#0F172A",
              backgroundColor: "#ffffff",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            Cancel
          </button>
          <button
            id="confirm-signout-btn"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
            style={{ backgroundColor: "#ba1a1a" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#9b1313")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ba1a1a")}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
