/**
 * SetupSpot API Base Configuration
 * Primary API: https://api.setupspot.tech
 */

export const RENDER_API = "https://api.setupspot.tech";

export const API = import.meta.env.VITE_API_URL || RENDER_API;

export default API;
