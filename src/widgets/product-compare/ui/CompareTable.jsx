import { FaCheck, FaChevronDown } from "react-icons/fa";
import {
  CELL,
  LABEL_CELL,
  PRODUCT_COL_DIVIDER,
  SECTION_ROW_CELL,
  SECTION_ROW_LABEL,
  TABLE,
  TABLE_SCROLLER,
  FOCUS_RING,
} from "./compareStyles";

/**
 * The comparison grid itself, used twice on the page: once for the specifications and once for
 * the shop prices. One component rather than two, because the two tables have to agree on
 * column widths to the pixel — they sit one above the other and a reader tracks a product
 * straight down through both.
 *
 * A real `<table>`, not a grid of divs: the relationship between "Screen size" and "6.7″" is the
 * entire content of this page, and only a table with `scope`d headers carries it to a screen
 * reader. Row headers are `<th scope="row">`, product headers `<th scope="col">`, and each
 * section gets its own `<tbody>` under a spanning heading row.
 *
 * Width is handled by scrolling the table inside its own container rather than by shrinking the
 * columns — four products at a readable type size do not fit a phone, and the label column is
 * pinned so a scrolled-away row never loses its name.
 */

/**
 * Holds a spanning section heading against the left edge while the table scrolls under it.
 *
 * Row labels pin because `LABEL_CELL` is `sticky left-0`, but a section heading is one cell
 * spanning the whole table, which cannot pin *as a cell* — it is already as wide as the table.
 * So its contents pin instead. Without this, a visitor two columns deep on a phone could read
 * every row's name and no longer see which section those rows belonged to.
 *
 * `inline-flex` (rather than the default inline) because sticky offsets are not defined for a
 * non-replaced inline box, and `left-3 md:left-4` rather than `left-0` so the pinned heading
 * keeps the cell's own horizontal padding and stays on the same vertical line as the row labels
 * beneath it.
 */
const PINNED_SECTION_LABEL = "sticky left-3 inline-flex max-w-full items-center gap-2 md:left-4";

/**
 * One section's heading row. Collapsible sections render it as a disclosure button, which is the
 * only interactive thing inside the table body — the sort controls live in the shop-price
 * table's own `<thead>`, where `aria-sort` belongs and where a reader looks for them.
 */
const SectionHeadingRow = ({
  t,
  section,
  columnCount,
  bodyId,
  isCollapsible,
  isCollapsed,
  onToggle,
}) => {
  const label = t(section.labelKey);

  return (
    <tr>
      <th scope="colgroup" colSpan={columnCount} className={SECTION_ROW_CELL}>
        <span className={PINNED_SECTION_LABEL}>
          {isCollapsible ? (
            <button
              type="button"
              onClick={() => onToggle(section.id)}
              aria-expanded={!isCollapsed}
              aria-controls={bodyId}
              /** `-my-1 py-1` reaches a 24px target inside an 11px band without moving the row. */
              className={`-my-1 inline-flex items-center gap-2 rounded py-1 text-start transition-colors hover:text-link-blue ${FOCUS_RING}`}
            >
              <FaChevronDown
                className={`h-2.5 w-2.5 shrink-0 text-text-muted transition-transform duration-200 motion-reduce:transition-none ${
                  isCollapsed ? "-rotate-90" : ""
                }`}
                aria-hidden
              />
              <span className={SECTION_ROW_LABEL}>{label}</span>
              <span className="text-[10px] font-medium tabular-nums text-text-muted sm:text-[11px]">
                {section.rows.length}
              </span>
            </button>
          ) : (
            <span className={SECTION_ROW_LABEL}>{label}</span>
          )}
        </span>
      </th>
    </tr>
  );
};

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   captionKey: string,
 *   sections: { id: string, kind: string, labelKey: string, rows: object[] }[],
 *   columnCount: number — product columns plus the label column plus any trailing add column.
 *   scrollerRef?: import("react").RefObject<HTMLElement>,
 *   renderHeaderCells: () => import("react").ReactNode — everything after the label header cell.
 *   collapsedSectionIds?: Set<string>,
 *   onToggleSection?: (sectionId: string) => void,
 *   showSectionHeadings?: boolean — false for the shop-price table, whose one section is already
 *     named by the `<h2>` above it; a heading row there would say the same words twice.
 *   idPrefix: string — namespaces the `aria-controls` ids, since the page renders two tables.
 * }} props
 */
