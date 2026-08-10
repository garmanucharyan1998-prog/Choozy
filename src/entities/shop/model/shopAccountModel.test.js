import { vi } from "vitest";
import {
  DEMO_SHOP_PRODUCTS_SEED,
  isShopProductStale,
  pruneStaleShopProducts,
  readShopAccountState,
  SHOP_PRODUCT_STALE_MS,
  writeShopAccountState,
} from "./shopAccountModel";

const NOW = 1_800_000_000_000;
const LONG_AGO = NOW - SHOP_PRODUCT_STALE_MS - 1;

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("shop product staleness", () => {
  test("a seller's own listing expires once it goes unrefreshed past the window", () => {
    expect(isShopProductStale({ id: "sp-own", lastRefreshedAt: LONG_AGO }, NOW)).toBe(true);
    expect(isShopProductStale({ id: "sp-own", lastRefreshedAt: NOW - 1000 }, NOW)).toBe(false);
  });

  /**
   * The demo catalog is fixture data, not a listing anyone is expected to refresh. It used to
   * expire: the seed carries no `lastRefreshedAt`, so normalization stamped it with "now" on
   * every read — harmless until the first write froze that stamp into storage. Five days
   * later the pruner deleted all of it, and because storage existed by then the seed was
   * never consulted again, leaving the products tab blank forever.
   */
  test("demo seed products never go stale, however old the stamp is", () => {
    DEMO_SHOP_PRODUCTS_SEED.forEach((product) => {
      expect(isShopProductStale({ ...product, lastRefreshedAt: LONG_AGO }, NOW)).toBe(false);
    });
  });

  test("pruning keeps the demo catalog and drops only expired own listings", () => {
    const kept = pruneStaleShopProducts(
      [
        { ...DEMO_SHOP_PRODUCTS_SEED[0], lastRefreshedAt: LONG_AGO },
        { id: "sp-fresh", lastRefreshedAt: NOW - 1000 },
        { id: "sp-expired", lastRefreshedAt: LONG_AGO },
      ],
      NOW,
    );
    expect(kept.map((p) => p.id)).toEqual([DEMO_SHOP_PRODUCTS_SEED[0].id, "sp-fresh"]);
  });

  test("the demo catalog survives a persist round-trip", () => {
    const seededIds = readShopAccountState().shopProducts.map((p) => p.id);
    expect(seededIds.length).toBe(DEMO_SHOP_PRODUCTS_SEED.length);

    writeShopAccountState((state) => ({ ...state, avatarDataUrl: "" }));
    expect(readShopAccountState().shopProducts.map((p) => p.id)).toEqual(seededIds);
  });
});

describe("writeShopAccountState", () => {
  /**
   * A shop avatar is allowed up to 200 KB as a base64 data URL, so quota failures are real.
   * This used to throw straight out of a FileReader callback, where nothing catches it.
   */
  test("survives a storage quota failure and still returns the new state", () => {
    const setItem = vi
      .spyOn(window.localStorage.__proto__, "setItem")
      .mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });
    try {
      expect(() => writeShopAccountState({ avatarDataUrl: "data:image/png;base64,AAAA" })).not.toThrow();
      expect(writeShopAccountState({ avatarDataUrl: "" }).profile).toBeTruthy();
    } finally {
      setItem.mockRestore();
    }
  });
});
