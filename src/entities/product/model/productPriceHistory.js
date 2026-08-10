/**
 * Deterministic per-product price history — previously every product shared one fixed
 * curve ([250000, 260000, 200000, 320000, 240000]) linearly rescaled by the ratio of its
 * own price to a single baseline product's price, so every chart had the exact same
 * shape (same up/down months) and, for the cheapest and most expensive products, values
 * that overshot or vanished off the axis.
 *
 * Seeded by the product id (not `Math.random()`) so the chart is stable across renders
 * and identical between the server render and the client's first paint.
 */
const MONTH_COUNT = 5;

const seededFraction = (seed, index) => {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Positional (not a plain character-code sum): a sum is order-insensitive, so ids that are
 * digit permutations of each other — e.g. "fp-12" and "fp-21" — hashed to the exact same
 * seed and produced identical relative price curves. Multiplying by a prime per character
 * folds position into the result.
 */
const hashProductId = (id) =>
  String(id)
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);

/**
 * @param {{ id: string, priceValue: number }} product
 * @returns {number[]}
 */
export const buildPriceHistoryForProduct = (product) => {
  const seed = hashProductId(product.id);
  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    /**
     * The last month IS the current price, not merely close to it: the chart's final bar is
     * the highlighted one and sits directly under the price printed on the page, so any gap
     * reads as the page contradicting itself. It used to keep 40% of its swing there —
     * up to 4.8% off — despite the comment claiming it converged.
     */
    if (index === MONTH_COUNT - 1) return product.priceValue;

    /** +/-12% around the current price, converging on it as the months approach today. */
    const swing = (seededFraction(seed, index) - 0.5) * 0.24;
    const distanceFromNow = (MONTH_COUNT - 1 - index) / (MONTH_COUNT - 1);
    const factor = 1 + swing * distanceFromNow;
    return Math.round((product.priceValue * factor) / 1000) * 1000;
  });
};
