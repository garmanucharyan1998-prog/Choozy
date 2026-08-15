import { FaPlus, FaStar, FaTimes } from "react-icons/fa";
import { LocalizedLink } from "shared/ui/link";
import { ProductCardImage } from "shared/ui/product-card-image";
import { CompareSeriesToken } from "./CompareSeriesToken";
import { FOCUS_RING, PILL_NEUTRAL, PILL_POSITIVE, RADIUS, SURFACE } from "./compareStyles";

/**
 * The products being compared, as cards — the first thing on the page after the title, and the
 * answer to "which four am I looking at" that the table underneath cannot give at a glance.
 *
 * These used to be the table's own `<thead>`, and that is why they could never be more than a
 * photo, a wrapped title and a Remove link: on a phone a column is 116px wide, which is enough
 * for an identity and not enough for a decision. Lifting them out of the scroller buys each card
 * 208px on the same phone, room for the price, the number of shops quoting it and its rating —
 * the three facts a visitor actually weighs — while the table keeps a compact column header.
 *
 * What ties a card to its column is the numbered token, not position: the same token appears on
 * the column header, in the bars legend and on each bar lane, so a product is one number
 * everywhere on the page. Position alone would have broken the moment the table scrolled.
 */

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   products: { id: string, title: string, image: string, href: string, ratingValue?: number }[],
 *   brandLabels: Record<string, string>,
 *   bestOffers: { productId: string, formatted: string | null, offerCount: number, isCheapest: boolean }[],
 *   seriesColors: Record<string, string>,
 *   isFixed: boolean,
 *   removeProduct: (id: string) => void,
 *   canAddMore: boolean,
 *   addMoreHref: string,
 * }} props
 */
