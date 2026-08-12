/**
 * When the catalog and page copy last changed, as `YYYY-MM-DD`.
 *
 * A hand-maintained constant rather than `new Date()`: `<lastmod>` is a claim about the
 * content, and stamping it with the request time tells crawlers every URL changed on every
 * fetch — which teaches them to stop trusting the field. It also has to be identical on the
 * server and in any client-side use, which a live clock is not.
 *
 * Bump this when product data or page copy actually changes.
 */
export const CONTENT_LAST_MODIFIED = "2026-08-12";

export default CONTENT_LAST_MODIFIED;
