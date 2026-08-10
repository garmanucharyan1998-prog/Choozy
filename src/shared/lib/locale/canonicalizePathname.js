/**
 * One URL per page: React Router matches routes case-insensitively, so `/Account`,
 * `/ACCOUNT/` and `/account` all reach the same route. Left alone that means duplicate
 * crawlable URLs *and* an access-control hole — every guard compares against lowercase
 * literals (see entities/session's resolveAccountRouteRedirect), so a capitalized path
 * matches the route but slips past the comparison. The root loader 301s anything
 * non-canonical here before a page ever renders.
 *
 * Only the pathname is touched — query strings are case-sensitive data (`?q=iPhone`).
 */

/**
 * Asset requests are served by the static middleware ahead of the router, but a stray one
 * that does reach a loader must not be rewritten: `/assets/images/AboutUs/AboutUs.jpg`
 * only exists with that exact casing.
 */
const looksLikeFileRequest = (pathname) => /\.[a-z0-9]+$/i.test(pathname);

/**
 * @param {string} pathname
 * @returns {string} the canonical form — always starts with `/`, never ends with one
 *   (except the root itself), lowercase, with repeated slashes collapsed.
 */
export const canonicalizePathname = (pathname) => {
  if (typeof pathname !== "string" || !pathname) return "/";
  if (looksLikeFileRequest(pathname)) return pathname;

  /** Collapse first: `//` would otherwise strip to an empty string and redirect to itself. */
  const collapsed = pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  return (collapsed || "/").toLowerCase();
};

export default canonicalizePathname;
