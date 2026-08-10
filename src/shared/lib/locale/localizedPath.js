import { DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";

/**
 * URL language scheme: the default language lives at the root (`/filter`),
 * every other language gets a path prefix (`/ru/filter`).
 * The prefix is the source of truth for the active language — see LanguageContext.
 */

/**
 * Case-insensitive because React Router's own matching is: `/RU/filter` reaches the `ru`
 * route branch, so the language reader has to agree with the router or the page renders
 * Armenian copy under a `/RU/` URL. The canonical-case 301 in the root loader
 * (see canonicalizePathname) means visitors never stay on such a URL for long.
 */
const LANGUAGE_PREFIX_PATTERN = /^\/([a-zA-Z]{2})(?=\/|$)/;

/**
 * @param {string} cleanPath — a pathname with no query/hash
 * @returns {{ code: string, length: number } | null} the lowercased two-letter prefix and
 *   how many characters it occupies, or `null` when there is no such prefix.
 */
const readPathPrefix = (cleanPath) => {
  const match = cleanPath.match(LANGUAGE_PREFIX_PATTERN);
  return match ? { code: match[1].toLowerCase(), length: match[0].length } : null;
};

/** Splits `/ru/filter?q=x#top` into path and the `?q=x#top` remainder. */
const splitPath = (fullPath) => {
  const value = typeof fullPath === "string" && fullPath ? fullPath : "/";
  const normalized = value.startsWith("/") ? value : `/${value}`;
  const suffixIndex = normalized.search(/[?#]/);
  if (suffixIndex === -1) {
    return { pathname: normalized, suffix: "" };
  }
  return { pathname: normalized.slice(0, suffixIndex), suffix: normalized.slice(suffixIndex) };
};

/**
 * Reads the language encoded in a pathname.
 * @param {string} pathname
 * @returns {string} supported language code, or the default one
 */
export const getLanguageFromPath = (pathname) => {
  const { pathname: cleanPath } = splitPath(pathname);
  const prefix = readPathPrefix(cleanPath);
  if (prefix && SUPPORTED_LANGUAGE_CODES.includes(prefix.code)) {
    return prefix.code;
  }
  return DEFAULT_LANGUAGE_CODE;
};

/**
 * True when the path starts with a two-letter segment that is not a supported language
 * (e.g. `/de/filter`) — such URLs must resolve to the 404 page, not to the default locale.
 * @param {string} pathname
 */
export const hasUnknownLanguagePrefix = (pathname) => {
  const { pathname: cleanPath } = splitPath(pathname);
  const prefix = readPathPrefix(cleanPath);
  return Boolean(prefix) && !SUPPORTED_LANGUAGE_CODES.includes(prefix.code);
};

/**
 * Removes the language prefix, returning the language-agnostic path.
 * @param {string} pathname
 * @returns {string} always starts with `/`
 */
export const stripLanguageFromPath = (pathname) => {
  const { pathname: cleanPath, suffix } = splitPath(pathname);
  const prefix = readPathPrefix(cleanPath);
  if (prefix && SUPPORTED_LANGUAGE_CODES.includes(prefix.code)) {
    const rest = cleanPath.slice(prefix.length);
    return `${rest || "/"}${suffix}`;
  }
  return `${cleanPath}${suffix}`;
};

/**
 * Builds the path for a given language. Safe to call with an already-prefixed path.
 * External URLs, `mailto:`, `tel:` and in-page anchors are returned untouched.
 *
 * @param {string} path — e.g. `/filter?category=laptops`
 * @param {string} language — e.g. `ru`
 * @returns {string} e.g. `/ru/filter?category=laptops`
 */
export const localizedPath = (path, language) => {
  if (typeof path !== "string" || !path) {
    return "/";
  }
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(path) || path.startsWith("#")) {
    return path;
  }

  const bare = stripLanguageFromPath(path);
  const lang = SUPPORTED_LANGUAGE_CODES.includes(language) ? language : DEFAULT_LANGUAGE_CODE;

  if (lang === DEFAULT_LANGUAGE_CODE) {
    return bare;
  }

  const { pathname, suffix } = splitPath(bare);
  const rest = pathname === "/" ? "" : pathname;
  return `/${lang}${rest}${suffix}`;
};

export default localizedPath;
