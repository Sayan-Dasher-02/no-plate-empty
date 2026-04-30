const PRODUCTION_API_BASE_URL = "https://no-plate-empty-4iz6.onrender.com";

export const API =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : "");
export const ML_API = import.meta.env.VITE_ML_API_BASE_URL ?? API;
