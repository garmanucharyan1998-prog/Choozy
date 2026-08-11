import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useLanguage } from "contexts";
import {
  MAX_COMPARE_ITEMS,
  buildCompareRows,
  compareCategoryId,
  getCompareProducts,
  parseCompareIds,
  readCompareIds,
  removeFromCompare,
  serializeCompareIds,
  writeCompareIds,
} from "entities/product-compare";
import { useProductCompare } from "../model/useProductCompare";

/**
 * The compare page's own state: which products are on screen, the rows to draw, and the two
 * things a visitor can do to the table (drop a column, empty it).
 *
 * Two sources feed the selection and they are not symmetric. `?ids=` is what a shared link
 * carries and the only one the server can see, so it wins for the first render. `localStorage`
 * is what the visitor built across the site and is the truth from mount onward — otherwise
 * removing a column would leave a stale `?ids=` still driving the table.
 *
 * The `hasMounted` gate is the pattern already used by `YerevanMapClientOnly` and
 * `PriceHistoryChartClientOnly`: the server and the first client render agree by construction,
 * and browser-only state is swapped in afterwards.
 */
/**
 * @param {string[] | null} fixedIds — set by the `/compare/<a>-vs-<b>` pages, whose selection
 *   comes from the URL path and must not be edited in place: that page is one indexable
 *   address for one specific pair, so removing a column there would leave the URL lying.
 *   Those pages hand the visitor over to `/compare?ids=…` instead.
 */
export const useComparePresenter = (fixedIds = null) => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { compareOrder, toggleCompare } = useProductCompare();
  const [hasMounted, setHasMounted] = useState(false);
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const urlIds = useMemo(() => parseCompareIds(searchParams.get("ids")), [searchParams]);
  const urlIdsKey = urlIds.join(",");

  /**
   * A shared link replaces whatever this browser had: the visitor followed it to see that
   * comparison, not their own. Declared before the mount gate so the store is already right
   * by the time the gate hands over to it.
   */
  const isFixed = Array.isArray(fixedIds);

  useEffect(() => {
    if (!isFixed && urlIdsKey) writeCompareIds(urlIdsKey.split(","));
  }, [isFixed, urlIdsKey]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const ids = isFixed ? fixedIds : hasMounted ? compareOrder : urlIds;

  /** Keeps the address bar shareable at all times, without stacking history entries. */
  useEffect(() => {
    if (isFixed || !hasMounted) return;
    const serialized = serializeCompareIds(ids);
    if (serialized === (searchParams.get("ids") ?? "")) return;

    const next = new URLSearchParams(searchParams);
    if (serialized) next.set("ids", serialized);
    else next.delete("ids");
    setSearchParams(next, { replace: true, preventScrollReset: true });
  }, [isFixed, hasMounted, ids, searchParams, setSearchParams]);

  const products = useMemo(() => getCompareProducts(ids), [ids]);
  const categoryId = useMemo(() => compareCategoryId(ids), [ids]);

  const table = useMemo(
    () => (products.length ? buildCompareRows(products, t) : { sections: [] }),
    [products, t],
  );

  /**
   * Filtering happens here rather than in `buildCompareRows` so the toggle costs a re-render
   * and not a rebuild, and so a section that empties out disappears with its heading.
   */
  const visibleSections = useMemo(() => {
    if (!onlyDifferences) return table.sections;
    return table.sections
      .map((section) => ({ ...section, rows: section.rows.filter((row) => !row.allSame) }))
      .filter((section) => section.rows.length > 0);
  }, [table.sections, onlyDifferences]);

  const differingRowCount = useMemo(
    () => table.sections.reduce((n, s) => n + s.rows.filter((row) => !row.allSame).length, 0),
    [table.sections],
  );

  /** Reads through to the store rather than closing over `ids`, for the same reason the toggle does. */
  const removeProduct = useCallback((productId) => {
    writeCompareIds(removeFromCompare(readCompareIds(), productId));
  }, []);

  const clearAll = useCallback(() => {
    writeCompareIds([]);
  }, []);

  return {
    t,
    isFixed,
    /** Where a fixed pair's "edit this comparison" link goes. */
    editHref: `/compare?ids=${serializeCompareIds(ids)}`,
    products,
    categoryId,
    sections: visibleSections,
    hasRows: table.sections.length > 0,
    differingRowCount,
    onlyDifferences,
    toggleOnlyDifferences: () => setOnlyDifferences((value) => !value),
    removeProduct,
    clearAll,
    toggleCompare,
    canAddMore: products.length < MAX_COMPARE_ITEMS,
    maxItems: MAX_COMPARE_ITEMS,
    /** Sends the visitor back to the shelf this comparison came from, not to the whole catalog. */
    addMoreHref: categoryId ? `/filter?category=${encodeURIComponent(categoryId)}` : "/filter",
  };
};

export default useComparePresenter;
