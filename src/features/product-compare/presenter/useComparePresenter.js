import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useLanguage } from "contexts";
import { getBrandLabel } from "entities/product";
import {
  COMPARE_SECTION_IDS,
  MAX_COMPARE_ITEMS,
  OFFER_SORT_DIRECTIONS,
  buildCompareAdvantages,
  buildCompareBars,
  buildCompareBestOffers,
  buildCompareKeyDifferences,
  buildCompareRows,
  buildRadarData,
  compareCategoryId,
  getCompareProducts,
  parseCompareIds,
  readCompareIds,
  removeFromCompare,
  serializeCompareIds,
  sortOfferRowsByPrice,
  writeCompareIds,
} from "entities/product-compare";
import { useProductCompare } from "../model/useProductCompare";
import { assignSeriesColors } from "../model/compareSeriesColors";

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
  /**
   * Which column the shop prices are sorted by, and which way. `null` is the shop order
   * `buildCompareRows` emits (most popular first) — a real third state, not the absence of one:
   * the visitor can undo a sort and get the default ranking back, which they could not if the
   * control only flipped between ascending and descending.
   *
   * Deliberately *not* in the URL, unlike `?ids=`: the selection is what a shared link is about
   * and what the page is indexed under, whereas a sort is how one visitor happens to be reading
   * the table right now. Putting it in the query would mint a second address for identical
   * content — an SEO duplicate for a preference nobody links to.
   */
  const [offersSort, setOffersSort] = useState({ productId: null, direction: OFFER_SORT_DIRECTIONS.ASC });

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

  /**
   * The manufacturer's display name per product, resolved once here rather than in the card that
   * prints it: the same label is already a row in the table, and two call sites resolving a brand
   * id independently is how a card and the row under it come to disagree.
   */
  const brandLabels = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, getBrandLabel(product.brandId)])),
    [products],
  );

  /**
   * Assigned during render (not in an effect): the server and the first client render must
   * agree on which colour goes with which product, and both start from the same empty ref and
   * the same `products` order, so they land on the same result without a hydration gate.
   */
  const seriesColorsRef = useRef({});
  const seriesColors = useMemo(() => {
    seriesColorsRef.current = assignSeriesColors(products, seriesColorsRef.current);
    return seriesColorsRef.current;
  }, [products]);

  const bars = useMemo(() => buildCompareBars(products, t), [products, t]);
  const advantages = useMemo(() => buildCompareAdvantages(products, t), [products, t]);
  const bestOffers = useMemo(() => buildCompareBestOffers(products, t), [products, t]);
  const keyDifferences = useMemo(() => buildCompareKeyDifferences(products, t), [products, t]);
  /** Memoized for identity, not cost: `CompareRadar` derives its visible set from this object. */
  const radar = useMemo(() => buildRadarData(products), [products]);

  const table = useMemo(
    () => (products.length ? buildCompareRows(products, t) : { sections: [] }),
    [products, t],
  );

  /**
   * The active sort is validated against the columns currently on screen rather than cleared by
   * an effect when one is removed: dropping the sorted column would otherwise leave the state
   * pointing at a product that is no longer in the table, and the rows would stay in an order
   * nothing visible explains.
   */
  const activeOffersSort = useMemo(
    () =>
      offersSort.productId && products.some((product) => product.id === offersSort.productId)
        ? offersSort
        : { productId: null, direction: offersSort.direction },
    [offersSort, products],
  );

  const sortedSections = useMemo(() => {
    if (!activeOffersSort.productId) return table.sections;
    return table.sections.map((section) =>
      section.id === COMPARE_SECTION_IDS.OFFERS
        ? {
            ...section,
            rows: sortOfferRowsByPrice(
              section.rows,
              activeOffersSort.productId,
              activeOffersSort.direction,
            ),
          }
        : section,
    );
  }, [table.sections, activeOffersSort]);

  /**
   * Filtering happens here rather than in `buildCompareRows` so the toggle costs a re-render
   * and not a rebuild, and so a section that empties out disappears with its heading.
   */
  const visibleSections = useMemo(() => {
    if (!onlyDifferences) return sortedSections;
    return sortedSections
      .map((section) => ({ ...section, rows: section.rows.filter((row) => !row.allSame) }))
      .filter((section) => section.rows.length > 0);
  }, [sortedSections, onlyDifferences]);

  /**
   * The visible sections split by what they are: the specifications read as one table with one
   * caption, and the shop prices as another — two different questions ("how do these differ",
   * "where do I buy") that used to share one twenty-row scroll under one heading.
   */
  const specSections = useMemo(
    () => visibleSections.filter((section) => section.kind !== COMPARE_SECTION_IDS.OFFERS),
    [visibleSections],
  );
  const offersSection = useMemo(
    () => visibleSections.find((section) => section.kind === COMPARE_SECTION_IDS.OFFERS) ?? null,
    [visibleSections],
  );

  const differingRowCount = useMemo(
    () => table.sections.reduce((n, s) => n + s.rows.filter((row) => !row.allSame).length, 0),
    [table.sections],
  );

  /**
   * Differing *specifications*, which is not the same number as `differingRowCount` and is the
   * only one worth printing next to "key differences": the shop-price rows below it differ in
   * almost every cell by construction (twelve shops quoting twelve prices), so counting them
   * would answer "how much do these products differ" with a number about the market instead.
   */
  const differingSpecCount = useMemo(
    () =>
      table.sections
        .filter((section) => section.kind !== COMPARE_SECTION_IDS.OFFERS)
        .reduce((n, section) => n + section.rows.filter((row) => !row.allSame).length, 0),
    [table.sections],
  );

  /**
   * Which spec groups are folded away. A `Set` of section ids rather than a flag per section, so
   * a group that disappears (its rows filtered out, its product removed) leaves no state behind.
   *
   * Everything starts open. Collapsing is an escape hatch for a long comparison, not a default
   * that hides a difference the visitor never learns is there — and a page that opened with half
   * its specs folded would be answering "show me the differences" with "look for them".
   */
  const [collapsedSectionIds, setCollapsedSectionIds] = useState(() => new Set());

  const toggleSectionCollapsed = useCallback((sectionId) => {
    setCollapsedSectionIds((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  /** Reads through to the store rather than closing over `ids`, for the same reason the toggle does. */
  const removeProduct = useCallback((productId) => {
    writeCompareIds(removeFromCompare(readCompareIds(), productId));
  }, []);

  const clearAll = useCallback(() => {
    writeCompareIds([]);
  }, []);

  /**
   * One control per column, cycling cheapest-first → dearest-first → default. Clicking a
   * different column starts that column at cheapest-first rather than inheriting the previous
   * column's direction: "sort by this one" is the intent behind the click, and the ascending
   * answer is the one a price table is normally asked for.
   */
  const toggleOffersSort = useCallback((productId) => {
    setOffersSort((current) => {
      if (current.productId !== productId) {
        return { productId, direction: OFFER_SORT_DIRECTIONS.ASC };
      }
      if (current.direction === OFFER_SORT_DIRECTIONS.ASC) {
        return { productId, direction: OFFER_SORT_DIRECTIONS.DESC };
      }
      return { productId: null, direction: OFFER_SORT_DIRECTIONS.ASC };
    });
  }, []);

  return {
    t,
    isFixed,
    /** Where a fixed pair's "edit this comparison" link goes. */
    editHref: `/compare?ids=${serializeCompareIds(ids)}`,
    products,
    brandLabels,
    categoryId,
    seriesColors,
    bars,
    advantages,
    bestOffers,
    keyDifferences,
    radar,
    sections: visibleSections,
    specSections,
    offersSection,
    collapsedSectionIds,
    toggleSectionCollapsed,
    hasRows: table.sections.length > 0,
    differingRowCount,
    differingSpecCount,
    onlyDifferences,
    /**
     * Set, not toggled: the control is a two-state radio group ("all specifications" / "only
     * differences"), and the "key differences" summary also turns the filter *on* from a link
     * that must not turn it off again when a reader who already filtered clicks it.
     */
    setOnlyDifferences,
    /** `{ productId, direction }` — `productId: null` means the offers section is unsorted. */
    offersSort: activeOffersSort,
    toggleOffersSort,
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
