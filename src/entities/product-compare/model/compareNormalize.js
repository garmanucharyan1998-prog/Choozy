/**
 * Turns a selection into radar-ready `{axes, items}`: one 0–1 score per product per axis.
 */
import { PRODUCT_CATALOG } from "entities/product";
import { pickRadarAxes } from "./compareAttributes";

/**
 * A score of exactly 0 collapses a polygon's vertex onto the chart's own center — visually
 * indistinguishable from "no data" even though the product genuinely has the worst value in
 * the category. Every score lands in `[FLOOR, 1]` instead, so the weakest real product still
 * draws a visible point.
 */
const FLOOR = 0.15;

/**
 * Min/max across the *entire catalog category*, not just the products on screen: a product's
 * own score must not change depending on who it happens to be compared against, or the same
 * phone would draw a different-shaped polygon in two different comparisons.
 */
const categoryRange = (categoryId, attr) => {
  const values = PRODUCT_CATALOG.filter((product) => product.categoryId === categoryId)
    .map((product) => attr.getValue(product))
    .filter((value) => typeof value === "number");
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
};

const normalizedScore = (product, attr, range) => {
  const raw = attr.getValue(product);
  if (typeof raw !== "number" || !range) return FLOOR;
  /** Every product in the category ties on this axis — nobody is ahead, nobody is behind. */
  if (range.min === range.max) return 0.5;
  const ratio = (raw - range.min) / (range.max - range.min);
  const oriented = attr.direction === "lower" ? 1 - ratio : ratio;
  return FLOOR + oriented * (1 - FLOOR);
};

/**
 * @param {import("entities/product").CatalogProduct[]} products - 2–4 items, same category
 * @returns {{
 *   axes: { id: string, labelKey: string }[],
 *   items: { id: string, values: number[] }[],
 * }}
 */
export const buildRadarData = (products) => {
  if (!Array.isArray(products) || products.length < 2) return { axes: [], items: [] };

  const axes = pickRadarAxes(products);
  if (axes.length < 3) return { axes: [], items: [] };

  const categoryId = products[0].categoryId;
  const ranges = axes.map((attr) => categoryRange(categoryId, attr));

  return {
    axes: axes.map((attr) => ({ id: attr.key, labelKey: attr.labelKey })),
    items: products.map((product) => ({
      id: product.id,
      values: axes.map((attr, index) => normalizedScore(product, attr, ranges[index])),
    })),
  };
};

export default buildRadarData;
