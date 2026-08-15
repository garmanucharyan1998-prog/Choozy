import { normalizeRole, ROLES } from "./sessionModel";

/**
 * A real account's role is decided once, at registration — not re-chosen on every login.
 * There's still no backend to ask, so this is a local, client-only "who registered as
 * what" lookup, keyed by email. Registration writes to it; login reads from it instead of
 * showing its own role picker.
 *
 * It also holds the password hash, which makes it the record of an account rather than only of
 * a role: login needs to answer "does this account exist, and is this its password" before any
 * session exists, and this is the only store that is keyed by a typed email and readable at that
 * moment. Nothing here is a security boundary — see `readPasswordHashForEmail`.
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

/**
 * Entries were plain role strings before passwords were stored, and the seeds still are.
 * Both shapes are read; only the object shape is ever written. A registry written by an older
 * build therefore keeps working, and its accounts simply have no password on file — which
 * `verifyPasswordForEmail` treats as "cannot be checked", not as "wrong".
 */
const normalizeEntry = (value) => {
  if (typeof value === "string") {
    const role = normalizeRole(value);
    return role ? { role, passwordHash: "" } : null;
  }
  if (!value || typeof value !== "object") return null;
  const role = normalizeRole(value.role);
  if (!role) return null;
  return {
    role,
    passwordHash: typeof value.passwordHash === "string" ? value.passwordHash : "",
  };
};

const readRegistry = () => {
  if (!isBrowser()) return { ...SEED_REGISTRY };
  try {
    const stored = window.localStorage.getItem(ROLE_REGISTRY_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return { ...SEED_REGISTRY, ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch {
    return { ...SEED_REGISTRY };
  }
};

const writeRegistry = (registry) => {
  try {
    window.localStorage.setItem(ROLE_REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    /** Quota exceeded or storage disabled — the lookup just won't stick. */
  }
};

const readEntry = (email) => {
  const key = normalizeEmailKey(email);
  if (!key) return null;
  return normalizeEntry(readRegistry()[key]);
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
  const existing = normalizeEntry(registry[key]);
  if (existing) return;
  registry[key] = { role, passwordHash: "" };
  writeRegistry(registry);
};

/**
 * Stores the password hash for an account that already exists in the registry.
 *
 * Never creates an entry: a password without a role is not an account, and letting this write
 * one would give an unregistered address a way into the registry without choosing a role.
 * Overwriting IS allowed, unlike the role — changing a password is the point.
 */
export const rememberPasswordForEmail = (email, passwordHash) => {
  const key = normalizeEmailKey(email);
  if (!isBrowser() || !key || typeof passwordHash !== "string" || !passwordHash) return;
  const registry = readRegistry();
  const existing = normalizeEntry(registry[key]);
  if (!existing) return;
  registry[key] = { role: existing.role, passwordHash };
  writeRegistry(registry);
};

/**
 * Called on login — `null` means this email was never registered here (or the stored value
 * isn't a role we recognize). Validated on read as well as on write, because the registry
 * lives in localStorage: a hand-edited or half-written entry used to flow straight through
 * `?? ROLES.BUYER` into the login form, and the login action then dropped the request
 * without setting a cookie — the visitor landed on the home page still signed out, with no
 * error shown.
 */
export const readRoleForEmail = (email) => readEntry(email)?.role ?? null;

/** Whether anything has ever registered under this address in this browser. */
export const hasAccountForEmail = (email) => readEntry(email) !== null;

/**
 * The stored hash, or `""` when this account has none on file — the two seeded demo accounts,
 * and anything registered before passwords were stored.
 *
 * This is not authentication and must not be mistaken for it. There is no backend: the registry
 * is localStorage the visitor can edit, the hash is unsalted SHA-256, and the session cookie is
 * one the browser sets on itself. What this buys is a login form that can be wrong — a typo in
 * an address or a password no longer signs someone in as somebody else.
 */
export const readPasswordHashForEmail = (email) => readEntry(email)?.passwordHash ?? "";
