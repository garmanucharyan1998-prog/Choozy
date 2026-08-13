/**
 * Turns the bars model into a per-product "why this one" bullet list — the unique SEO text
 * every `/compare/<a>-vs-<b>` page was otherwise missing, and the same data the table and the
 * bars already show, just reframed as a verdict instead of a grid.
 */
import { buildCompareBars } from "./compareBarsModel";

/** Below this margin a win reads as noise, not a reason to choose one product over another. */
const ADVANTAGE_THRESHOLD_PERCENT = 10;
const MAX_ADVANTAGES = 6;

/**
 * @param {import("entities/product").CatalogProduct[]} products - 2–4 items
 * @param {(key: string, fallback?: string) => string} [t] - passed straight through to
 *   `buildCompareBars`, so a bullet and the bar it was derived from print the same units.
 * @returns {Record<string, { labelKey: string, formatted: string, deltaPercent: number }[]>}
 *   keyed by product id
 */
export const buildCompareAdvantages = (products, t) => {
  const advantagesByProductId = new Map((products ?? []).map((product) => [product.id, []]));
  if (!Array.isArray(products) || products.length < 2) return {};

  const bars = buildCompareBars(products, t);

  bars.forEach((row) => {
    row.bars.forEach((bar) => {
      if (bar.isWinner && (bar.deltaPercent ?? 0) >= ADVANTAGE_THRESHOLD_PERCENT) {
        advantagesByProductId.get(bar.productId).push({
          labelKey: row.labelKey,
          formatted: bar.formatted,
          deltaPercent: bar.deltaPercent,
          /**
           * The value the margin was measured against. A bullet reading "120 Hz (+100%)" states
           * a number whose base the reader has no way to recover — the card is about one
           * product, so the other side of the comparison has to be named, not implied.
           */
          baselineFormatted: row.baselineFormatted,
        });
      }
    });
  });

  /**
   * A product that loses (or ties) every attribute by less than the 10% bar would otherwise
   * get zero bullets — a visibly empty card next to three full ones reads as broken, not as
   * "this one has no strengths". Price is nearly always at least a little different, so it is
   * the fallback, stated as a plain fact rather than a claim: "Price: X AMD", never "X%
   * cheaper" unless that comparison already earned its place above. `only positive` is kept by
   * never asserting a win here, not by only ever picking a winner.
   */
  const priceRow = bars.find((row) => row.key === "price");
  if (priceRow) {
    products.forEach((product) => {
      const list = advantagesByProductId.get(product.id);
      if (list.length > 0) return;
      const priceBar = priceRow.bars.find((bar) => bar.productId === product.id);
      if (priceBar) {
        list.push({
          labelKey: priceRow.labelKey,
          formatted: priceBar.formatted,
          deltaPercent: null,
          baselineFormatted: null,
        });
      }
    });
  }

  const result = {};
  advantagesByProductId.forEach((list, productId) => {
    result[productId] = [...list]
      .sort((a, b) => b.deltaPercent - a.deltaPercent)
      .slice(0, MAX_ADVANTAGES);
  });
  return result;
};

export default buildCompareAdvantages;
