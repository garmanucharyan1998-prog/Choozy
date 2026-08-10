/**
 * The one place that turns a gigabyte count into a label. Two modules used to carry their
 * own copy of this with *different* thresholds — `productVariants` switched to TB at 1000,
 * `productSpecs` at 128 — so a 128 GB tablet showed "128 GB" in its storage picker and
 * "0.128 TB" in its spec table, on the same page.
 *
 * @param {number} gb
 * @returns {string} e.g. "128 GB", "1 TB", "1.5 TB"
 */
export const formatStorageGb = (gb) => {
  if (typeof gb !== "number" || !Number.isFinite(gb) || gb <= 0) return "";
  if (gb < 1000) return `${gb} GB`;
  /** Trailing-zero-free: 1000 → "1 TB", not "1.0 TB". */
  return `${Number((gb / 1000).toFixed(2))} TB`;
};

export default formatStorageGb;
