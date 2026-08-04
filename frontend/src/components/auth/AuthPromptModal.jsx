import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LogIn, UserPlus } from 'lucide-react';

export default function AuthPromptModal({ isOpen, onClose, actionName = 'continue' }) {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Container — Sharp corners (rounded-xl) */}
      <div
        className="relative w-full max-w-md bg-white rounded-xl border border-[#E2E8F0] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-[#727687] hover:text-[#0F172A] hover:bg-[#f7f9fb] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* SetupSpot App Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/favicon_io/android-chrome-192x192.png"
            alt="SetupSpot Logo"
            className="w-12 h-12 rounded-xl object-contain"
          />
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-[#0F172A] tracking-tight mb-2">
          Log in to {actionName}
        </h3>
        <p className="text-sm text-[#475569] leading-relaxed mb-6">
          Join SetupSpot to save workspaces, tag gear specs, and curate custom collections.
        </p>

        {/* Smaller Side-by-Side Buttons */}
        <div className="flex flex-row items-center gap-3 w-full">
          <Link
            to="/login"
            state={{ from: location }}
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0066ff] text-white text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-lg hover:bg-[#0050cb] transition-all shadow-xs text-center whitespace-nowrap"
          >
            <LogIn size={15} />
            <span>Log In</span>
          </Link>

          <Link
            to="/signup"
            state={{ from: location }}
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-lg hover:border-[#0066ff] hover:text-[#0066ff] transition-all shadow-xs text-center whitespace-nowrap"
          >
            <UserPlus size={15} />
            <span>Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
