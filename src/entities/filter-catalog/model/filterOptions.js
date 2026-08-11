/**
 * Filter facet metadata. Screen and storage options are **derived from the catalog** rather
 * than hardcoded, which is the only way to guarantee the invariant that matters: every
 * option a visitor can tick returns at least one product, and every product is reachable
 * through some option. The hardcoded lists broke both halves — `RAM_OPTIONS` offered
 * 4/8/16/32/128 GB while the Galaxy S25 Ultra carried 12, so that product was silently
 * unfilterable and its count was computed but never rendered.
 *
 * Colors stay hand-listed: their labels are real UI copy that has to be translated, and the
 * set is closed and stable.
 */
import { getBrandLabel, PRODUCT_CATALOG } from "entities/product";

/**
 * Screen sizes are bucketed rather than listed one value per option: with honest diagonals
 * the catalog spans 1.9″ to 55″, and a flat list of every distinct value would be a
 * thirteen-checkbox facet where most options match a single product.
 *
 * `maxInch` is exclusive so the ranges can't overlap or leave a gap.
 */
const SCREEN_SIZE_BUCKETS = [
  { id: "to-3", minInch: 0, maxInch: 3 },
  { id: "6-7", minInch: 6, maxInch: 7 },
  { id: "13-15", minInch: 13, maxInch: 15 },
  { id: "15-17", minInch: 15, maxInch: 17 },
  { id: "over-40", minInch: 40, maxInch: Infinity },
];

/** @param {number | undefined} inch @returns {string | null} the bucket id, or null when the product has no screen. */
export const screenBucketIdFor = (inch) => {
  if (typeof inch !== "number" || !Number.isFinite(inch)) return null;
  const bucket = SCREEN_SIZE_BUCKETS.find((b) => inch >= b.minInch && inch < b.maxInch);
  return bucket ? bucket.id : null;
};

/** Only the buckets the catalog actually populates, so no option can come up empty. */
export const SCREEN_SIZE_OPTIONS = SCREEN_SIZE_BUCKETS.filter((bucket) =>
  PRODUCT_CATALOG.some((product) => screenBucketIdFor(product.screenInch) === bucket.id),
);

/**
 * Derived from the catalog like the other facets, and labelled from the one brand map.
 * The hand-written list could disagree with the data in both directions — a brand nobody
 * stocks stayed clickable, and a product filed under a brand not on the list was
 * unfilterable. Brand names are proper nouns, so they carry no translation keys.
 */
export const BRAND_OPTIONS = [...new Set(PRODUCT_CATALOG.map((product) => product.brandId))]
  .filter(Boolean)
  .sort((a, b) => getBrandLabel(a).localeCompare(getBrandLabel(b), "en"))
  .map((id) => ({ id, label: getBrandLabel(id) }));

/**
 * Every storage size present in the catalog, ascending. Labels are built by the presenter
 * from `formatStorageGb` — a size is the same text in every locale, so unlike brands and
 * colors these need no dictionary entries at all.
 */
export const STORAGE_OPTIONS = [
  ...new Set(
    PRODUCT_CATALOG.map((product) => product.storageGb).filter(
      (gb) => typeof gb === "number" && gb > 0,
    ),
  ),
]
  .sort((a, b) => a - b)
  .map((gb) => ({ id: String(gb), gb }));

export const COLOR_OPTIONS = [
  { id: "black", hex: "#1a1a1a" },
  { id: "grey", hex: "#9ca3af" },
  { id: "white", hex: "#f3f4f6" },
  { id: "navy", hex: "#152147" },
  { id: "blue", hex: "#2563eb" },
  { id: "orange", hex: "#f97316" },
];
