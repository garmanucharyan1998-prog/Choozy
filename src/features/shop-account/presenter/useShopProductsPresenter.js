import { useCallback, useEffect, useMemo, useState } from "react";
import {
  daysSinceShopProductRefresh,
  getShopProductExpiry,
  resolveShopProductCategoryId,
  selectShopProducts,
  shopProductCategoryIdsInUse,
  summarizeShopProducts,
  SHOP_PRODUCT_CATEGORY_IDS,
  SHOP_PRODUCT_SORTS,
  SHOP_PRODUCT_STOCK_FILTERS,
} from "entities/shop";

/** One screenful and a bit. The seller reaches the rest by searching, filtering, or asking for more. */
const PAGE_SIZE = 24;

/**
 * How often the expiry countdown is recomputed. The deadline is measured in days, so this only
 * has to be faster than the thing it describes — matching the hourly pruner in
 * `useShopAccountPresenter` keeps the two from disagreeing about which rows are still there.
 */
const CLOCK_TICK_MS = 60 * 60 * 1000;

/**
 * Everything about *looking at* the product list: what is typed in the search box, which tab
 * and category are active, the sort, the bulk selection, and how many rows are on screen.
 *
 * Deliberately separate from `useShopAccountPresenter`, which owns the products themselves and
 * every mutation. Two different lifetimes: the data survives a tab switch and a reload, this
 * does not, and mixing them is what turns a dashboard hook into a thousand-line object nobody
 * can reason about (§51).
 *
 * @param {{ products: ReturnType<typeof import("entities/shop").normalizeShopProduct>[] }} options
 */
export const useShopProductsPresenter = ({ products }) => {
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState(SHOP_PRODUCT_STOCK_FILTERS.ALL);
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState(SHOP_PRODUCT_SORTS.NEWEST);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /**
   * `null` until mounted, on purpose. The server renders this page too, and any value derived
   * from `Date.now()` differs between the server's render and the browser's first one — the
   * exact shape of the React #418 mismatch this codebase has already been bitten by twice. A
   * null clock reports every listing as "no deadline", which is what the server can honestly
   * say, and the real countdown arrives one tick later.
   */
  const [nowMs, setNowMs] = useState(null);

  useEffect(() => {
    setNowMs(Date.now());
    const intervalId = window.setInterval(() => setNowMs(Date.now()), CLOCK_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const summary = useMemo(() => summarizeShopProducts(products, nowMs ?? 0), [products, nowMs]);

  const categoryIdsInUse = useMemo(
    () => shopProductCategoryIdsInUse(products, SHOP_PRODUCT_CATEGORY_IDS),
    [products],
  );

  /**
   * A category filter whose category has just been emptied (the seller deleted the last
   * listing in it) would show "no matches" for a choice that is no longer on the menu. Fall
   * back to "all categories" rather than stranding them in an unreachable state.
   */
  useEffect(() => {
    if (categoryId && !categoryIdsInUse.includes(categoryId)) setCategoryId("");
  }, [categoryId, categoryIdsInUse]);

  const matchedProducts = useMemo(
    () => selectShopProducts({ products, query, stockFilter, categoryId, sort, now: nowMs ?? 0 }),
    [products, query, stockFilter, categoryId, sort, nowMs],
  );

  /** A new result set starts at the top — carrying "show 96 rows" into a 3-row search is noise. */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, stockFilter, categoryId, sort]);

  /**
   * Selection is pruned against the products that still exist. Without this a bulk delete
   * leaves its own victims selected, and the next bulk action reports a count that includes
   * rows nobody can see.
   */
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const live = new Set(products.map((product) => product.id));
      const next = new Set([...prev].filter((id) => live.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [products]);

  const visibleProducts = useMemo(
    () => matchedProducts.slice(0, visibleCount),
    [matchedProducts, visibleCount],
  );

  /**
   * The derived facts a row needs, computed once here rather than in each cell: the expiry
   * state, how long since the last refresh, and which category the listing belongs to. Keeping
   * them out of the components is what stops four slightly different copies of the deadline
   * arithmetic appearing in the table, the card list, the tabs and the banner (§52).
   */
  const rows = useMemo(
    () =>
      visibleProducts.map((product) => ({
        product,
        expiry: getShopProductExpiry(product, nowMs ?? 0),
        daysSinceRefresh: nowMs === null ? null : daysSinceShopProductRefresh(product, nowMs),
        categoryId: resolveShopProductCategoryId(product),
      })),
    [visibleProducts, nowMs],
  );

  const matchedIds = useMemo(() => matchedProducts.map((product) => product.id), [matchedProducts]);

  const selectedMatchedIds = useMemo(
    () => matchedIds.filter((id) => selectedIds.has(id)),
    [matchedIds, selectedIds],
  );

  const toggleSelected = useCallback((productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  /**
   * Operates on everything the current filters match, not only the rows already rendered — the
   * header checkbox sits above a list the seller has narrowed on purpose, and "select all" that
   * quietly meant "all 24 visible" would make a bulk refresh look like it had missed rows.
   */
  const toggleSelectAllMatched = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = matchedIds.length > 0 && matchedIds.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        matchedIds.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...matchedIds]);
    });
  }, [matchedIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const showMore = useCallback(() => setVisibleCount((prev) => prev + PAGE_SIZE), []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setStockFilter(SHOP_PRODUCT_STOCK_FILTERS.ALL);
    setCategoryId("");
  }, []);

  const hasActiveFilters =
    query.trim() !== "" || stockFilter !== SHOP_PRODUCT_STOCK_FILTERS.ALL || categoryId !== "";

  return {
    query,
    setQuery,
    stockFilter,
    setStockFilter,
    categoryId,
    setCategoryId,
    sort,
    setSort,
    summary,
    categoryIdsInUse,
    rows,
    matchedCount: matchedProducts.length,
    matchedIds,
    hiddenCount: Math.max(0, matchedProducts.length - visibleProducts.length),
    showMore,
    selectedIds,
    selectedMatchedIds,
    toggleSelected,
    toggleSelectAllMatched,
    clearSelection,
    hasActiveFilters,
    resetFilters,
    /** `null` before hydration — components use it to withhold time-derived copy on first paint. */
    nowMs,
  };
};

export default useShopProductsPresenter;
