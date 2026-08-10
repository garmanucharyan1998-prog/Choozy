/**
 * Canonical site origin for meta tags (OG, Twitter, canonical/hreflang, JSON-LD, sitemap).
 * Set VITE_SITE_URL per environment; the default below is the production domain.
 *
 * Deliberately NOT derived from `window.location.origin`: this value is read during render
 * — `buildPageMeta` for every page's `meta()`, and the JSON-LD builders inside their
 * components — so a server/client disagreement would put a different canonical, `og:url`
 * and `<script type="application/ld+json">` in the SSR HTML than in the first client
 * render, i.e. a hydration mismatch on every page. A canonical URL also has to name the
 * one domain the site should be indexed under, which is precisely not "whatever host the
 * browser happens to be on".
 */

/** The domain the site is indexed under when no environment override is provided. */
export const DEFAULT_SITE_BASE_URL = "https://choosy.com";

/** @returns {string} origin with no trailing slash, identical on server and client. */
export const getSiteBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/+$/, "");
  }
  return DEFAULT_SITE_BASE_URL;
};
