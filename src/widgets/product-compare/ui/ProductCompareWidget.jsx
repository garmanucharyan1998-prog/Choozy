import { FaPlus, FaTimes } from "react-icons/fa";
import { useComparePresenter } from "features/product-compare";
import { PRODUCT_IMAGE_HEIGHT, PRODUCT_IMAGE_WIDTH } from "entities/product";
import { LocalizedLink } from "shared/ui/link";
import { CompareEmptyState } from "./CompareEmptyState";

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
 */

const CELL = "px-3 py-3 text-sm md:px-4 md:text-base";
const LABEL_CELL = `${CELL} sticky left-0 z-10 bg-white text-start font-semibold text-navy`;
const SECTION_CELL = "bg-subtle-bg px-3 py-2 text-start text-xs font-bold uppercase tracking-wide text-text-muted md:px-4";

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

  if (products.length === 0) {
    return <CompareEmptyState t={t} />;
  }

  const showAddColumn = canAddMore && !isFixed;
  const columnCount = products.length + (showAddColumn ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
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
            className="rounded-lg px-3 py-2 text-sm font-semibold text-link-blue no-underline transition-colors hover:bg-hover-blue"
          >
            {t("comparePage.editComparison")}
          </LocalizedLink>
        ) : (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-link-blue transition-colors hover:bg-hover-blue"
          >
            {t("comparePage.clearAll")}
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-blue bg-white">
        <table className="w-full min-w-[640px] border-collapse text-start">
          <caption className="sr-only">{t("comparePage.tableCaption")}</caption>
          <thead>
            <tr className="border-b border-border-blue">
              <th scope="col" className={`${LABEL_CELL} w-40 md:w-56`}>
                <span className="sr-only">{t("comparePage.rowLabelHeader")}</span>
              </th>
              {products.map((product) => (
                <th
                  scope="col"
                  key={product.id}
                  className={`${CELL} min-w-[9rem] align-top md:min-w-[12rem]`}
                >
                  <div className="flex flex-col items-start gap-2">
                    <img
                      src={product.image}
                      alt={product.title}
                      width={PRODUCT_IMAGE_WIDTH}
                      height={PRODUCT_IMAGE_HEIGHT}
                      loading="lazy"
                      className="h-24 w-full rounded-lg object-cover md:h-28"
                    />
                    <LocalizedLink
                      to={product.href}
                      className="line-clamp-3 text-sm font-semibold text-navy no-underline hover:underline"
                    >
                      {product.title}
                    </LocalizedLink>
                    {isFixed ? null : (
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-navy"
                      >
                        <FaTimes className="h-3 w-3" aria-hidden />
                        {t("comparePage.remove")}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {showAddColumn ? (
                <th scope="col" className={`${CELL} min-w-[9rem] align-top md:min-w-[12rem]`}>
                  <LocalizedLink
                    to={addMoreHref}
                    className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-blue text-sm font-semibold text-link-blue no-underline transition-colors hover:bg-hover-blue md:h-28"
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
                    <td key={cell.productId} className={`${CELL} align-top text-navy`}>
                      <span className={cell.isLowest ? "font-semibold text-link-blue" : undefined}>
                        {cell.text}
                      </span>
                      {/**
                       * Colour alone would not carry this. The note is per column — the
                       * cheapest shop for *this* product, never a verdict between products.
                       */}
                      {cell.isLowest ? (
                        <span className="block text-xs font-normal text-text-muted">
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
        <p className="m-0 rounded-xl bg-subtle-bg px-4 py-6 text-center text-sm text-text-muted">
          {t("comparePage.noDifferences")}
        </p>
      ) : null}
    </div>
  );
};

export default ProductCompareWidget;
