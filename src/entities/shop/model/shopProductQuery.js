import { needsShopProductRefresh } from "./shopProductExpiry";
import { resolveShopProductCategoryId } from "./shopProductCatalog";

/**
 * Searching, filtering, sorting and counting a seller's listings — as pure functions over the
 * product array, with no React and no storage.
 *
 * The dashboard asks four questions about the same list ("how many are there", "which ones are
 * out of stock", "which match what I typed", "which order do I want them in") and they have to
 * agree with one another: a tab that says 15 and a table that then shows 14 rows is worse than
 * having no tab at all. Both come from `summarizeShopProducts` and `selectShopProducts` here,
 * so they cannot drift.
 */

export const SHOP_PRODUCT_STOCK_FILTERS = {
  ALL: "all",
  IN_STOCK: "in_stock",
  OUT_OF_STOCK: "out_of_stock",
  NEEDS_REFRESH: "needs_refresh",
};

export const SHOP_PRODUCT_SORTS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  PRICE_DESC: "price_desc",
  PRICE_ASC: "price_asc",
  TITLE: "title",
  REFRESHED: "refreshed",
};

/** Order the sort menu is offered in — most useful to a seller first. */
export const SHOP_PRODUCT_SORT_ORDER = [
  SHOP_PRODUCT_SORTS.NEWEST,
  SHOP_PRODUCT_SORTS.OLDEST,
  SHOP_PRODUCT_SORTS.REFRESHED,
  SHOP_PRODUCT_SORTS.PRICE_DESC,
  SHOP_PRODUCT_SORTS.PRICE_ASC,
  SHOP_PRODUCT_SORTS.TITLE,
];

export const SHOP_PRODUCT_STOCK_FILTER_ORDER = [
  SHOP_PRODUCT_STOCK_FILTERS.ALL,
  SHOP_PRODUCT_STOCK_FILTERS.IN_STOCK,
  SHOP_PRODUCT_STOCK_FILTERS.OUT_OF_STOCK,
  SHOP_PRODUCT_STOCK_FILTERS.NEEDS_REFRESH,
];

export const isShopProductInStock = (product) => product?.availability !== "out_of_stock";

/**
 * Case- and diacritic-insensitive haystack for one listing.
 *
 * `toLocaleLowerCase()` with no locale argument, deliberately: the catalog is Latin-script
 * model names and the shop's category words, and a Turkish-locale browser would otherwise turn
 * the "I" of "iPhone" into a dotless "ı" and stop matching what the seller typed.
 */
const searchHaystack = (product) =>
  [product?.title, product?.category, ...(product?.variants ?? [])]
    .filter((part) => typeof part === "string" && part)
    .join(" ")
    .toLocaleLowerCase("en-US");

/**
 * @param {ReturnType<import("./shopAccountModel").normalizeShopProduct>[]} products
 * @param {number} [now]
 */
export const summarizeShopProducts = (products, now = Date.now()) => {
  const list = Array.isArray(products) ? products : [];
  let inStock = 0;
  let needsRefresh = 0;

  list.forEach((product) => {
    if (isShopProductInStock(product)) inStock += 1;
    if (needsShopProductRefresh(product, now)) needsRefresh += 1;
  });

  return {
    total: list.length,
    inStock,
    outOfStock: list.length - inStock,
    needsRefresh,
  };
};

const matchesStockFilter = (product, stockFilter, now) => {
  switch (stockFilter) {
    case SHOP_PRODUCT_STOCK_FILTERS.IN_STOCK:
      return isShopProductInStock(product);
    case SHOP_PRODUCT_STOCK_FILTERS.OUT_OF_STOCK:
      return !isShopProductInStock(product);
    case SHOP_PRODUCT_STOCK_FILTERS.NEEDS_REFRESH:
      return needsShopProductRefresh(product, now);
    default:
      return true;
  }
};

/**
 * `undefined` sorts last in every direction: a listing whose price failed to parse is missing
 * information, not the cheapest thing in the shop.
 */
const priceOf = (product) =>
  typeof product?.priceAmd === "number" && Number.isFinite(product.priceAmd)
    ? product.priceAmd
    : null;

const byPrice = (direction) => (a, b) => {
  const left = priceOf(a);
  const right = priceOf(b);
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return direction === "asc" ? left - right : right - left;
};

const COMPARATORS = {
  [SHOP_PRODUCT_SORTS.NEWEST]: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
  [SHOP_PRODUCT_SORTS.OLDEST]: (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
  [SHOP_PRODUCT_SORTS.REFRESHED]: (a, b) => (b.lastRefreshedAt || 0) - (a.lastRefreshedAt || 0),
  [SHOP_PRODUCT_SORTS.PRICE_DESC]: byPrice("desc"),
  [SHOP_PRODUCT_SORTS.PRICE_ASC]: byPrice("asc"),
  /**
   * `localeCompare` with no locale so the browser uses the visitor's own collation — the
   * titles are Latin model names, but a seller reading the dashboard in Armenian still expects
   * their own alphabet's idea of order for anything that is not.
   */
  [SHOP_PRODUCT_SORTS.TITLE]: (a, b) => String(a.title || "").localeCompare(String(b.title || "")),
};

/**
 * The visible rows, in order: search → stock filter → category filter → sort.
 *
 * Never mutates its input — `sortedShopProducts` used to sort a copy for exactly this reason,
 * and the array it is handed here is the one held in React state.
 *
 * @param {{
 *   products: ReturnType<import("./shopAccountModel").normalizeShopProduct>[],
 *   query?: string,
 *   stockFilter?: string,
 *   categoryId?: string,
 *   sort?: string,
 *   now?: number,
 * }} options
 */
export const selectShopProducts = ({
  products,
  query = "",
  stockFilter = SHOP_PRODUCT_STOCK_FILTERS.ALL,
  categoryId = "",
  sort = SHOP_PRODUCT_SORTS.NEWEST,
  now = Date.now(),
}) => {
  const list = Array.isArray(products) ? products : [];
  const needle = String(query || "")
    .trim()
    .toLocaleLowerCase("en-US");
  /** Every word has to appear somewhere, so "pro 512" finds a listing however it is worded. */
  const terms = needle ? needle.split(/\s+/) : [];

  const filtered = list.filter((product) => {
    if (!matchesStockFilter(product, stockFilter, now)) return false;
    if (categoryId && resolveShopProductCategoryId(product) !== categoryId) return false;
    if (terms.length === 0) return true;
    const haystack = searchHaystack(product);
    return terms.every((term) => haystack.includes(term));
  });

  const comparator = COMPARATORS[sort] || COMPARATORS[SHOP_PRODUCT_SORTS.NEWEST];
  return filtered.sort(comparator);
};

/**
 * The category ids actually present in a shop, in the catalog's own order — a filter menu
 * offering "Speakers" to a shop that has never listed one is a dead end the seller has to
 * discover by trying it.
 *
 * @param {ReturnType<import("./shopAccountModel").normalizeShopProduct>[]} products
 * @param {string[]} categoryOrder
 */
export const shopProductCategoryIdsInUse = (products, categoryOrder) => {
  const present = new Set(
    (Array.isArray(products) ? products : [])
      .map((product) => resolveShopProductCategoryId(product))
      .filter(Boolean),
  );
  return categoryOrder.filter((id) => present.has(id));
};
