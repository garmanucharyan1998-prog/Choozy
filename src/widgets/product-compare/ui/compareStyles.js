/**
 * The comparison page's own token layer.
 *
 * These are class strings rather than CSS custom properties because everything they express —
 * a cell's padding, a column's width, a surface's border — is already a Tailwind scale the rest
 * of the site is built on, and a second parallel vocabulary would be one more thing to keep in
 * sync. What they buy is that the two tables on the page (specifications, shop prices) are
 * literally the same table: same column widths, same sticky label, same type ramp. Two tables
 * that agree to within a pixel read as one interface; two that drift by three read as a bug.
 *
 * The one genuinely new idea here is the surface scale. The page went from "everything is a
 * white card with the same border" to three deliberate levels:
 *   SURFACE       — a section the reader is meant to stop at (key differences, prices, verdict)
 *   SURFACE_QUIET — supporting structure that should recede (a table's frame, a group panel)
 *   SURFACE_INSET — something sitting inside another surface (a metric panel, an offer chip)
 * Depth is carried by background and border, never by a shadow, except where an element genuinely
 * floats above the page (the pinned strip).
 */

/** Radius scale — one step per surface level, so nesting reads as nesting. */
export const RADIUS = "rounded-2xl";
export const RADIUS_INNER = "rounded-xl";

export const SURFACE = `${RADIUS} border border-border-blue bg-white`;
export const SURFACE_QUIET = `${RADIUS} border border-border-blue bg-white`;
export const SURFACE_INSET = `${RADIUS_INNER} bg-subtle-bg`;

/** Section padding, shared by every card on the page so their contents line up across a gap. */
export const SECTION_PAD = "p-4 md:p-6";

/**
 * A section's own heading. `text-base` on a phone rather than `text-lg`: four of these stack down
 * a 5,000px page, and a heading that is only slightly larger than the copy under it separates
 * sections just as well as one that shouts.
 */
export const SECTION_HEADING = "m-0 text-base font-bold text-navy sm:text-lg md:text-xl";
export const SECTION_SUBHEADING = "m-0 text-xs leading-relaxed text-text-muted sm:text-sm";

/* ------------------------------------------------------------------ table */

/**
 * `table-fixed` (mobile) is load-bearing, not decoration: under the default `table-layout: auto`
 * a single unbreakable long word (Armenian row labels routinely are — e.g. "Թարմացման
 * հաճախականություն") forces its whole column to grow to fit it, since `width` is only a hint
 * under `auto`. That blew the label column out and pushed the product columns off the screen.
 * Fixed layout makes column widths authoritative. Desktop reverts to `auto`, which never
 * exhibited the bug and distributes leftover width more gracefully at 1440px and beyond.
 */
export const TABLE = "w-full table-fixed border-collapse text-start md:table-auto";

export const CELL = "px-3 py-3 text-xs break-words sm:text-sm md:px-4 md:text-base";

/**
 * The row-label column, and the one place on the page where a few pixels decide whether the copy
 * is readable.
 *
 * It was `w-24` (96px) with the same `px-3 text-xs` as every other cell, which left an 80px
 * content box for 12px Armenian. Measured against the actual dictionary, "Կատեգորիա" needs 85px
 * on one line and "Հիշողություն:" needs 91 — both single words, so the browser had nowhere to
 * break them but *through a letter*, and every phone rendered "Կատեգորի / ա".
 *
 * 108px of column with 8px of padding is a 92px content box, and 11px type puts every
 * single-word label in the catalog's spec set inside it. Compounds like
 * "հաճախականություն:" (17 letters, ~128px at this size) still break mid-word — no mobile column
 * can hold them — but they are now the exception rather than half the table.
 *
 * Deliberately **not** built from `CELL`: `text-[11px]` and `CELL`'s own `text-xs` are the same
 * specificity, so which one won came down to Tailwind's output order, and it was the 12px one.
 */
export const LABEL_COL_WIDTH = "w-[6.75rem] md:w-56";
export const LABEL_CELL = `${LABEL_COL_WIDTH} sticky left-0 z-10 break-words bg-white px-2 py-3 text-start text-[11px] font-semibold leading-snug text-navy sm:text-sm md:px-4 md:text-base`;