export const CompareProductStrip = ({
  t,
  products,
  brandLabels,
  bestOffers,
  seriesColors,
  isFixed,
  removeProduct,
  canAddMore,
  addMoreHref,
}) => {
  const offerByProductId = new Map(bestOffers.map((entry) => [entry.productId, entry]));
  const showAddCard = canAddMore && !isFixed;

  return (
    /**
     * A snap scroller on a phone and an even row on a tablet upward. `-mx-*`/`px-*` lets the
     * scrolled content run to the edge of the screen while the first card still lines up with
     * the heading above it — a scroller that stops short of the edge reads as a clipped box.
     */
    <ul
      aria-label={t("comparePage.strip.aria")}
      /**
       * How many cards there are, handed to CSS. Two sizes of the same product are the same
       * card; what changes is how many of them share a row — see the class list below.
       */
      style={{ "--compare-strip-columns": String(products.length + (showAddCard ? 1 : 0)) }}
      /**
       * A snap scroller on a phone, a grid from `md` up — and the column count follows the number
       * of cards rather than the viewport.
       *
       * `flex-wrap` was the obvious first answer and it was wrong twice over: with `flex-1` a card
       * left alone on the last row stretched to the whole page (the fourth product came out 674px
       * wide next to three 241px ones at 768), and with a fixed column count a two-product pair
       * page left half the row empty. `repeat(<n>, 1fr)` gives every card an equal share of the
       * row it is actually in, whether that is two cards or five — which is what "the products
       * being compared" should look like at any count.
       *
       * Two columns at `md` regardless: five cards across a 768px tablet is 137px each, narrower
       * than the phone card they replace.
       *
       * The `20rem` ceiling is what stops the other extreme. A two-product pair page on a 1440px
       * screen gave each card 614px — a 136px photo adrift in half a metre of white with the
       * price tucked in one corner. Tracks stop growing at a card's worth of width and the row
       * simply ends, which is what a two-item selection should look like.
       */
      className="m-0 -mx-2.5 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto px-2.5 pb-1 md:mx-0 md:grid md:[grid-template-columns:repeat(2,minmax(0,1fr))] md:overflow-visible md:px-0 lg:[grid-template-columns:repeat(var(--compare-strip-columns),minmax(0,20rem))]"
    >
      {products.map((product, index) => {
        const offer = offerByProductId.get(product.id);
        const rating = typeof product.ratingValue === "number" ? product.ratingValue : null;

        return (
          /**
           * `relative` is load-bearing, and for the reason the table's scroller carries it too:
           * `sr-only` is `position: absolute`, and an absolutely positioned box anchors to its
           * nearest *positioned* ancestor — `overflow-x: auto` clips but does not position. With
           * every ancestor static, the rating pill's screen-reader text anchored to the document
           * at the fourth card's scrolled-out x and gave the whole page 408px of horizontal
           * scroll at 390px wide. Positioning the card keeps that text inside the scroller.
           */
          <li
            key={product.id}
            className={`${SURFACE} relative flex w-52 shrink-0 snap-start flex-col gap-3 p-3 transition-shadow hover:shadow-[0_2px_10px_rgba(21,33,71,0.07)] md:w-auto md:p-4`}
          >
            <div className="flex items-start justify-between gap-2">
              <CompareSeriesToken index={index} color={seriesColors[product.id]} />
              {offer?.isCheapest ? (
                <span className={PILL_POSITIVE}>{t("comparePage.bestPrices.cheapestBadge")}</span>
              ) : null}
            </div>

            {/**
             * Capped rather than full-bleed. The photo is how a product is recognised, but a
             * square one at the card's full width is 260px tall on a desktop grid — it pushed
             * the price, the shop count and the rating below the fold of the card and made the
             * strip taller than the first section of the table.
             */}
            <span className="mx-auto block w-full max-w-[8.5rem]">
              <ProductCardImage variant="compare" src={product.image} alt={product.title} />
            </span>

            <div className="flex min-w-0 flex-col gap-1">
              {/** Brand names are Latin proper nouns (`BRAND_LABEL`), so `uppercase` is safe here. */}
              <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-text-muted">
                {brandLabels[product.id]}
              </p>
              <h3 className="m-0 text-xs font-semibold leading-snug sm:text-sm">
                {/**
                 * `min-h-6` for the 24px tap target rather than `py-1 -my-1` — padding on a
                 * line-clamped element is a hole in the clip. The clamp truncates at the content
                 * box, `overflow: hidden` clips at the padding box, and the gap between them
                 * shows the top of the next line. See CompareColumnHeader for the measurement.
                 */}
                <LocalizedLink
                  to={product.href}
                  className={`line-clamp-2 min-h-6 text-navy no-underline hover:underline ${FOCUS_RING}`}
                >
                  {product.title}
                </LocalizedLink>
              </h3>
            </div>

            {/** `mt-auto` pins the price block to the bottom, so four cards of different title lengths still line their prices up. */}
            <div className="mt-auto flex flex-col gap-1.5">
              {offer?.formatted ? (
                <p className="m-0 flex flex-col">
                  {/**
                   * No `uppercase`: Tailwind's text-transform runs on the rendered string, and
                   * Armenian's `և` uppercases to the archaic `ԵՒ` instead of `ԵՎ`. This label
                   * has none today, but the trap is one dictionary edit away — and Armenian in
                   * all-caps reads worse at 10px regardless.
                   */}
                  <span className="text-[10px] font-medium tracking-wide text-text-muted">
                    {t("comparePage.rows.price")}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-navy sm:text-base">
                    {offer.formatted}
                  </span>
                </p>
              ) : (
                <p className="m-0 text-xs text-text-muted">{t("comparePage.bestPrices.noOffers")}</p>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                {offer && offer.offerCount > 0 ? (
                  <span className={PILL_NEUTRAL}>
                    {t("comparePage.bestPrices.shopCount").replace(
                      "{{count}}",
                      String(offer.offerCount),
                    )}
                  </span>
                ) : null}
                {rating !== null ? (
                  <span className={PILL_NEUTRAL}>
                    <FaStar className="h-2.5 w-2.5 text-amber-500" aria-hidden />
                    <span className="tabular-nums">{rating}</span>
                    <span className="sr-only"> {t("comparePage.strip.ratingAria")}</span>
                  </span>
                ) : null}
              </div>
            </div>

            {isFixed ? null : (
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                aria-label={`${t("comparePage.remove")} — ${product.title}`}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-blue py-1.5 text-[11px] font-semibold text-text-muted transition-colors hover:border-navy hover:text-navy sm:text-xs ${FOCUS_RING}`}
              >
                <FaTimes className="h-2.5 w-2.5" aria-hidden />
                {t("comparePage.remove")}
              </button>
            )}
          </li>
        );
      })}

      {showAddCard ? (
        <li className="flex w-52 shrink-0 snap-start md:w-auto">
          <LocalizedLink
            to={addMoreHref}
            className={`${RADIUS} flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-border-blue p-4 text-center text-xs font-semibold text-link-blue no-underline transition-colors hover:border-link-blue hover:bg-hover-blue sm:text-sm ${FOCUS_RING}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-hover-blue">
              <FaPlus className="h-3.5 w-3.5" aria-hidden />
            </span>
            {t("comparePage.addMore")}
          </LocalizedLink>
        </li>
      ) : null}
    </ul>
  );
};

export default CompareProductStrip;
