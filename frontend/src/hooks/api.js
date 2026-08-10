/**
 * SetupSpot API Base Configuration
 * Primary API: https://api.setupspot.tech
 * Fallback API: http://localhost:5000
 */

export const RENDER_API = "https://api.setupspot.tech";
export const LOCAL_API = "http://localhost:5000";

export const API = import.meta.env.VITE_API_URL || RENDER_API;
export const FALLBACK_API = LOCAL_API;

export default API;
