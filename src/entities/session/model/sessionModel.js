import { redirect } from "react-router";
import { readCookieValue, serializeCookie } from "shared/lib/cookie";
import { getLanguageFromPath, localizedPath, stripLanguageFromPath } from "shared/lib/locale";

/**
 * There is no real backend (see features/login — any non-empty email/password "succeeds"),
 * so this is a demo session: a cookie the visitor's own browser sets on itself, not a
 * server-verified credential. It exists to (a) give the app a real "signed out" state and
 * (b) separate the buyer and seller dashboards, which is what was actually asked for.
 */
export const SESSION_COOKIE_NAME = "choozy_session";

/** 30 days — long enough that a demo session survives a normal browsing gap. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const ROLES = { BUYER: "buyer", SELLER: "seller" };

export const ACCOUNT_ROOT = "/account";
export const FAVORITES_PATH = "/account/favorite";
export const SHOP_ACCOUNT_ROOT = "/account/shop-account";

const SIGNED_OUT = { isAuthenticated: false, role: null, email: null };

/** Validates an unknown value against the known roles — used both when parsing the
 *  cookie and when reading the role picked in the login form. */
export const normalizeRole = (raw) => (raw === ROLES.BUYER || raw === ROLES.SELLER ? raw : null);

const parseSessionValue = (raw) => {
  if (!raw) return SIGNED_OUT;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return SIGNED_OUT;
  }
  const role = normalizeRole(parsed?.r);
  if (!role) return SIGNED_OUT;
  /**
   * Lowercased so every consumer agrees on identity — entities/user's per-account
   * localStorage key is a case-sensitive string built from this value, and without this
   * normalization "Anna@x.com" and "anna@x.com" would silently land on different shelves.
   */
  const email =
    typeof parsed?.e === "string" && parsed.e.trim() ? parsed.e.trim().toLowerCase() : null;
  return { isAuthenticated: true, role, email };
};

/** Server-side: reads the `Cookie` request header. */
export const readSessionFromRequest = (request) =>
  parseSessionValue(readCookieValue(request.headers.get("Cookie"), SESSION_COOKIE_NAME));

/**
 * Client-side: reads `document.cookie`, which is the same `name=value; name2=value2`
 * shape as a request's `Cookie` header, so the same parser works for both. Not `HttpOnly`
 * on purpose — there's nothing secret in it (a role and the email the visitor just typed
 * into a form that doesn't check it), and the client needs to read it synchronously to
 * pick the right localStorage shelf for favorites (entities/user) without an effect tick.
 */
export const readSessionFromDocument = () => {
  if (typeof document === "undefined") return SIGNED_OUT;
  return parseSessionValue(readCookieValue(document.cookie, SESSION_COOKIE_NAME));
};

/** @param {{ secure: boolean }} options — derive `secure` from the request's protocol; never hardcode it, or login silently no-ops on http://localhost. */
export const serializeSessionCookie = (role, email, { secure }) =>
  serializeCookie(SESSION_COOKIE_NAME, JSON.stringify({ r: role, e: email || null }), {
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure,
  });

/** `Path`/`SameSite` must match the setter byte-for-byte, or the browser keeps the cookie. */
export const serializeClearedSessionCookie = ({ secure }) =>
  serializeCookie(SESSION_COOKIE_NAME, "", { maxAge: 0, secure });

export const dashboardPathForRole = (role) =>
  role === ROLES.SELLER ? SHOP_ACCOUNT_ROOT : ACCOUNT_ROOT;

const isFavoritesPath = (path) => path === FAVORITES_PATH;
/** Exact-or-slash only — `startsWith(SHOP_ACCOUNT_ROOT)` would also match `/account/shop-accountant`. */
const isSellerArea = (path) => path === SHOP_ACCOUNT_ROOT || path.startsWith(`${SHOP_ACCOUNT_ROOT}/`);
const isAccountArea = (path) => path === ACCOUNT_ROOT || path.startsWith(`${ACCOUNT_ROOT}/`);

/**
 * Single source of truth for who may see which `/account/*` path.
 * @param {string} barePathname — language-stripped pathname (see stripLanguageFromPath).
 * @param {{ isAuthenticated: boolean, role: string | null }} session
 * @returns {string | null} a redirect target, or `null` to let the request through.
 */
export const resolveAccountRouteRedirect = (barePathname, session) => {
  /**
   * Lowercased because React Router matches routes case-insensitively: `/Account` reaches
   * the guarded route, and comparing it against the lowercase literals below would fall
   * through to `null` and hand an anonymous visitor the dashboard. The root loader also
   * 301s such URLs (see canonicalizePathname) — this is the second lock on the same door.
   */
  const path = (barePathname || "/").replace(/\/+$/, "").toLowerCase() || "/";

  /** Decision: favorites stays open to anonymous visitors — only sellers get redirected off it. */
  if (isFavoritesPath(path)) {
    if (session?.isAuthenticated && session.role === ROLES.SELLER) return SHOP_ACCOUNT_ROOT;
    return null;
  }

  if (isSellerArea(path)) {
    if (!session?.isAuthenticated) return "/";
    if (session.role === ROLES.BUYER) return ACCOUNT_ROOT;
    return null;
  }

  if (isAccountArea(path)) {
    if (!session?.isAuthenticated) return "/";
    if (session.role === ROLES.SELLER) return SHOP_ACCOUNT_ROOT;
    return null;
  }

  return null;
};

/** Loader-facing guard: call from a page's own `loader`, throws a redirect when access is denied. */
export const requireAccountAccess = (request) => {
  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);
  const target = resolveAccountRouteRedirect(
    stripLanguageFromPath(url.pathname),
    readSessionFromRequest(request),
  );
  if (target) {
    throw redirect(localizedPath(target, language));
  }
};
