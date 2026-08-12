import { useRef } from "react";
import { FaCheck, FaPlus, FaTimes } from "react-icons/fa";
import { useComparePresenter } from "features/product-compare";
import { LocalizedLink } from "shared/ui/link";
import { ProductCardImage } from "shared/ui/product-card-image";
import { CompareAdvantages } from "./CompareAdvantages";
import { CompareBars } from "./CompareBars";
import { CompareEmptyState } from "./CompareEmptyState";
import { CompareStickyHeader } from "./CompareStickyHeader";

/**
 * The comparison table.
 *
 * A real `<table>`, not a grid of divs: the relationship between "Screen size" and "14.2″" is
 * the entire content of this page, and only a table with `scope`d headers carries it to a
 * screen reader. Row headers are `<th scope="row">`, product headers `<th scope="col">`, and
 * each section gets its own `<tbody>` under a spanning heading row.
 *
 * Width is handled by scrolling the table inside its own container rather than by shrinking
 * the columns — four products at a readable type size do not fit a phone, and the label column
 * is pinned so a scrolled-away row never loses its name.
 *
 * `table-fixed` (mobile) is load-bearing, not decoration: under the default `table-layout: auto`
 * a single unbreakable long word (Armenian row labels routinely are — e.g. "Թարմացման
 * հաճախականություն") forces its whole column to grow to fit it, since `width` is only a hint
 * under `auto`. That blew the label column from 96px out to ~190px and pushed the two product
 * columns off past the edge of the screen. Fixed layout makes column widths authoritative, and
 * `break-words` lets the same long labels wrap onto a second line instead of overflowing the now
 * non-negotiable column box. Desktop reverts to `auto` since it never exhibited the bug and auto
 * layout is more forgiving there.
 */

const CELL = "px-3 py-3 text-xs break-words sm:text-sm md:px-4 md:text-base";
const LABEL_CELL = `${CELL} sticky left-0 z-10 w-24 bg-white text-start font-semibold text-navy md:w-56`;
/**
 * Sized so exactly two product columns fit next to the (narrower, on mobile) label column at
 * a 360px viewport — a phone showing 1.4 columns invites a swipe that lands nowhere. A real
 * `width` (not `min-width`): under `table-fixed` only the former is authoritative.
 */
const PRODUCT_COL = `${CELL} w-[7.75rem] snap-start align-top md:w-[12rem]`;
/**
 * No `uppercase`: Tailwind's text-transform runs on the rendered string, and Armenian's `և`
 * uppercases to the archaic `ԵՒ` instead of `ԵՎ` — silent for the current section labels
 * (none contain it yet) but a trap for the next one that does. Section labels already read
 * as intended sentence case from the dictionary.
 */
const SECTION_CELL =
  "bg-subtle-bg px-3 py-2 text-start text-[11px] font-bold tracking-wide text-text-muted sm:text-xs md:px-4 md:text-sm";

/**
 * @param {{ fixedIds?: string[] }} props — supplied by `/compare/<a>-vs-<b>`, which shows one
 *   specific pair at one indexable address and so offers no column editing; it links out to
 *   `/compare?ids=…` for that instead.
 */