export const CompareTable = ({
  t,
  captionKey,
  sections,
  columnCount,
  scrollerRef,
  renderHeaderCells,
  collapsedSectionIds,
  onToggleSection,
  showSectionHeadings = true,
  idPrefix,
}) => (
  <div ref={scrollerRef} className={TABLE_SCROLLER}>
    <table className={TABLE}>
      <caption className="sr-only">{t(captionKey)}</caption>
      <thead>
        <tr className="border-b border-border-blue">
          <th scope="col" className={`${LABEL_CELL} align-bottom`}>
            <span className="sr-only">{t("comparePage.rowLabelHeader")}</span>
          </th>
          {renderHeaderCells()}
        </tr>
      </thead>

      {sections.map((section) => {
        const bodyId = `${idPrefix}-${section.id}`;
        const isCollapsible = showSectionHeadings && Boolean(onToggleSection);
        const isCollapsed = isCollapsible && Boolean(collapsedSectionIds?.has(section.id));

        return (
          <tbody key={section.id} id={bodyId}>
            {showSectionHeadings ? (
              <SectionHeadingRow
                t={t}
                section={section}
                columnCount={columnCount}
                bodyId={bodyId}
                isCollapsible={isCollapsible}
                isCollapsed={isCollapsed}
                onToggle={onToggleSection}
              />
            ) : null}
            {/**
             * Collapsed rows are *not rendered*, rather than hidden with a class. A `display:none`
             * row is still in the accessibility tree's reach in ways that differ between screen
             * readers, and "show differences only" already established that this table adds and
             * removes rows rather than dimming them.
             */}
            {isCollapsed
              ? null
              : section.rows.map((row) => (
                  <tr key={row.labelKey} className="group border-t border-border-blue/60">
                    {/**
                     * The label cell repeats the row's hover tint: it is `sticky` with an opaque
                     * background (it has to be — the columns scroll under it), so a hover applied
                     * to the `<tr>` alone would stop dead at the column's edge.
                     */}
                    <th
                      scope="row"
                      className={`${LABEL_CELL} transition-colors group-hover:bg-subtle-bg`}
                    >
                      {t(row.labelKey)}
                    </th>
                    {row.cells.map((cell) => (
                      <td
                        key={cell.productId}
                        className={`${CELL} ${PRODUCT_COL_DIVIDER} align-top tabular-nums transition-colors ${
                          cell.isBest ? "bg-emerald-50/70" : "group-hover:bg-subtle-bg"
                        }`}
                      >
                        <span
                          className={
                            cell.isBest || cell.isLowest
                              ? "font-bold text-navy"
                              : "font-normal text-text-dark"
                          }
                        >
                          {/**
                           * Never colour alone: the check carries the win for anyone who cannot
                           * see the tint, and the `sr-only` text for anyone who can see neither.
                           */}
                          {cell.isBest || cell.isLowest ? (
                            <FaCheck
                              className="mr-1 inline h-2.5 w-2.5 align-baseline text-emerald-600"
                              aria-hidden
                            />
                          ) : null}
                          {cell.text}
                          {cell.isBest ? (
                            <span className="sr-only"> — {t("comparePage.bestValue")}</span>
                          ) : null}
                          {/**
                           * Per column, never across them: the cheapest shop for *this* product.
                           * It is not a verdict between products, and used to print a whole extra
                           * line of copy under a dozen cells to say so.
                           */}
                          {cell.isLowest ? (
                            <span className="sr-only"> — {t("comparePage.lowestPrice")}</span>
                          ) : null}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        );
      })}
    </table>
  </div>
);

export default CompareTable;