/**
 * Sized so exactly two product columns fit beside the label column at a 360px viewport — a phone
 * showing 1.4 columns invites a swipe that lands nowhere. A real `width` (not `min-width`): under
 * `table-fixed` only the former is authoritative. 108 + 116 + 116 = 340, which is exactly the
 * width the scroller gets inside a 360px viewport.
 *
 * The table carries no `min-width` for the same reason: under `table-fixed` a min-width larger
 * than the declared columns is redistributed across them proportionally, which on a two-product
 * pair page inflated all three columns until only one product fitted on screen — the exact
 * opposite of what a page called "X vs Y" is for.
 */
export const PRODUCT_COL_WIDTH = "w-[7.25rem] md:w-[12rem]";

/**
 * The rule between two products.
 *
 * A comparison table is read across a row and down a column in equal measure, and with only
 * horizontal rules the columns had nothing but alignment holding them apart — four headers sat
 * in one undivided band and read as a single strip of names. It goes on the *start* edge of
 * every product cell, so the first rule also separates the products from the sticky label
 * column, and the last column ends flush with the table.
 *
 * `/60` rather than the full border colour: enough to track a column, not enough to compete
 * with the horizontal rules that separate the rows a reader is actually comparing.
 */
export const PRODUCT_COL_DIVIDER = "border-s border-border-blue/60";

export const PRODUCT_COL = `${CELL} ${PRODUCT_COL_WIDTH} ${PRODUCT_COL_DIVIDER} snap-start align-top`;

/**
 * The scroller. `relative` is load-bearing: `sr-only` is `position: absolute`, and an absolutely
 * positioned element anchors to its nearest *positioned* ancestor — `overflow-x: auto` clips but
 * does not position. Without this the winner cells' sr-only text escaped the scroller entirely,
 * anchored to the document at the column's scrolled-out x, and gave the whole page 55px of
 * horizontal scroll on a 360px phone.
 *
 * `scroll-pl-*` is load-bearing too, and matches `LABEL_COL_WIDTH` exactly. The snapport starts
 * at the scroller's left edge, but the first 108px of that edge is permanently covered by the
 * `sticky left-0` label column. So the first product column's `snap-start` resolved to
 * scrollLeft=108 and the browser snapped there on load — parking product one underneath the
 * opaque label column on every phone width, with its photo, its title link and its Remove button
 * all unreachable. Insetting the snapport by the sticky column's width makes "aligned to the
 * start" mean "aligned to the first uncovered pixel", which is what the snap points were for.
 */
export const TABLE_SCROLLER =
  "compare-scroller relative overflow-x-auto snap-x snap-proximity scroll-pl-[6.75rem] md:scroll-pl-56";

/**
 * A section heading row inside a table.
 *
 * No `uppercase`: Tailwind's text-transform runs on the rendered string, and Armenian's `և`
 * uppercases to the archaic `ԵՒ` instead of `ԵՎ` — silent for the current section labels (none
 * contain it yet) but a trap for the next one that does.
 */
export const SECTION_ROW_CELL =
  "border-y border-border-blue bg-subtle-bg px-3 py-2 text-start md:px-4";
export const SECTION_ROW_LABEL =
  "text-[11px] font-bold tracking-wide text-navy sm:text-xs md:text-sm";

/* ------------------------------------------------------------- interactive */

/** One focus treatment for every control on the page, so nothing is reachable but invisible. */
export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-blue";

/**
 * The page's primary control shape. A 24px minimum tap target is met by padding rather than by a
 * min-height, so a control that grows (a longer Armenian label) grows symmetrically.
 */
export const CONTROL =
  `inline-flex items-center justify-center gap-2 ${RADIUS_INNER} border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${FOCUS_RING}`;
export const CONTROL_IDLE = "border-border-blue bg-white text-navy hover:bg-hover-blue";
export const CONTROL_ACTIVE = "border-navy bg-navy text-white hover:bg-navy";

/** A small non-interactive label: a badge, a count, a unit. */
export const PILL =
  "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold leading-tight sm:text-xs";
export const PILL_NEUTRAL = `${PILL} bg-subtle-bg text-text-muted`;
export const PILL_ACCENT = `${PILL} bg-hover-blue text-link-blue`;
/**
 * The one green on the page, and the reason it stays meaningful: it marks a measured advantage
 * (a winning value, the lowest price) and nothing else. Every other kind of emphasis — a
 * selected control, a link, an active state — uses the brand blue.
 */
export const PILL_POSITIVE = `${PILL} bg-emerald-50 text-emerald-700`;
