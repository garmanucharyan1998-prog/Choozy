/**
 * Synthetic benchmark scores — AnTuTu and Geekbench 6 — for the categories those benchmarks
 * actually run on.
 *
 * **These are demo numbers, not measured results.** There is no backend and no lab; every price,
 * shop, rating and spec in this catalog is mock, and these are mock in exactly the same way. They
 * exist so the comparison page has the kind of row a real one has. Nobody should read a score
 * here as a claim about the real device, and nothing here should be published as one.
 *
 * They are *derived* rather than invented one by one, so they stay consistent with the facts the
 * catalog already states about each product: more RAM, a newer year and a higher-tier chip move a
 * score up, and a stable per-product jitter keeps two otherwise identical models from tying. That
 * makes the ordering defensible on its own terms — a 2025 flagship outscores a 2023 mid-ranger —
 * without pretending to be an actual measurement.
 *
 * Only smartphones, tablets, laptops and consoles get scores: AnTuTu and Geekbench do not run on
 * a monitor, a pair of headphones or a camera lens, and a missing row is honest where an invented
 * one would not be. AnTuTu is mobile-only, which is why laptops carry Geekbench alone.
 */

/** Categories each benchmark is meaningful for. */
const ANTUTU_CATEGORIES = new Set(["smartphones", "tablets"]);
const GEEKBENCH_CATEGORIES = new Set(["smartphones", "tablets", "laptops", "consoles"]);

/**
 * Rough silicon tiers, by brand. Not a ranking of the companies — a stand-in for the class of
 * chip their devices in this catalog ship with, so the derived scores land in believable bands.
 */
const BRAND_TIER = {
  apple: 1.25,
  samsung: 1.1,
  google: 1.05,
  asus: 1.05,
  sony: 1.0,
  lenovo: 0.95,
  acer: 0.95,
  xiaomi: 0.95,
  honor: 0.9,
  huawei: 0.9,
  microsoft: 1.0,
  nintendo: 0.7,
};
const DEFAULT_TIER = 0.9;

/** The same positional hash the offers and price history use — order-sensitive on purpose. */
const hashString = (value) =>
  String(value)
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);

const seededFraction = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** +/-5%, stable per product and per benchmark, so no two models tie by accident. */
const jitterFor = (productId, metric) => 1 + (seededFraction(hashString(`${productId}::${metric}`)) - 0.5) * 0.1;

/** How far past a 2019 baseline this product's generation is, capped so old kit is not zeroed. */
const generationFactor = (releaseYear) => {
  if (typeof releaseYear !== "number") return 1;
  return 1 + Math.max(0, Math.min(6, releaseYear - 2019)) * 0.14;
};

const ramFactor = (ramGb) => {
  if (typeof ramGb !== "number" || ramGb <= 0) return 1;
  /** Diminishing: 16GB is not twice the machine 8GB is. */
  return 1 + Math.log2(ramGb) * 0.08;
};

const round = (value, step) => Math.round(value / step) * step;

/**
 * @param {object} product a catalog product
 * @returns {{ antutu: number|null, geekbenchSingle: number|null, geekbenchMulti: number|null }}
 */
export const benchmarksForProduct = (product) => {
  if (!product || typeof product !== "object") {
    return { antutu: null, geekbenchSingle: null, geekbenchMulti: null };
  }

  const tier = BRAND_TIER[product.brandId] ?? DEFAULT_TIER;
  const base = tier * generationFactor(product.releaseYear) * ramFactor(product.ramGb);

  const antutu = ANTUTU_CATEGORIES.has(product.categoryId)
    ? round(620000 * base * jitterFor(product.id, "antutu"), 1000)
    : null;

  const geekbenchSingle = GEEKBENCH_CATEGORIES.has(product.categoryId)
    ? round(1150 * base * jitterFor(product.id, "gb-single"), 5)
    : null;

  /**
   * Multi-core scales with cores, which this catalog does not state — RAM is the closest proxy
   * it does have, and a laptop's is typically backed by more of them than a phone's.
   */
  const multiplier = product.categoryId === "laptops" ? 5.2 : 3.6;
  const geekbenchMulti = GEEKBENCH_CATEGORIES.has(product.categoryId)
    ? round(1150 * base * multiplier * jitterFor(product.id, "gb-multi"), 10)
    : null;

  return { antutu, geekbenchSingle, geekbenchMulti };
};

/** True when this product has at least one score, i.e. a benchmark section is worth showing. */
export const hasBenchmarks = (product) => {
  const { antutu, geekbenchSingle, geekbenchMulti } = benchmarksForProduct(product);
  return antutu !== null || geekbenchSingle !== null || geekbenchMulti !== null;
};

export default benchmarksForProduct;
