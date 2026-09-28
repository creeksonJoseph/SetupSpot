import React, { useState } from 'react';

/**
 * LandingImage
 *
 * Drop-in replacement for <img> inside landing page sections.
 * Shows an animated shimmer skeleton while the image is loading so
 * the page never looks "hung" on slow connections. Fades the real
 * image in once it's ready.
 *
 * Props mirror a regular <img> (src, alt, className, style, loading).
 */
export default function LandingImage({
  src,
  alt = '',
  className = '',
  style = {},
  loading = 'lazy',
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden" style={style}>
      {/* Shimmer skeleton — visible until image loads */}
      {!loaded && !errored && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 landing-img-shimmer"
        />
      )}

      {/* Fallback background if image fails */}
      {errored && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-slate-100 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-slate-300 text-4xl">
            broken_image
          </span>
        </div>
      )}

      {/* Actual image — invisible until loaded, then fades in */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        {...rest}
      />
    </div>
  );
}
