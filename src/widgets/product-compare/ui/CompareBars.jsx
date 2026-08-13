import { Fragment } from "react";
import { FaArrowDown, FaArrowUp, FaEquals } from "react-icons/fa";
import "./CompareBars.css";

/**
 * One thin lane per product per numeric attribute, laid out as a grid of small metric panels.
 *
 * The shape this replaced repeated all four product names inside every attribute — twenty
 * truncated copies of "Apple iPhone 17 …" down one page, each in a fixed 128px column, next to
 * a value column too narrow for "120 Hz +100%" so the value wrapped and every row stood at a
 * different height. The names now appear once, in the legend, and each lane is identified by
 * the numbered token beside it; a lane is a single line, so eight attributes fit in roughly the
 * height five used to take.
 *
 * The three columns are a CSS grid on the panel rather than widths on the lane, so the value
 * column is exactly as wide as the widest value in *that* panel and every track inside it ends
 * at the same x. Sizing each lane on its own would let a "1,199,000 AMD" lane draw a shorter
 * track than a "445,000 AMD" lane directly above it, and two bars at the same ratio would then
 * be different lengths — a chart that lies about the numbers printed on it.
 *
 * Colour is never the only carrier: the winner is the full-width bar (length, not hue), the
 * token repeats the legend's number, the raw value is printed on every lane, and the product's
 * name rides along as screen-reader text.
 *
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   bars: {
 *     key: string,
 *     labelKey: string,
 *     direction: "higher" | "lower",
 *     bars: { productId: string, raw: number, formatted: string, ratio: number, isWinner: boolean, deltaPercent: number | null }[],
 *   }[],
 *   products: { id: string, title: string }[],
 *   seriesColors: Record<string, string>,
 * }} props
 */

/** Each lane starts a beat after the one above it, so a panel fills in reading order. */
const LANE_STAGGER_MS = 70;

/**
 * The number, not the colour, is what ties a lane to the legend. It sits on white with a ring
 * in the series colour rather than on a filled swatch because two of the four series colours
 * (the amber and the teal) cannot carry legible white text — a filled badge would have made
 * the one element that identifies the lane the one element nobody could read.
 */
const SeriesToken = ({ index, color }) => (
  <span
    className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-bold leading-none text-navy"
    style={{ boxShadow: `inset 0 0 0 1.5px ${color}` }}
    aria-hidden="true"
  >
    {index + 1}
  </span>
);

export const CompareBars = ({ t, bars, products, seriesColors }) => {
  if (!bars || bars.length === 0) return null;

  const titleById = new Map(products.map((product) => [product.id, product.title]));
  const seriesIndexById = new Map(products.map((product, index) => [product.id, index]));
  const leadNoteTemplate = t("comparePage.bars.leadNote");

  return (
    <section
      aria-labelledby="compare-bars-heading"
      className="flex flex-col gap-4 rounded-2xl border border-border-blue bg-white p-4 md:gap-5 md:p-6"
    >
      <div className="flex flex-col gap-3">
        <h2
          id="compare-bars-heading"
          className="m-0 text-base font-bold text-navy sm:text-lg md:text-xl"
        >
          {t("comparePage.bars.heading")}
        </h2>
        {/**
         * The one place the full titles are printed, so nothing below has to truncate them.
         * Wraps rather than scrolls: four Armenian product names on a phone are four lines,
         * and four legible lines beat one line of ellipses.
         */}
        <ul
          aria-label={t("comparePage.bars.legendAria")}
          className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0"
        >
          {products.map((product, index) => (
            <li
              key={product.id}
              className="flex items-center gap-2 text-[11px] font-medium text-navy sm:text-xs"
            >
              <SeriesToken index={index} color={seriesColors[product.id]} />
              <span>{product.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
        {bars.map((row) => {
          const labelId = `compare-bar-${row.key}`;
          /** Every value equal — `deltaPercent` is null here too, but for a reason worth saying. */
          const isTie = row.bars.every((bar) => bar.raw === row.bars[0].raw);
          const leader = row.bars.find((bar) => bar.isWinner && bar.deltaPercent);
          const DirectionIcon = row.direction === "lower" ? FaArrowDown : FaArrowUp;

          return (
            /**
             * The panel is the group, not just its lanes: the leader badge in the header is
             * part of what this attribute has to say, and a group that started below it would
             * announce the bars while leaving the margin behind.
             */
            <div
              key={row.key}
              role="group"
              aria-labelledby={labelId}
              className="flex flex-col gap-3 rounded-xl bg-subtle-bg p-3 md:p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p id={labelId} className="m-0 text-xs font-semibold text-navy sm:text-sm">
                  {t(row.labelKey)}
                </p>
                {isTie ? (
                  <span className="inline-flex shrink-0 items-center rounded-pill bg-white px-2 py-1 text-text-muted">
                    <FaEquals className="h-2.5 w-2.5" aria-hidden />
                    <span className="sr-only">{t("comparePage.bars.tie")}</span>
                  </span>
                ) : leader ? (
                  /**
                   * The arrow is the row's direction, not the winner's: on price and weight the
                   * longest bar is the *smallest* number, and an unlabelled percentage next to a
                   * full-width bar on a price chart reads as "most expensive".
                   */
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-emerald-50 px-2 py-1 text-[10px] font-bold leading-none text-emerald-700 sm:text-[11px]">
                    <DirectionIcon className="h-2.5 w-2.5" aria-hidden />
                    <span aria-hidden="true">{leader.deltaPercent}%</span>
                    <span className="sr-only">
                      {leadNoteTemplate
                        .replace("{{percent}}", String(leader.deltaPercent))
                        .replace("{{baseline}}", row.baselineFormatted ?? "")}
                    </span>
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2.5">
                {row.bars.map((bar, laneIndex) => {
                  const color = seriesColors[bar.productId];
                  return (
                    <Fragment key={bar.productId}>
                      <SeriesToken index={seriesIndexById.get(bar.productId) ?? laneIndex} color={color} />
                      <span className="block h-1.5 w-full rounded-full bg-white" aria-hidden="true">
                        {bar.ratio > 0 ? (
                          <span
                            className="compare-bars__fill block h-full rounded-full"
                            style={{
                              /** Rounded: a raw ratio serialises as `45.33152909336942%` into every SSR page. */
                              width: `${Math.round(Math.min(bar.ratio, 1) * 10000) / 100}%`,
                              backgroundImage: `linear-gradient(90deg, ${color}b3, ${color})`,
                              boxShadow: bar.isWinner ? `0 0 8px ${color}59` : undefined,
                              animationDelay: `${laneIndex * LANE_STAGGER_MS}ms`,
                            }}
                          />
                        ) : null}
                      </span>
                      <span
                        className={`whitespace-nowrap text-end text-[11px] leading-none tabular-nums sm:text-xs ${
                          bar.isWinner ? "font-bold text-navy" : "font-medium text-text-muted"
                        }`}
                      >
                        <span className="sr-only">{titleById.get(bar.productId)}: </span>
                        {bar.formatted}
                        {bar.isWinner && !isTie ? (
                          <span className="sr-only"> — {t("comparePage.bestValue")}</span>
                        ) : null}
                      </span>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/**
       * The badges are compact by necessity — eight of them, one per panel, on a phone. This
       * says once what each of them is measured against, the way the radar's `scaleNote` states
       * its own scale rather than leaving a percentage to be guessed at.
       */}
      <p className="m-0 text-[11px] text-text-muted sm:text-xs">{t("comparePage.bars.deltaNote")}</p>
    </section>
  );
};

export default CompareBars;
