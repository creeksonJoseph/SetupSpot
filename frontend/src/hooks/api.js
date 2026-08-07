/**
 * SetupSpot API Base Configuration
 * Primary API: https://setupspot.onrender.com
 */

export const RENDER_API = 'https://setupspot.onrender.com';
export const API = import.meta.env.VITE_API_URL || RENDER_API;

export default API;
