/**
 * Cloudinary & Image URL Optimization Utility
 * 
 * Dynamically transforms image URLs (Cloudinary, Unsplash, etc.) to request
 * optimized dimensions (e.g. w_450 for grid thumbnails vs full-res for detail page),
 * auto-format (WebP/AVIF), auto-quality, and low-res blur placeholders.
 */

/**
 * Returns an optimized image URL for grid cards or hero detail views.
 * 
 * @param {string} url - Original image URL
 * @param {Object} options
 * @param {number} [options.width=450] - Desired target display width in pixels
 * @param {number} [options.height] - Optional target display height
 * @param {string} [options.quality='auto'] - Quality level ('auto', 'auto:eco', 'auto:good', '80')
 * @param {string} [options.format='auto'] - Format ('auto', 'webp', 'avif')
 * @param {string} [options.crop='fill'] - Crop mode ('fill', 'fit', 'scale', 'limit')
 * @returns {string} Optimized URL
 */
export function getOptimizedImageUrl(url, {
  width = 450,
  height,
  quality = 'auto',
  format = 'auto',
  crop = 'fill'
} = {}) {
  if (!url || typeof url !== 'string') return url || '';

  // Cloudinary URLs: res.cloudinary.com/<cloud>/image/upload/[v<ver>/]<public_id>
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const parts = url.split('/upload/');
    
    // Build Cloudinary transformation parameters
    const transforms = [];
    if (crop) transforms.push(`c_${crop}`);
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (quality) transforms.push(`q_${quality}`);
    if (format) transforms.push(`f_${format}`);

    const transformString = transforms.join(',');
    
    // Avoid duplicating transformation parameters if already present
    if (parts[1].startsWith('c_') || parts[1].startsWith('w_') || parts[1].startsWith('f_auto')) {
      return url;
    }

    return `${parts[0]}/upload/${transformString}/${parts[1]}`;
  }

  // Unsplash URLs: images.unsplash.com/...
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      if (width) parsedUrl.searchParams.set('w', width.toString());
      if (height) parsedUrl.searchParams.set('h', height.toString());
      parsedUrl.searchParams.set('q', '80');
      parsedUrl.searchParams.set('auto', 'format');
      if (crop === 'fill') parsedUrl.searchParams.set('fit', 'crop');
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Returns a tiny (~20px wide) blurred image URL for progressive blur-up loading placeholders.
 * 
 * @param {string} url - Original image URL
 * @returns {string} Tiny blurred placeholder URL
 */
export function getBlurPlaceholderUrl(url) {
  if (!url || typeof url !== 'string') return '';

  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const parts = url.split('/upload/');
    if (parts[1].startsWith('c_') || parts[1].startsWith('w_')) {
      return url;
    }
    return `${parts[0]}/upload/c_fill,w_20,q_1,e_blur:1000,f_auto/${parts[1]}`;
  }

  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('w', '20');
      parsedUrl.searchParams.set('q', '10');
      parsedUrl.searchParams.set('blur', '50');
      parsedUrl.searchParams.set('auto', 'format');
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }

  return url;
}
