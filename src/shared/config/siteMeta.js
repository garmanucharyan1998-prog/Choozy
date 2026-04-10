/**
 * Canonical site origin for meta tags (OG, Twitter, sitemap alignment).
 * Set REACT_APP_SITE_URL in production (e.g. https://choosy.com).
 */
export const getSiteBaseUrl = () => {
  const fromEnv = process.env.REACT_APP_SITE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
};

/** Default when neither env nor window is available (SSR/prerender edge cases). */
export const DEFAULT_SITE_BASE_URL = "https://choosy.com";
