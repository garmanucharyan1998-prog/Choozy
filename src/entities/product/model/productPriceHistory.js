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

const hashProductId = (id) =>
  String(id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

/**
 * @param {{ id: string, priceValue: number }} product
 * @returns {number[]}
 */
export const buildPriceHistoryForProduct = (product) => {
  const seed = hashProductId(product.id);
  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    /** +/-12% around the current price, trending toward it in the most recent month. */
    const swing = (seededFraction(seed, index) - 0.5) * 0.24;
    const trendToward = index / (MONTH_COUNT - 1);
    const factor = 1 + swing * (1 - trendToward * 0.6);
    return Math.round((product.priceValue * factor) / 1000) * 1000;
  });
};
