import React, { useState } from 'react';
import { getOptimizedImageUrl, getBlurPlaceholderUrl } from '../utils/imageOptimizer';

/**
 * OptimizedImage
 * 
 * Performance-tuned image component featuring:
 * - Fixed aspect ratio container reservation to eliminate layout shift (CLS = 0)
 * - Automatic Cloudinary / Unsplash width downsizing
 * - Ultra-lightweight blurred placeholder blur-up animation
 * - Native browser lazy loading
 */
export const OptimizedImage = ({
  src,
  alt = '',
  width = 450,
  aspectRatio,
  className = '',
  style = {},
  loading = 'lazy',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(src, { width });
  const blurSrc = getBlurPlaceholderUrl(src);

  const containerStyle = {
    ...style,
    ...(aspectRatio ? { aspectRatio } : {}),
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-100/90 ${className}`}
      style={containerStyle}
    >
      {/* Low-res blurred background placeholder */}
      {blurSrc && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover filter blur-md scale-105 pointer-events-none transition-opacity duration-300 z-0 ${
            loaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* Main optimized image */}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover relative z-1 transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

export default React.memo(OptimizedImage);