const ProductCompareWidget = ({ fixedIds = null }) => {
  const {
    t,
    isFixed,
    editHref,
    products,
    seriesColors,
    bars,
    advantages,
    sections,
    hasRows,
    differingRowCount,
    onlyDifferences,
    toggleOnlyDifferences,
    removeProduct,
    clearAll,
    canAddMore,
    addMoreHref,
  } = useComparePresenter(fixedIds);
  const tableTopRef = useRef(null);

  if (products.length === 0) {
    return <CompareEmptyState t={t} />;
  }

  const showAddColumn = canAddMore && !isFixed;
  const columnCount = products.length + (showAddColumn ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <CompareStickyHeader
        t={t}
        products={products}
        isFixed={isFixed}
        removeProduct={removeProduct}
        sentinelRef={tableTopRef}
      />
      <div ref={tableTopRef} aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-navy sm:text-sm">
          <input
            type="checkbox"
            checked={onlyDifferences}
            onChange={toggleOnlyDifferences}
            className="h-4 w-4 accent-navy"
            /** Disabled rather than hidden: its absence would look like a missing feature. */
            disabled={differingRowCount === 0}
          />
          {t("comparePage.onlyDifferences")}
        </label>
        {isFixed ? (
          <LocalizedLink
            to={editHref}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-link-blue no-underline transition-colors hover:bg-hover-blue sm:text-sm"
          >
            {t("comparePage.editComparison")}
          </LocalizedLink>
        ) : (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-link-blue transition-colors hover:bg-hover-blue sm:text-sm"
          >
            {t("comparePage.clearAll")}
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-blue bg-white snap-x snap-proximity">
        <table className="w-full min-w-[500px] table-fixed border-collapse text-start md:table-auto">
          <caption className="sr-only">{t("comparePage.tableCaption")}</caption>
          <thead>
            <tr className="border-b border-border-blue">
              <th scope="col" className={LABEL_CELL}>
                <span className="sr-only">{t("comparePage.rowLabelHeader")}</span>
              </th>
              {products.map((product) => (
                <th scope="col" key={product.id} className={PRODUCT_COL}>
                  <div className="flex flex-col items-start gap-2">
                    <ProductCardImage variant="compare" src={product.image} alt={product.title} />
                    <LocalizedLink
                      to={product.href}
                      className="line-clamp-3 text-xs font-semibold text-navy no-underline hover:underline sm:text-sm"
                    >
                      {product.title}
                    </LocalizedLink>
                    {isFixed ? null : (
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted transition-colors hover:text-navy sm:text-xs"
                      >
                        <FaTimes className="h-3 w-3" aria-hidden />
                        {t("comparePage.remove")}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {showAddColumn ? (
                <th scope="col" className={PRODUCT_COL}>
                  <LocalizedLink
                    to={addMoreHref}
                    className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-blue text-xs font-semibold text-link-blue no-underline transition-colors hover:bg-hover-blue sm:text-sm"
                  >
                    <FaPlus className="h-4 w-4" aria-hidden />
                    {t("comparePage.addMore")}
                  </LocalizedLink>
                </th>
              ) : null}
            </tr>
          </thead>

          {sections.map((section) => (
            <tbody key={section.id}>
              <tr>
                <th scope="colgroup" colSpan={columnCount + 1} className={SECTION_CELL}>
                  {t(section.labelKey)}
                </th>
              </tr>
              {section.rows.map((row) => (
                <tr key={row.labelKey} className="border-t border-border-blue/60">
                  <th scope="row" className={LABEL_CELL}>
                    {t(row.labelKey)}
                  </th>
                  {row.cells.map((cell) => (
                    <td
                      key={cell.productId}
                      className={`${CELL} align-top text-navy ${cell.isBest ? "bg-emerald-50" : ""}`}
                    >
                      <span
                        className={
                          cell.isLowest || cell.isBest ? "font-semibold text-link-blue" : undefined
                        }
                      >
                        {/**
                         * Never colour alone: a checkmark carries the win for anyone who can't
                         * see the green background, and `sr-only` text carries it for anyone
                         * who can't see either.
                         */}
                        {cell.isBest ? (
                          <FaCheck className="mr-1 inline h-3 w-3 text-emerald-600" aria-hidden />
                        ) : null}
                        {cell.text}
                        {cell.isBest ? (
                          <span className="sr-only"> — {t("comparePage.bestValue")}</span>
                        ) : null}
                      </span>
                      {/**
                       * Colour alone would not carry this either. The note is per column — the
                       * cheapest shop for *this* product, never a verdict between products.
                       */}
                      {cell.isLowest ? (
                        <span className="block text-[11px] font-normal text-text-muted sm:text-xs">
                          {t("comparePage.lowestPrice")}
                        </span>
                      ) : null}
                    </td>
                  ))}
                  {showAddColumn ? <td className={CELL} /> : null}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {hasRows && sections.length === 0 ? (
        <p className="m-0 rounded-xl bg-subtle-bg px-4 py-6 text-center text-xs text-text-muted sm:text-sm">
          {t("comparePage.noDifferences")}
        </p>
      ) : null}

      <CompareBars t={t} bars={bars} products={products} seriesColors={seriesColors} />
      <CompareAdvantages t={t} products={products} advantages={advantages} seriesColors={seriesColors} />
    </div>
  );
};

export default ProductCompareWidget;
