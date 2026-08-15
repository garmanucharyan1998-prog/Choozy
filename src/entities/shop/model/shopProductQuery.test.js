import {
  selectShopProducts,
  shopProductCategoryIdsInUse,
  summarizeShopProducts,
  SHOP_PRODUCT_SORTS,
  SHOP_PRODUCT_STOCK_FILTERS,
} from "./shopProductQuery";
import { SHOP_PRODUCT_STALE_MS } from "./shopAccountModel";

const NOW = 1_800_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

const product = (overrides) => ({
  id: "sp-1",
  title: "Apple iPhone 16 Pro Max 1TB Black Titanium",
  category: "Smartphones",
  categoryId: "",
  priceAmd: 550_000,
  availability: "in_stock",
  variants: ["256 / 12gb", "1TB / 12gb"],
  createdAt: NOW - DAY,
  lastRefreshedAt: NOW,
  ...overrides,
});

const LIST = [
  product({
    id: "a",
    title: "Apple iPhone 16 Pro Max 1TB",
    priceAmd: 550_000,
    createdAt: NOW - DAY,
  }),
  product({
    id: "b",
    title: "Dell XPS 15 9530 OLED",
    category: "Laptops",
    priceAmd: 920_000,
    availability: "out_of_stock",
    variants: ["32 / 1TB"],
    createdAt: NOW - 5 * DAY,
    /** Inside the warning window, so exactly one row answers "needs refresh". */
    lastRefreshedAt: NOW - (SHOP_PRODUCT_STALE_MS - DAY),
  }),
  product({
    id: "c",
    title: "Sony WH-1000XM5",
    category: "Audio",
    priceAmd: 185_000,
    variants: ["Black", "Silver"],
    createdAt: NOW - 2 * DAY,
    lastRefreshedAt: NOW - DAY,
  }),
];

describe("summarizeShopProducts", () => {
  test("counts what the tabs promise, from the same list the table renders", () => {
    expect(summarizeShopProducts(LIST, NOW)).toEqual({
      total: 3,
      inStock: 2,
      outOfStock: 1,
      needsRefresh: 1,
    });
  });

  test("an empty shop summarises to zeros rather than throwing", () => {
    expect(summarizeShopProducts([], NOW)).toEqual({
      total: 0,
      inStock: 0,
      outOfStock: 0,
      needsRefresh: 0,
    });
    expect(summarizeShopProducts(undefined, NOW).total).toBe(0);
  });
});

describe("selectShopProducts", () => {
  test("leaves the caller's array alone", () => {
    const input = [...LIST];
    selectShopProducts({ products: input, sort: SHOP_PRODUCT_SORTS.TITLE, now: NOW });
    expect(input.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  test("every search term has to land somewhere, in any order", () => {
    const ids = (query) =>
      selectShopProducts({ products: LIST, query, now: NOW }).map((p) => p.id);
    expect(ids("iphone")).toEqual(["a"]);
    expect(ids("IPHONE 1TB")).toEqual(["a"]);
    expect(ids("1tb iphone")).toEqual(["a"]);
    /** Every term must land: "sony" alone matches, "sony apple" matches neither listing. */
    expect(ids("sony")).toEqual(["c"]);
    expect(ids("sony apple")).toEqual([]);
    /** The category word is searchable too — sellers think in categories, not only in models. */
    expect(ids("laptops")).toEqual(["b"]);
    /** So is a configuration the listing carries. */
    expect(ids("silver")).toEqual(["c"]);
    expect(ids("   ").length).toBe(3);
  });

  test("stock filters partition the list", () => {
    const ids = (stockFilter) =>
      selectShopProducts({ products: LIST, stockFilter, now: NOW }).map((p) => p.id).sort();
    expect(ids(SHOP_PRODUCT_STOCK_FILTERS.ALL)).toEqual(["a", "b", "c"]);
    expect(ids(SHOP_PRODUCT_STOCK_FILTERS.IN_STOCK)).toEqual(["a", "c"]);
    expect(ids(SHOP_PRODUCT_STOCK_FILTERS.OUT_OF_STOCK)).toEqual(["b"]);
    expect(ids(SHOP_PRODUCT_STOCK_FILTERS.NEEDS_REFRESH)).toEqual(["b"]);
  });

  /** A seeded listing carries only the informal category word; the filter still has to find it. */
  test("category filtering reads both the stored id and the legacy category word", () => {
    expect(
      selectShopProducts({ products: LIST, categoryId: "laptops", now: NOW }).map((p) => p.id),
    ).toEqual(["b"]);
    expect(
      selectShopProducts({
        products: [product({ id: "d", categoryId: "tablets", category: "" })],
        categoryId: "tablets",
        now: NOW,
      }).map((p) => p.id),
    ).toEqual(["d"]);
  });

  test("sorts do what their names say", () => {
    const ids = (sort) => selectShopProducts({ products: LIST, sort, now: NOW }).map((p) => p.id);
    expect(ids(SHOP_PRODUCT_SORTS.NEWEST)).toEqual(["a", "c", "b"]);
    expect(ids(SHOP_PRODUCT_SORTS.OLDEST)).toEqual(["b", "c", "a"]);
    expect(ids(SHOP_PRODUCT_SORTS.PRICE_DESC)).toEqual(["b", "a", "c"]);
    expect(ids(SHOP_PRODUCT_SORTS.PRICE_ASC)).toEqual(["c", "a", "b"]);
    expect(ids(SHOP_PRODUCT_SORTS.TITLE)).toEqual(["a", "b", "c"]);
    expect(ids(SHOP_PRODUCT_SORTS.REFRESHED)).toEqual(["a", "c", "b"]);
    /** An unknown sort is the default, not an empty table. */
    expect(ids("nonsense")).toEqual(["a", "c", "b"]);
  });

  /**
   * A listing whose price never parsed is missing information, not the cheapest thing in the
   * shop — it sorts last whichever direction the seller picked.
   */
  test("a listing with no price sorts last in both price directions", () => {
    const withUnpriced = [...LIST, product({ id: "z", priceAmd: undefined })];
    expect(
      selectShopProducts({ products: withUnpriced, sort: SHOP_PRODUCT_SORTS.PRICE_ASC, now: NOW })
        .at(-1).id,
    ).toBe("z");
    expect(
      selectShopProducts({ products: withUnpriced, sort: SHOP_PRODUCT_SORTS.PRICE_DESC, now: NOW })
        .at(-1).id,
    ).toBe("z");
  });

  test("filters compose with search and sort", () => {
    expect(
      selectShopProducts({
        products: LIST,
        query: "1tb",
        stockFilter: SHOP_PRODUCT_STOCK_FILTERS.IN_STOCK,
        sort: SHOP_PRODUCT_SORTS.PRICE_ASC,
        now: NOW,
      }).map((p) => p.id),
    ).toEqual(["a"]);
  });
});

describe("shopProductCategoryIdsInUse", () => {
  test("offers only categories the shop actually lists, in catalog order", () => {
    expect(
      shopProductCategoryIdsInUse(LIST, ["smartphones", "laptops", "tablets", "headphones"]),
    ).toEqual(["smartphones", "laptops", "headphones"]);
    expect(shopProductCategoryIdsInUse([], ["smartphones"])).toEqual([]);
  });
});
