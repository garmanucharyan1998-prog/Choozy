import { FaArrowRight } from "react-icons/fa";
import { LocalizedLink } from "shared/ui/link";
import { CompareSeriesToken } from "./CompareSeriesToken";
import {
  FOCUS_RING,
  PILL_NEUTRAL,
  PILL_POSITIVE,
  SECTION_HEADING,
  SECTION_PAD,
  SECTION_SUBHEADING,
  SURFACE,
  SURFACE_INSET,
} from "./compareStyles";

/**
 * Where each compared product is cheapest right now, and by how much the shops disagree about it.
 *
 * On a price-comparison site this is the page's payload, and it used to be a twelve-row matrix
 * with a four-word note under one cell per column. The matrix is still below — it is the evidence
 * — but the answer it contains now has its own block, in the order a shopper asks for it: the
 * price, then the shop, then how much choosing that shop actually saves.
 *
 * The saving is stated per product ("up to X across N shops"), never between products. Two
 * different phones having different prices is not a saving, and calling it one would turn an
 * arithmetic fact into a recommendation the data cannot support.
 */

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   bestOffers: {
 *     productId: string, priceAmd: number | null, formatted: string | null,
 *     shopNameKey: string | null, offerCount: number, spreadFormatted: string | null,
 *     isCheapest: boolean,
 *   }[],
 *   products: { id: string, title: string, href: string }[],
 *   seriesColors: Record<string, string>,
 * }} props
 */
export const CompareBestPrices = ({ t, bestOffers, products, seriesColors }) => {
  const productById = new Map(products.map((product) => [product.id, product]));
  const indexById = new Map(products.map((product, index) => [product.id, index]));

  return (
    <section
      aria-labelledby="compare-prices-heading"
      className={`${SURFACE} ${SECTION_PAD} flex flex-col gap-4`}
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="compare-prices-heading" className={SECTION_HEADING}>
          {t("comparePage.bestPrices.heading")}
        </h2>
        <p className={SECTION_SUBHEADING}>{t("comparePage.bestPrices.intro")}</p>
      </div>

      {/**
       * `auto-fill` with a ceiling rather than a fixed column count. A price card holds four
       * short lines; a fixed `xl:grid-cols-4` gave a two-product pair page two 590px cards, each
       * mostly empty. Tracks stop at a card's width and the row ends where the cards do.
       *
       * `min(100%, …)` is what keeps a phone at one card per row: two 160px cards would fit a
       * 390px screen, but each would then hold a wrapped saving line under a price that is the
       * one number this block exists to state. A full-width card there reads at a glance, and the
       * height it costs is a fraction of what the charts below already take.
       */}
      <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr))]">
        {bestOffers.map((entry) => {
          const product = productById.get(entry.productId);
          if (!product) return null;

          return (
            <li
              key={entry.productId}
              className={`${SURFACE_INSET} flex flex-col gap-2 p-3 md:p-4`}
            >
              <p className="m-0 flex items-center gap-2 text-[11px] font-medium text-navy sm:text-xs">
                <CompareSeriesToken
                  index={indexById.get(entry.productId) ?? 0}
                  color={seriesColors[entry.productId]}
                />
                <span className="line-clamp-1">{product.title}</span>
              </p>

              {entry.formatted ? (
                <>
                  <p className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-lg font-bold tabular-nums text-navy sm:text-xl">
                      {entry.formatted}
                    </span>
                    {entry.isCheapest ? (
                      <span className={PILL_POSITIVE}>
                        {t("comparePage.bestPrices.cheapestBadge")}
                      </span>
                    ) : null}
                  </p>
                  <p className="m-0 text-xs font-semibold text-navy sm:text-sm">
                    {t(entry.shopNameKey)}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={PILL_NEUTRAL}>
                      {t("comparePage.bestPrices.shopCount").replace(
                        "{{count}}",
                        String(entry.offerCount),
                      )}
                    </span>
                    {/** Only when the shops genuinely disagree — a zero spread is not a saving. */}
                    {entry.spreadFormatted ? (
                      <span className={PILL_NEUTRAL}>
                        {t("comparePage.bestPrices.saveUpTo").replace(
                          "{{amount}}",
                          entry.spreadFormatted,
                        )}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="m-0 mt-auto text-xs text-text-muted sm:text-sm">
                  {t("comparePage.bestPrices.noOffers")}
                </p>
              )}

              <LocalizedLink
                to={product.href}
                className={`inline-flex items-center gap-1.5 rounded-lg py-1 text-[11px] font-semibold text-link-blue no-underline transition-colors hover:underline sm:text-xs ${FOCUS_RING}`}
              >
                {t("comparePage.bestPrices.viewOffers")}
                {/** `rtl:rotate-180` is not needed — all three locales are left-to-right. */}
                <FaArrowRight className="h-2.5 w-2.5" aria-hidden />
              </LocalizedLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CompareBestPrices;
