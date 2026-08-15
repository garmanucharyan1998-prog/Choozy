import {
  daysSinceShopProductRefresh,
  getShopProductExpiry,
  needsShopProductRefresh,
  SHOP_PRODUCT_EXPIRY,
  SHOP_PRODUCT_STALE_DAYS,
} from "./shopProductExpiry";
import { DEMO_SHOP_PRODUCTS_SEED, SHOP_PRODUCT_STALE_MS } from "./shopAccountModel";

const NOW = 1_800_000_000_000;
const DAY = 24 * 60 * 60 * 1000;
const own = (msAgo) => ({ id: "sp-own", lastRefreshedAt: NOW - msAgo });

describe("shop product expiry", () => {
  test("the window the copy quotes is the window the pruner enforces", () => {
    expect(SHOP_PRODUCT_STALE_DAYS).toBe(SHOP_PRODUCT_STALE_MS / DAY);
  });

  test("a freshly refreshed listing is not worth mentioning", () => {
    const { state, daysLeft } = getShopProductExpiry(own(0), NOW);
    expect(state).toBe(SHOP_PRODUCT_EXPIRY.OK);
    expect(daysLeft).toBe(SHOP_PRODUCT_STALE_DAYS);
  });

  /**
   * Rounded up, so "1 day" always means "some part of a day is left". Rounding down would put
   * a listing with 23 hours to go at "0 days", which reads as already gone.
   */
  test("days left round up, and reach the warning state two days out", () => {
    expect(getShopProductExpiry(own(SHOP_PRODUCT_STALE_MS - 1.5 * DAY), NOW)).toMatchObject({
      state: SHOP_PRODUCT_EXPIRY.SOON,
      daysLeft: 2,
    });
    expect(getShopProductExpiry(own(SHOP_PRODUCT_STALE_MS - DAY), NOW)).toMatchObject({
      state: SHOP_PRODUCT_EXPIRY.SOON,
      daysLeft: 1,
    });
    expect(getShopProductExpiry(own(SHOP_PRODUCT_STALE_MS - 3 * DAY), NOW).state).toBe(
      SHOP_PRODUCT_EXPIRY.OK,
    );
  });

  test("past the deadline is overdue, never a negative countdown", () => {
    const overdue = getShopProductExpiry(own(SHOP_PRODUCT_STALE_MS + DAY), NOW);
    expect(overdue.state).toBe(SHOP_PRODUCT_EXPIRY.OVERDUE);
    expect(overdue.daysLeft).toBe(0);
  });

  /**
   * The rule this module exists to keep honest: the demo catalog is exempt from pruning, so
   * it gets no countdown at all rather than a deadline nothing will ever act on.
   */
  test("listings the pruner never touches report no deadline", () => {
    DEMO_SHOP_PRODUCTS_SEED.forEach((product) => {
      const expiry = getShopProductExpiry(
        { ...product, lastRefreshedAt: NOW - 10 * SHOP_PRODUCT_STALE_MS },
        NOW,
      );
      expect(expiry.state).toBe(SHOP_PRODUCT_EXPIRY.PERMANENT);
      expect(expiry.daysLeft).toBeNull();
      expect(needsShopProductRefresh(product, NOW)).toBe(false);
    });
  });

  test("needsRefresh covers both the warning window and the overdue tail", () => {
    expect(needsShopProductRefresh(own(0), NOW)).toBe(false);
    expect(needsShopProductRefresh(own(SHOP_PRODUCT_STALE_MS - DAY), NOW)).toBe(true);
    expect(needsShopProductRefresh(own(SHOP_PRODUCT_STALE_MS + DAY), NOW)).toBe(true);
  });

  /**
   * Whole elapsed days, not calendar days: the server and the client stamp `lastRefreshedAt`
   * seconds apart during hydration, and any finer unit would render two different strings for
   * the same row.
   */
  test("days since refresh is whole elapsed days, floored at zero", () => {
    expect(daysSinceShopProductRefresh(own(0), NOW)).toBe(0);
    expect(daysSinceShopProductRefresh(own(20 * 60 * 60 * 1000), NOW)).toBe(0);
    expect(daysSinceShopProductRefresh(own(3.2 * DAY), NOW)).toBe(3);
    expect(daysSinceShopProductRefresh({ id: "x", lastRefreshedAt: NOW + DAY }, NOW)).toBe(0);
  });
});
