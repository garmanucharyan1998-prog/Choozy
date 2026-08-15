import { useCallback, useRef } from "react";
import { useComparePresenter } from "features/product-compare";
import { CompareAdvantages } from "./CompareAdvantages";
import { CompareBars } from "./CompareBars";
import { CompareBestPrices } from "./CompareBestPrices";
import { CompareColumnHeader } from "./CompareColumnHeader";
import { CompareControls } from "./CompareControls";
import { CompareEmptyState } from "./CompareEmptyState";
import { CompareKeyDifferences } from "./CompareKeyDifferences";
import { CompareProductStrip } from "./CompareProductStrip";
import { CompareRadar } from "./CompareRadar";
import { CompareStickyHeader } from "./CompareStickyHeader";
import { CompareTable } from "./CompareTable";
import { SECTION_HEADING, SECTION_SUBHEADING, SURFACE, SECTION_PAD } from "./compareStyles";
import "./ProductCompare.css";

/**
 * The comparison experience, in the order a purchase decision is actually made.
 *
 * The page used to be one thing: a twenty-row table with a checkbox above it and three charts
 * below. Everything on it carried the same visual weight, so answering "which of these should I
 * buy" meant reading all of it. It is now six blocks, each answering one question:
 *
 *   1. products    — which four am I looking at, and what do they cost
 *   2. controls    — how much of this do I want to see, and where do I want to go
 *   3. differences — what actually separates them            (the scanning, done for the reader)
 *   4. prices      — where is each one cheapest right now    (the site's whole reason to exist)
 *   5. tables      — the evidence: every spec, every shop    (unchanged in content, regrouped)
 *   6. charts + verdict — the shape of the comparison, then why you might pick each one
 *
 * Nothing was dropped to get there. Every row, every offer, every chart the old page rendered is
 * still on this one; what changed is that the answers now come before the evidence instead of
 * being buried inside it.
 *
 * The specifications and the shop prices are two `<table>`s rather than one. They were one table
 * with two very different kinds of section in it — "screen size, by product" and "Zigzag's price,
 * by product" — sharing a heading, a caption and a sort control that only ever applied to half of
 * them. Splitting them gives each its own `<h2>`, its own caption for a screen reader, and lets
 * the sort controls sit in the column headers where `aria-sort` belongs.
 */

/**
 * Clears the sticky site header when a jump link lands on a section.
 *
 * Almost nothing at `short`, where the header does not stick (see SiteShell's `short:relative`)
 * and there is nothing to clear. Reserving the header's height there would spend ~150px of a
 * 375px-tall landscape screen — 40% of the viewport — on blank space above the section the
 * visitor asked to see.
 */
const ANCHOR_OFFSET =
  "scroll-mt-[calc(var(--header-shell-height,132px)+1rem)] short:scroll-mt-4";

