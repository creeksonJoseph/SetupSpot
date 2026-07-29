import React from 'react';
import { useToast } from '../context/ToastContext';

export const ShareMenu = ({ setup, onClose }) => {
  if (!setup) return null;

  const shareUrl = `${window.location.origin}/post/${setup.id}`;
  const shareText = `Check out this setup: ${setup.title} by ${setup.author}`;
  const { showToast } = useToast();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast('Link copied to clipboard!', 'success');
    onClose();
  };

  const openWindow = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl bg-white border border-slate-200 p-5 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Share Setup</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => openWindow(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`)}
            className="flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
            </div>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => openWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`)}
            className="flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tag</span>
            </div>
            <span>Twitter / X</span>
          </button>

          <button
            onClick={() => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
            className="flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>public</span>
            </div>
            <span>Facebook</span>
          </button>

          <button
            onClick={copyLink}
            className="flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-left group border-t border-slate-100 mt-2 pt-3"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>link</span>
            </div>
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareMenu;
