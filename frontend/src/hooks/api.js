/**
 * SetupSpot API Base Configuration
 * Primary API: https://setupspot.onrender.com
 * Fallback API: http://localhost:5000
 */

export const RENDER_API = 'https://setupspot.onrender.com';
export const LOCAL_API = 'http://localhost:5000';

export const API = import.meta.env.VITE_API_URL || RENDER_API;
export const FALLBACK_API = LOCAL_API;

export default API;
