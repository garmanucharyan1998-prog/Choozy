/**
 * Where a comparison survives a page load.
 *
 * Follows `entities/user`'s storage shape (a key, a same-tab `CustomEvent`, every access
 * wrapped so a blocked `localStorage` cannot take the page down) with one deliberate
 * difference: the key is **not** scoped per signed-in email the way the wishlist's
 * `choozy.account.v2::<email>` is. A wishlist is a shelf that belongs to an account; a
 * comparison is a scratchpad for the visit in front of you. Scoping it would mean a guest
 * shelf, a merge on login, and a decision about whose comparison wins — all of it machinery
 * for state that is meant to be thrown away.
 *
 * The stored value is the same comma string the URL carries (`fp-1,fp-4`), not JSON: the two
 * paths into this feature then share one format, and there is no second parser to keep in
 * step with `parseCompareIds`.
 */
import { parseCompareIds, serializeCompareIds } from "./compareSelection";

export const COMPARE_STORAGE_KEY = "choozy.compare.v1";

/** Same-tab updates; the native `storage` event only fires in *other* tabs. */
export const COMPARE_STORAGE_EVENT = "choozy-compare-storage";

const isBrowser = () => typeof window !== "undefined" && Boolean(window.localStorage);

/**
 * Pure read — safe to call from a render path. Returns `[]` on the server, which is exactly
 * what a hydration-safe initial state needs.
 *
 * @returns {string[]}
 */
export const readCompareIds = () => {
  if (!isBrowser()) return [];
  try {
    return parseCompareIds(window.localStorage.getItem(COMPARE_STORAGE_KEY));
  } catch {
    /** Private mode, a quota error, a disabled store — an empty comparison, not a crash. */
    return [];
  }
};

/**
 * @param {string[]} ids
 * @param {string | null} rejected — a `COMPARE_REJECTION` value when the caller's change was
 *   refused; travels on the event so `CompareNotice` can explain it without its own channel.
 * @returns {string[]} the list as it was actually stored (normalized).
 */
export const writeCompareIds = (ids, rejected = null) => {
  const serialized = serializeCompareIds(ids);
  const next = parseCompareIds(serialized);

  if (isBrowser()) {
    try {
      if (serialized) window.localStorage.setItem(COMPARE_STORAGE_KEY, serialized);
      else window.localStorage.removeItem(COMPARE_STORAGE_KEY);
    } catch {
      /**
       * The write is lost, but the event below still fires and the in-memory state still
       * drives the UI — the same trade `writeAccountState` makes, for the same reason.
       */
    }
    window.dispatchEvent(new CustomEvent(COMPARE_STORAGE_EVENT, { detail: { ids: next, rejected } }));
  }

  return next;
};

/**
 * Announce a refusal without touching storage. A rejected add changes nothing, so there is
 * nothing to persist — but the visitor still needs to be told why their click did nothing.
 */
export const notifyCompareRejected = (rejected) => {
  if (!isBrowser() || !rejected) return;
  window.dispatchEvent(
    new CustomEvent(COMPARE_STORAGE_EVENT, { detail: { ids: readCompareIds(), rejected } }),
  );
};

/** Empties the comparison. Separate from `writeCompareIds([])` only for readability at call sites. */
export const clearCompareIds = () => writeCompareIds([]);
