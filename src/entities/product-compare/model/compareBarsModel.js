/**
 * Turns a selection into paired horizontal bars, one row per numeric attribute every product
 * has: the winner draws at full width, everyone else proportionally to their own raw value —
 * never to a normalized score, so the bar and the number printed next to it always agree.
 */
import { COMPARE_ATTRIBUTES } from "./compareAttributes";

/** How much better the winner is than the worst option, as a whole-number percent. */
const percentBetterThanWorst = (best, worst, direction) => {
  if (worst === 0 || best === worst) return null;
  const diff = direction === "lower" ? worst - best : best - worst;
  return Math.round((diff / worst) * 100);
};

/**
 * @param {import("entities/product").CatalogProduct[]} products - 2–4 items
 * @returns {{
 *   key: string,
 *   labelKey: string,
 *   bars: { productId: string, raw: number, formatted: string, ratio: number, isWinner: boolean, deltaPercent: number | null }[],
 * }[]}
 */
export const buildCompareBars = (products) => {
  if (!Array.isArray(products) || products.length < 2) return [];

  return COMPARE_ATTRIBUTES.filter((attr) => attr.showBar)
    .map((attr) => {
      const values = products.map((product) => attr.getValue(product));
      if (values.some((value) => typeof value !== "number")) return null;

      const best = attr.direction === "lower" ? Math.min(...values) : Math.max(...values);
      const worst = attr.direction === "lower" ? Math.max(...values) : Math.min(...values);
      const winnerDelta = percentBetterThanWorst(best, worst, attr.direction);

      return {
        key: attr.key,
        labelKey: attr.labelKey,
        bars: products.map((product, index) => {
          const raw = values[index];
          const isWinner = raw === best;
          return {
            productId: product.id,
            raw,
            formatted: attr.formatValue(raw, product),
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
