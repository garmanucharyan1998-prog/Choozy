import { ROLES } from "./sessionModel";

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

/** Called on successful registration — remembers which role this email chose. */
export const rememberRoleForEmail = (email, role) => {
  const key = normalizeEmailKey(email);
  if (!isBrowser() || !key || (role !== ROLES.BUYER && role !== ROLES.SELLER)) return;
  const registry = readRegistry();
  registry[key] = role;
  try {
    window.localStorage.setItem(ROLE_REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    /** Quota exceeded or storage disabled — the lookup just won't stick. */
  }
};

/** Called on login — `null` means this email was never registered here. */
export const readRoleForEmail = (email) => {
  const key = normalizeEmailKey(email);
  if (!key) return null;
  return readRegistry()[key] ?? null;
};
