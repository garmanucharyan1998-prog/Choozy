import { normalizeRole, ROLES } from "./sessionModel";

/**
 * A real account's role is decided once, at registration — not re-chosen on every login.
 * There's still no backend to ask, so this is a local, client-only "who registered as
 * what" lookup, keyed by email. Registration writes to it; login reads from it instead of
 * showing its own role picker.
 */
const ROLE_REGISTRY_KEY = "choozy_role_registry";

/** So the two demo accounts (see entities/user's defaultProfile, entities/shop's
 *  defaultShopProfile) work for login out of the box, without registering first. */
const SEED_REGISTRY = {
  "buyer.demo@choosy.am": ROLES.BUYER,
  "seller.demo@choosy.am": ROLES.SELLER,
};

const isBrowser = () => typeof window !== "undefined" && Boolean(window.localStorage);

const normalizeEmailKey = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const readRegistry = () => {
  if (!isBrowser()) return SEED_REGISTRY;
  try {
    const stored = window.localStorage.getItem(ROLE_REGISTRY_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return { ...SEED_REGISTRY, ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch {
    return SEED_REGISTRY;
  }
};

/**
 * Called on successful registration — remembers which role this email chose.
 * An email already in the registry keeps the role it registered with: a role is a property
 * of the account, and re-registering an existing address must not silently flip it (that
 * would also let anyone re-point the two seeded demo accounts).
 */
export const rememberRoleForEmail = (email, role) => {
  const key = normalizeEmailKey(email);
  if (!isBrowser() || !key || !normalizeRole(role)) return;
  const registry = readRegistry();
  if (normalizeRole(registry[key])) return;
  registry[key] = role;
  try {
    window.localStorage.setItem(ROLE_REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    /** Quota exceeded or storage disabled — the lookup just won't stick. */
  }
};

/**
 * Called on login — `null` means this email was never registered here (or the stored value
 * isn't a role we recognize). Validated on read as well as on write, because the registry
 * lives in localStorage: a hand-edited or half-written entry used to flow straight through
 * `?? ROLES.BUYER` into the login form, and the login action then dropped the request
 * without setting a cookie — the visitor landed on the home page still signed out, with no
 * error shown.
 */
export const readRoleForEmail = (email) => {
  const key = normalizeEmailKey(email);
  if (!key) return null;
  return normalizeRole(readRegistry()[key]);
};
