import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { OFFER_SORT_DIRECTIONS } from "entities/product-compare";
import { LocalizedLink } from "shared/ui/link";
import { ProductCardImage } from "shared/ui/product-card-image";
import { CompareSeriesToken } from "./CompareSeriesToken";
import { FOCUS_RING, PRODUCT_COL } from "./compareStyles";

/**
 * A product's column header inside a table — compact on purpose.
 *
 * The rich card for this product is in the strip at the top of the page; repeating it here would
 * mean a 116px-wide column trying to hold a photo, a brand, a price and two badges, which is how
 * the old header ended up as three lines of clipped Armenian. What a column header has to do is
 * narrower: say which product this column is, in a way that survives being scrolled to and
 * glanced at. That is the numbered token, a thumbnail, and the title.
 *
 * `align-bottom` on the cell, not `align-top`: titles run to one or two lines depending on the
 * product, and bottom alignment keeps the thumbnails on one line and the first data row directly
 * under all of them.
 */

/**
 * The per-column sort control for the shop-price table. It sits in the column header rather than
 * in a section heading row because that is where `aria-sort` is defined to live, and because a
 * reader looking for "sort by this column" looks at the column.
 *
 * The accessible name names the product: four columns otherwise mean four buttons whose entire
 * accessible name is the same three words. Composed here because `t()` does no interpolation, and
 * a product title is not dictionary copy anyway.
 */
const SortButton = ({ t, product, sort, onToggle }) => {
  const isSorted = sort.productId === product.id;
  const isAscending = sort.direction === OFFER_SORT_DIRECTIONS.ASC;
  const Icon = isSorted ? (isAscending ? FaSortUp : FaSortDown) : FaSort;
  const label = `${t("comparePage.sortByPrice")} — ${product.title}`;

  return (
    <button
      type="button"
      onClick={() => onToggle(product.id)}
      title={label}
      aria-label={label}
      /**
       * A bordered pill rather than a bare glyph. The control used to be an unlabelled 14px
       * arrow in a grey band and read as decoration; a 116px column has no room for the word
       * "sort", so the affordance has to come from the shape.
       */
      className={`inline-flex items-center justify-center rounded-lg border p-1.5 transition-colors hover:bg-hover-blue hover:text-navy ${FOCUS_RING} ${
        isSorted ? "border-link-blue text-link-blue" : "border-border-blue text-text-muted"
      }`}
    >
      <Icon className="h-3 w-3" aria-hidden />
    </button>
  );
};

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   product: { id: string, title: string, image: string, href: string },
 *   index: number,
 *   color: string,
 *   sort?: { productId: string | null, direction: string },
 *   onToggleSort?: (productId: string) => void,
 * }} props
 */
export const CompareColumnHeader = ({ t, product, index, color, sort, onToggleSort }) => {
  const isSortable = Boolean(onToggleSort);
  const isSorted = isSortable && sort.productId === product.id;

  return (
    <th
      scope="col"
      /**
       * A tinted panel per product, not one undivided band.
       *
       * Four headers sharing a white background read as a single strip of names with nothing but
       * alignment saying which thumbnail belonged to which title. The tint gives each column a
       * body, and `PRODUCT_COL`'s start-edge rule gives it an edge; together they say "this is
       * one product's column" before a word is read. Kept at `/60` so it stays quieter than the
       * emerald a winning cell uses further down — a header is structure, not a result.
       */
      className={`${PRODUCT_COL} bg-subtle-bg/60 align-bottom`}
      aria-sort={
        isSortable
          ? isSorted
            ? sort.direction === OFFER_SORT_DIRECTIONS.ASC
              ? "ascending"
              : "descending"
            : "none"
          : undefined
      }
    >
      {/** Centred, so the thumbnail sits over the column of values it belongs to. */}
      <div className="flex flex-col items-center gap-2 text-center">
        {/**
         * The size lives on a wrapper, not on `ProductCardImage`'s own class list.
         * `.product-card-image--compare` declares `width: 100%` at the same specificity as a
         * Tailwind `w-12`, so which one wins comes down to stylesheet order — which it did, and
         * the thumbnail rendered at the full 200px column width. A wrapper is not a preference,
         * it is the only version of this that cannot silently flip during a build.
         *
         * The white tile is what makes the photo survive the tinted header: these are cut-outs
         * on white, and dropping them straight onto the tint left each one sitting in a faint
         * grey box of its own edges.
         */}
        <span className="block w-12 rounded-lg bg-white p-1 md:w-14">
          <ProductCardImage variant="compare" src={product.image} alt="" />
        </span>
        <span className="flex items-center justify-center gap-1.5">
          <CompareSeriesToken index={index} color={color} />
          {/**
           * `min-h-6` for the 24px tap target, NOT `py-1 -my-1`.
           *
           * Padding on a line-clamped element is a hole in the clip. `-webkit-line-clamp`
           * truncates at the *content* box while `overflow: hidden` clips at the *padding* box,
           * so bottom padding is a window the next line is painted through. Measured at 780px on
           * a long title: three laid-out lines, two shown, and a 3px slice of the third bleeding
           * into the 4px bottom padding — two clean lines followed by the tops of letters. It is
           * invisible at 1024px, where the same title fits in two lines, which is why it survived
           * every sweep. A minimum height buys the same target and leaves the clip box alone.
           */}
          <LocalizedLink
            to={product.href}
            className={`line-clamp-2 min-h-6 text-[11px] font-semibold leading-snug text-navy no-underline hover:underline sm:text-xs md:text-sm ${FOCUS_RING}`}
          >
            {product.title}
          </LocalizedLink>
        </span>
        {isSortable ? (
          <SortButton t={t} product={product} sort={sort} onToggle={onToggleSort} />
        ) : null}
      </div>
    </th>
  );
};

export default CompareColumnHeader;
