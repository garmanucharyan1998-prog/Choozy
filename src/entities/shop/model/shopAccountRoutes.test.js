import {
  shopAccountPathForSidebar,
  shopSidebarIdFromPath,
  SHOP_ACCOUNT_ROOT_PATH,
  SHOP_SIDEBAR_LABEL_KEYS,
} from "./shopAccountRoutes";
import { SHOP_SIDEBAR_IDS } from "./shopAccountModel";

describe("shop account routes", () => {
  test("every section resolves from its own path, in every language", () => {
    expect(shopSidebarIdFromPath("/account/shop-account")).toBe(SHOP_SIDEBAR_IDS.DETAILS);
    expect(shopSidebarIdFromPath("/account/shop-account/products")).toBe(
      SHOP_SIDEBAR_IDS.PRODUCTS,
    );
    expect(shopSidebarIdFromPath("/ru/account/shop-account/statistics")).toBe(
      SHOP_SIDEBAR_IDS.STATISTICS,
    );
    expect(shopSidebarIdFromPath("/en/account/shop-account/finance")).toBe(
      SHOP_SIDEBAR_IDS.FINANCE,
    );
  });

  /**
   * `meta()` is handed whatever the visitor typed, and the router matches routes
   * case-insensitively — so a section that resolved only for the exact lowercase spelling would
   * give `/Account/Shop-Account/Products` the wrong title.
   */
  test("a trailing slash or a stray capital still names the same section", () => {
    expect(shopSidebarIdFromPath("/account/shop-account/products/")).toBe(
      SHOP_SIDEBAR_IDS.PRODUCTS,
    );
    expect(shopSidebarIdFromPath("/Account/Shop-Account/Products")).toBe(
      SHOP_SIDEBAR_IDS.PRODUCTS,
    );
    expect(shopSidebarIdFromPath("/ru/account/shop-account/")).toBe(SHOP_SIDEBAR_IDS.DETAILS);
  });

  test("anything unrecognised falls back to the entry tab rather than throwing", () => {
    expect(shopSidebarIdFromPath("/account/shop-account/nonsense")).toBe(
      SHOP_SIDEBAR_IDS.DETAILS,
    );
    expect(shopSidebarIdFromPath("")).toBe(SHOP_SIDEBAR_IDS.DETAILS);
    expect(shopSidebarIdFromPath(undefined)).toBe(SHOP_SIDEBAR_IDS.DETAILS);
  });

  test("the two directions agree, which is the point of keeping them together", () => {
    Object.values(SHOP_SIDEBAR_IDS).forEach((id) => {
      expect(shopSidebarIdFromPath(shopAccountPathForSidebar(id))).toBe(id);
    });
    expect(shopAccountPathForSidebar("not-a-section")).toBe(SHOP_ACCOUNT_ROOT_PATH);
  });

  /** A section with no label key would render its own dotted path as a browser tab title. */
  test("every section has a label key", () => {
    Object.values(SHOP_SIDEBAR_IDS).forEach((id) => {
      expect(SHOP_SIDEBAR_LABEL_KEYS[id]).toMatch(/^shopAccount\.sidebar\./);
    });
  });
});
