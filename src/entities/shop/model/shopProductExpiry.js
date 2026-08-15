import { isShopProductExemptFromExpiry, SHOP_PRODUCT_STALE_MS } from "./shopAccountModel";

/**
 * How close a listing is to being removed for want of a refresh — the seller-facing reading of
 * the rule `pruneStaleShopProducts` enforces.
 *
 * Kept out of the components on purpose. The expiry rule is domain logic: it decides what the
 * attention banner says, which rows carry a warning, what the "needs refresh" tab counts and
 * what a bulk refresh is for. Computing "days left" inside a table cell would put four
 * slightly different versions of the same arithmetic in four files (§52).
 *
 * The one subtlety worth stating loudly: **not every listing can expire.** The demo catalog is
 * fixture data and `isShopProductStale` exempts it by id, so this module reports `PERMANENT`
 * for those rows rather than a countdown — the UI then shows no expiry indicator at all. A
 * countdown on a row that will never be removed would be a claim the data does not support.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Inside this much of the deadline a listing is worth interrupting the seller about. */
export const SHOP_PRODUCT_EXPIRY_WARNING_MS = 2 * ONE_DAY_MS;

/** Whole days in the refresh window — the number the copy quotes ("removed after N days"). */
export const SHOP_PRODUCT_STALE_DAYS = Math.round(SHOP_PRODUCT_STALE_MS / ONE_DAY_MS);

export const SHOP_PRODUCT_EXPIRY = {
  /** Not subject to auto-removal. Say nothing about it. */
  PERMANENT: "permanent",
  /** Refreshed recently enough that the deadline is not news. */
  OK: "ok",
  /** Inside the warning window — the seller should refresh it. */
  SOON: "soon",
  /** Past the deadline, still on screen because pruning runs on an interval. */
  OVERDUE: "overdue",
};

/**
 * @param {{ id?: string, lastRefreshedAt?: number, createdAt?: number }} product
 * @param {number} [now]
 * @returns {{ state: string, msLeft: number | null, daysLeft: number | null }}
 *   `msLeft`/`daysLeft` are `null` for a listing that cannot expire. `daysLeft` is rounded
 *   **up**, so "1 day" means "some part of a day left", never "already gone".
 */
export const getShopProductExpiry = (product, now = Date.now()) => {
  /**
   * Asks the pruner's own predicate rather than re-deriving its rule. Two copies of "which
   * listings expire" is how a UI ends up warning about a row nothing will ever delete — or,
   * worse, staying quiet about one that vanishes overnight.
   */
  if (isShopProductExemptFromExpiry(product)) {
    return { state: SHOP_PRODUCT_EXPIRY.PERMANENT, msLeft: null, daysLeft: null };
  }

  const refreshedAt = product?.lastRefreshedAt ?? product?.createdAt ?? now;
  const msLeft = SHOP_PRODUCT_STALE_MS - (now - refreshedAt);
  const daysLeft = Math.max(0, Math.ceil(msLeft / ONE_DAY_MS));

  if (msLeft <= 0) return { state: SHOP_PRODUCT_EXPIRY.OVERDUE, msLeft, daysLeft: 0 };
  if (msLeft <= SHOP_PRODUCT_EXPIRY_WARNING_MS) {
    return { state: SHOP_PRODUCT_EXPIRY.SOON, msLeft, daysLeft };
  }
  return { state: SHOP_PRODUCT_EXPIRY.OK, msLeft, daysLeft };
};

/** Does this listing need the seller to do something about it today? */
export const needsShopProductRefresh = (product, now = Date.now()) => {
  const { state } = getShopProductExpiry(product, now);
  return state === SHOP_PRODUCT_EXPIRY.SOON || state === SHOP_PRODUCT_EXPIRY.OVERDUE;
};

/**
 * Whole days since a listing was last refreshed. Real data for every row (the model stamps
 * `lastRefreshedAt` on read when a record has none), and coarse enough that the server's
 * "now" and the client's agree during hydration — a finer unit would differ by the seconds
 * the document spent in flight and produce a React #418 mismatch.
 *
 * @returns {number} 0 on the day of the refresh.
 */
export const daysSinceShopProductRefresh = (product, now = Date.now()) => {
  const refreshedAt = product?.lastRefreshedAt ?? product?.createdAt ?? now;
  return Math.max(0, Math.floor((now - refreshedAt) / ONE_DAY_MS));
};