const ProductCompareWidget = ({ fixedIds = null }) => {
  const {
    t,
    isFixed,
    editHref,
    products,
    brandLabels,
    seriesColors,
    bars,
    advantages,
    bestOffers,
    keyDifferences,
    radar,
    specSections,
    offersSection,
    collapsedSectionIds,
    toggleSectionCollapsed,
    hasRows,
    sections,
    differingSpecCount,
    onlyDifferences,
    setOnlyDifferences,
    offersSort,
    toggleOffersSort,
    removeProduct,
    clearAll,
    canAddMore,
    addMoreHref,
  } = useComparePresenter(fixedIds);

  /**
   * Both tables, as one block. `CompareStickyHeader` measures this directly rather than a
   * sentinel above it, so the pinned recap of the columns belongs to the tables and leaves the
   * screen with them — it used to hang over the charts and the footer, naming columns of a table
   * that had scrolled away thousands of pixels earlier.
   */
  const tablesRef = useRef(null);

  /**
   * Jump links are real anchors, so they survive with JavaScript off and can be copied out of
   * the address bar; this only upgrades the landing to a smooth one, and only where motion is
   * welcome. `matchMedia` is read at click time rather than cached, because the setting can
   * change while the page is open.
   */
  const jumpTo = useCallback((id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    /** Moves the keyboard's place, not just the viewport — a jump link that only scrolls
        leaves the next Tab back at the top of the page. */
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }, []);

  if (products.length === 0) {
    return <CompareEmptyState t={t} />;
  }

  /** The label column plus one per product; the "add" card lives in the strip, not the table. */
  const columnCount = products.length + 1;
  const canFilter = differingSpecCount > 0;
  const hasComparison = products.length > 1;

  const anchors = [
    { id: "compare-products", labelKey: "comparePage.jump.products" },
    keyDifferences.length > 0
      ? { id: "compare-differences", labelKey: "comparePage.jump.differences" }
      : null,
    { id: "compare-prices", labelKey: "comparePage.jump.prices" },
    specSections.length > 0 ? { id: "compare-specs", labelKey: "comparePage.jump.specs" } : null,
    offersSection ? { id: "compare-shops", labelKey: "comparePage.jump.shops" } : null,
    bars.length > 0 ? { id: "compare-charts", labelKey: "comparePage.jump.charts" } : null,
    hasComparison ? { id: "compare-verdict", labelKey: "comparePage.jump.verdict" } : null,
  ].filter(Boolean);

  const productHeaderCells = (sort, onToggleSort) =>
    products.map((product, index) => (
      <CompareColumnHeader
        key={product.id}
        t={t}
        product={product}
        index={index}
        color={seriesColors[product.id]}
        sort={sort}
        onToggleSort={onToggleSort}
      />
    ));

  /** Repeated under both tables, and only where a column is actually off screen. */
  const scrollHint = hasComparison ? (
    <p className="m-0 text-[11px] text-text-muted md:hidden">{t("comparePage.scrollHint")}</p>
  ) : null;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <CompareStickyHeader
        t={t}
        products={products}
        seriesColors={seriesColors}
        isFixed={isFixed}
        removeProduct={removeProduct}
        blockRef={tablesRef}
      />

      <section id="compare-products" className={`flex flex-col gap-3 ${ANCHOR_OFFSET}`}>
        <h2 className="sr-only">{t("comparePage.strip.heading")}</h2>
        <CompareProductStrip
          t={t}
          products={products}
          brandLabels={brandLabels}
          bestOffers={bestOffers}
          seriesColors={seriesColors}
          isFixed={isFixed}
          removeProduct={removeProduct}
          canAddMore={canAddMore}
          addMoreHref={addMoreHref}
        />
        {/**
         * One product is a product page, not a comparison — every chart and every verdict below
         * needs two columns to say anything. Saying so beats rendering a table with one column
         * and letting the reader work out why the rest of the page is missing.
         */}
        {hasComparison ? null : (
          <p className="m-0 rounded-xl bg-hover-blue px-4 py-3 text-xs text-navy sm:text-sm">
            {t("comparePage.needSecond")}
          </p>
        )}
      </section>

      <CompareControls
        t={t}
        onlyDifferences={onlyDifferences}
        setOnlyDifferences={setOnlyDifferences}
        differingSpecCount={differingSpecCount}
        canFilter={canFilter}
        anchors={anchors}
        onJump={jumpTo}
        isFixed={isFixed}
        editHref={editHref}
        clearAll={clearAll}
      />

      {keyDifferences.length > 0 ? (
        <div id="compare-differences" className={ANCHOR_OFFSET}>
          <CompareKeyDifferences
            t={t}
            differences={keyDifferences}
            products={products}
            seriesColors={seriesColors}
            differingSpecCount={differingSpecCount}
            canFilter={canFilter}
            onShowDifferences={() => {
              setOnlyDifferences(true);
              jumpTo("compare-specs");
            }}
          />
        </div>
      ) : null}

      <div id="compare-prices" className={ANCHOR_OFFSET}>
        <CompareBestPrices
          t={t}
          bestOffers={bestOffers}
          products={products}
          seriesColors={seriesColors}
        />
      </div>

      {/**
       * `data-compare-tables` is the anchor `CompareStickyHeader` is measured against, and the
       * one `scripts/verify-responsive.mjs` looks for: the strip now spans two tables, so a check
       * that found "the table" with `querySelector("table")` would call the strip stale the
       * moment the specifications ended, while the shop prices it also labels were still on
       * screen.
       */}
      <div ref={tablesRef} data-compare-tables className="flex flex-col gap-6 md:gap-8">
        {specSections.length > 0 ? (
          <section
            id="compare-specs"
            aria-labelledby="compare-specs-heading"
            className={`${SURFACE} ${SECTION_PAD} flex flex-col gap-4 ${ANCHOR_OFFSET}`}
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="flex flex-col gap-1.5">
                <h2 id="compare-specs-heading" className={SECTION_HEADING}>
                  {t("comparePage.specs.heading")}
                </h2>
                <p className={SECTION_SUBHEADING}>{t("comparePage.specs.intro")}</p>
              </div>
              {scrollHint}
            </div>
            {/**
             * The bordered frame is a sibling of the card's padding, not the card itself: the
             * table has to run edge to edge inside its own scroller for the sticky label column
             * to reach the frame's left edge, and `-mx-*` gives it back the padding the card
             * takes away.
             */}
            <div className="-mx-4 overflow-hidden border-y border-border-blue md:-mx-6 md:rounded-xl md:border-x">
              <CompareTable
                t={t}
                captionKey="comparePage.specs.tableCaption"
                sections={specSections}
                columnCount={columnCount}
                renderHeaderCells={() => productHeaderCells()}
                collapsedSectionIds={collapsedSectionIds}
                onToggleSection={toggleSectionCollapsed}
                idPrefix="compare-specs"
              />
            </div>
          </section>
        ) : null}

        {offersSection ? (
          <section
            id="compare-shops"
            aria-labelledby="compare-shops-heading"
            className={`${SURFACE} ${SECTION_PAD} flex flex-col gap-4 ${ANCHOR_OFFSET}`}
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="flex flex-col gap-1.5">
                <h2 id="compare-shops-heading" className={SECTION_HEADING}>
                  {t("comparePage.sections.offers")}
                </h2>
                <p className={SECTION_SUBHEADING}>{t("comparePage.shops.intro")}</p>
              </div>
              {scrollHint}
            </div>
            <div className="-mx-4 overflow-hidden border-y border-border-blue md:-mx-6 md:rounded-xl md:border-x">
              <CompareTable
                t={t}
                captionKey="comparePage.shops.tableCaption"
                sections={[offersSection]}
                columnCount={columnCount}
                renderHeaderCells={() => productHeaderCells(offersSort, toggleOffersSort)}
                showSectionHeadings={false}
                idPrefix="compare-shops"
              />
            </div>
          </section>
        ) : null}
      </div>

      {hasRows && sections.length === 0 ? (
        <p className="m-0 rounded-xl bg-subtle-bg px-4 py-6 text-center text-xs text-text-muted sm:text-sm">
          {t("comparePage.noDifferences")}
        </p>
      ) : null}

      {/**
       * Shape first, then numbers: the radar summarises what the bars beside it quantify, and
       * both are drawn from the same values the tables above already listed.
       */}
      {bars.length > 0 || radar.axes.length > 0 ? (
        <div id="compare-charts" className={`flex flex-col gap-6 md:gap-8 ${ANCHOR_OFFSET}`}>
          <CompareRadar t={t} radar={radar} products={products} seriesColors={seriesColors} />
          <CompareBars t={t} bars={bars} products={products} seriesColors={seriesColors} />
        </div>
      ) : null}

      {hasComparison ? (
        <div id="compare-verdict" className={ANCHOR_OFFSET}>
          <CompareAdvantages
            t={t}
            products={products}
            advantages={advantages}
            seriesColors={seriesColors}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ProductCompareWidget;
