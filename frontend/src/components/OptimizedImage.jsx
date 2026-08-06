import React, { useState } from 'react';
import { getOptimizedImageUrl, getBlurPlaceholderUrl } from '../utils/imageOptimizer';

/**
 * OptimizedImage
 * 
 * Performance-tuned image component featuring:
 * - Automatic Cloudinary / Unsplash width downsizing (e.g. w_450 for grid tiles)
 * - Ultra-lightweight blurred placeholder blur-up animation
 * - Native browser lazy loading
 */
export const OptimizedImage = ({
  src,
  alt = '',
  width = 450,
  className = '',
  style = {},
  loading = 'lazy',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(src, { width });
  const blurSrc = getBlurPlaceholderUrl(src);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ ...style }}>
      {/* Low-res blurred background placeholder */}
      {blurSrc && !loaded && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105 pointer-events-none transition-opacity duration-300"
        />
      )}

      {/* Main optimized image */}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

export default React.memo(OptimizedImage);
