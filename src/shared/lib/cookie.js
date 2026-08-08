/**
 * Generic, domain-free cookie helpers — no session/role knowledge here, that lives in
 * entities/session. Isomorphic: `readCookieValue` only needs a header string (works from
 * `request.headers.get("Cookie")` on the server or `document.cookie` on the client).
 */

/**
 * Exact name match only. A naive `header.includes(name)` would false-match
 * `choozy_session_extra` when looking for `choozy_session` — a real bug class.
 */
export const readCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * @param {string} name
 * @param {string} value
 * @param {{ maxAge?: number, path?: string, sameSite?: string, secure?: boolean }} options
 */
export const serializeCookie = (name, value, options = {}) => {
  const { maxAge, path = "/", sameSite = "Lax", secure = false } = options;
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (typeof maxAge === "number") parts.push(`Max-Age=${maxAge}`);
  if (secure) parts.push("Secure");
  return parts.join("; ");
};
