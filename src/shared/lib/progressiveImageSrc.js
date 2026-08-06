/**
 * Builds low-res + high-res photo URLs for progressive loading.
 * CDN/Unsplash query URLs are rewritten to a tiny preview; local assets need an explicit `lowSrc`.
 */

const SKIP_PREFIXES = ["data:", "blob:"];

const isSkippableSrc = (src) =>
  !src || SKIP_PREFIXES.some((prefix) => src.startsWith(prefix)) || /\.svg(\?|$)/i.test(src);

const rewriteQueryParam = (url, key, value) => {
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    parsed.searchParams.set(key, String(value));
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return parsed.toString();
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

/**
 * Derives a compressed preview URL from an original photo URL.
 * @param {string} src
 * @returns {string | null}
 */
export const getLowResolutionSrc = (src) => {
  if (isSkippableSrc(src)) {
    return null;
  }

  if (/images\.unsplash\.com/i.test(src) || /[?&](w|h|q|width|quality)=/i.test(src)) {
    let next = src;
    next = rewriteQueryParam(next, "w", 48) || next;
    next = rewriteQueryParam(next, "h", 36) || next;
    next = rewriteQueryParam(next, "q", 20) || next;
    next = rewriteQueryParam(next, "width", 48) || next;
    next = rewriteQueryParam(next, "quality", 20) || next;
    if (!/[?&]fit=/i.test(next)) {
      next = rewriteQueryParam(next, "fit", "crop") || next;
    }
    return next === src ? null : next;
  }

  // Local assets: pass explicit `lowSrc` (e.g. `/assets/.../photo.low.jpg`) when the twin file exists.
  return null;
};

/**
 * @param {string} src - Original high-quality URL
 * @param {string} [lowSrc] - Optional explicit low-res URL
 * @returns {{ highSrc: string, lowSrc: string | null }}
 */
export const resolveProgressiveImageSources = (src, lowSrc) => {
  const highSrc = src || "";
  if (!highSrc || isSkippableSrc(highSrc)) {
    return { highSrc, lowSrc: null };
  }

  if (lowSrc && lowSrc !== highSrc) {
    return { highSrc, lowSrc };
  }

  return { highSrc, lowSrc: getLowResolutionSrc(highSrc) };
};
