import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.5;

/**
 * ImageLightbox — Unsplash-style fullscreen image viewer.
 *
 * Features:
 *  - Full-screen dark overlay (backdrop)
 *  - Scroll-wheel zoom (centered on cursor position)
 *  - Click-drag pan when zoomed > 1
 *  - +/- toolbar buttons for zoom
 *  - Escape key + backdrop click to close
 *  - Smooth CSS transitions on zoom
 *  - Rendered via portal so it always sits above the app
 */
export const ImageLightbox = ({ imageUrl, alt = "Setup image", onClose }) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const dragStart = useRef(null);
  const translateRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // ── Escape key to close ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // ── Scroll-wheel zoom ────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
    // Reset translation when back to 1x so image snaps to center
    if (scale + delta <= MIN_SCALE) {
      setTranslate({ x: 0, y: 0 });
      translateRef.current = { x: 0, y: 0 };
    }
  }, [scale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // ── Click-drag pan ────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (scale <= 1) return; // no drag at 1x
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - translateRef.current.x, y: e.clientY - translateRef.current.y };
  }, [scale]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart.current) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    translateRef.current = { x: newX, y: newY };
    setTranslate({ x: newX, y: newY });
  }, [isDragging]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Touch pan (for mobile)
  const touchStart = useRef(null);
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 1 && scale > 1) {
      touchStart.current = {
        x: e.touches[0].clientX - translateRef.current.x,
        y: e.touches[0].clientY - translateRef.current.y,
      };
    }
  }, [scale]);

  const onTouchMove = useCallback((e) => {
    if (e.touches.length === 1 && touchStart.current) {
      e.preventDefault();
      const newX = e.touches[0].clientX - touchStart.current.x;
      const newY = e.touches[0].clientY - touchStart.current.y;
      translateRef.current = { x: newX, y: newY };
      setTranslate({ x: newX, y: newY });
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    touchStart.current = null;
  }, []);

  const zoomIn  = () => setScale((p) => Math.min(MAX_SCALE, p + ZOOM_STEP));
  const zoomOut = () => {
    setScale((p) => {
      const next = Math.max(MIN_SCALE, p - ZOOM_STEP);
      if (next <= MIN_SCALE) { setTranslate({ x: 0, y: 0 }); translateRef.current = { x: 0, y: 0 }; }
      return next;
    });
  };
  const zoomReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    translateRef.current = { x: 0, y: 0 };
  };

  const percent = Math.round(scale * 100);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.94)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        style={{ pointerEvents: "auto" }}
      >
        {/* Zoom percentage badge */}
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff" }}
        >
          {percent}%
        </span>

        <button
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
          title="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
          title="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={zoomReset}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
          title="Reset zoom"
        >
          <Maximize2 size={16} />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all ml-1"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
          title="Close (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Hint ─────────────────────────────────────────────── */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-medium pointer-events-none"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {scale > 1 ? "Drag to pan  ·  Scroll to zoom  ·  Esc to close" : "Scroll to zoom  ·  Esc to close"}
      </div>

      {/* ── Image container ──────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center w-full h-full overflow-hidden"
        style={{ cursor: isDragging ? "grabbing" : scale > 1 ? "grab" : "default" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Skeleton while loading */}
        {!isImageLoaded && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <svg className="animate-spin h-10 w-10" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
            </svg>
          </div>
        )}

        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          draggable={false}
          onLoad={() => setIsImageLoaded(true)}
          style={{
            maxWidth: "92vw",
            maxHeight: "90vh",
            objectFit: "contain",
            userSelect: "none",
            // Scale + translate applied together; transition only on scale changes (not drag)
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
            transformOrigin: "center center",
            opacity: isImageLoaded ? 1 : 0,
            willChange: "transform",
          }}
        />
      </div>
    </div>,
    document.body
  );
};
