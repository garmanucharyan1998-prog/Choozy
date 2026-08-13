/**
 * Turns a selection into paired horizontal bars, one row per numeric attribute every product
 * has: the winner draws at full width, everyone else proportionally to their own raw value —
 * never to a normalized score, so the bar and the number printed next to it always agree.
 */
import { COMPARE_ATTRIBUTES } from "./compareAttributes";

/**
 * How much better the winner is than the worst option, as a whole-number percent.
 *
 * The worst option is the base, so the number is only meaningful next to the value it was
 * measured against — a bare "+100%" answers "more than what?" with nothing. Every consumer
 * therefore gets `baselineFormatted` alongside it and is expected to print the two together.
 */
const percentBetterThanWorst = (best, worst, direction) => {
  if (worst === 0 || best === worst) return null;
  const diff = direction === "lower" ? worst - best : best - worst;
  return Math.round((diff / worst) * 100);
};

/**
 * @param {import("entities/product").CatalogProduct[]} products - 2–4 items
 * @param {(key: string, fallback?: string) => string} [t] - needed by the attributes whose unit
 *   is a word rather than a symbol (price, warranty, battery hours); see `localizedUnit`.
 * @returns {{
 *   key: string,
 *   labelKey: string,
 *   direction: "higher" | "lower",
 *   baselineFormatted: string | null,
 *   bars: { productId: string, raw: number, formatted: string, ratio: number, isWinner: boolean, deltaPercent: number | null }[],
 * }[]}
 */
export const buildCompareBars = (products, t) => {
  if (!Array.isArray(products) || products.length < 2) return [];

  return COMPARE_ATTRIBUTES.filter((attr) => attr.showBar)
    .map((attr) => {
      const values = products.map((product) => attr.getValue(product));
      if (values.some((value) => typeof value !== "number")) return null;

      const best = attr.direction === "lower" ? Math.min(...values) : Math.max(...values);
      const worst = attr.direction === "lower" ? Math.max(...values) : Math.min(...values);
      const winnerDelta = percentBetterThanWorst(best, worst, attr.direction);
      /** The product carrying the worst value, so the baseline is formatted in its own units. */
      const worstProduct = products[values.indexOf(worst)];

      return {
        key: attr.key,
        labelKey: attr.labelKey,
        /**
         * Carried through to the UI, not just used here: a full-width bar means "cheapest" on
         * the price row and "biggest" on the screen row, and without saying which way the row
         * is read the longest bar on a price chart looks like the most expensive product.
         */
        direction: attr.direction,
        /** What `deltaPercent` was measured against — never print one without the other. */
        baselineFormatted: winnerDelta === null ? null : attr.formatValue(worst, worstProduct, t),
        bars: products.map((product, index) => {
          const raw = values[index];
          const isWinner = raw === best;
          return {
            productId: product.id,
            raw,
            formatted: attr.formatValue(raw, product, t),
            ratio: raw > 0 ? (attr.direction === "lower" ? best / raw : raw / best) : 0,
            isWinner,
            deltaPercent: isWinner ? winnerDelta : null,
          };
        }),
      };
    })
    .filter(Boolean);
};

export default buildCompareBars;
