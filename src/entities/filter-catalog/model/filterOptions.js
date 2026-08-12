/**
 * Filter facet metadata. Screen, brand and storage options are **derived from the catalog**
 * rather than hardcoded, which is the only way to guarantee the invariant that matters: every
 * option a visitor can tick returns at least one product, and every product is reachable
 * through some option. The hardcoded lists broke both halves — `RAM_OPTIONS` offered
 * 4/8/16/32/128 GB while the Galaxy S25 Ultra carried 12, so that product was silently
 * unfilterable and its count was computed but never rendered.
 *
 * Colors are the exception, because their names are real UI copy that has to be translated —
 * but they are no longer a *second* list: `COLOR_OPTIONS` is projected from the catalog's own
 * `COLOR_HEX`, which is what the detail page's swatches read. The two used to be separate
 * literals with different hex values for the same name.
 */
import { COLOR_HEX, getBrandLabel, PRODUCT_CATALOG } from "entities/product";

/**
 * Screen sizes are bucketed rather than listed one value per option: with honest diagonals
 * the catalog spans 1.4″ to 85″, and a flat list of every distinct value would be a
 * forty-checkbox facet where most options match a single product.
 *
 * `maxInch` is exclusive so the ranges can't overlap. They may leave a gap (nothing in this
 * catalog has a 3″–6″ or 33″–40″ screen) but a gap must never contain a product: a screen
 * size in one would make that product unreachable through this facet, which is the same
 * silent hole the hardcoded lists had. `filterOptions.test.js` asserts it stays that way.
 */
const SCREEN_SIZE_BUCKETS = [
  { id: "to-3", minInch: 0, maxInch: 3 },
  { id: "3-6", minInch: 3, maxInch: 6 },
  { id: "6-7", minInch: 6, maxInch: 7 },
  { id: "7-11", minInch: 7, maxInch: 11 },
  { id: "11-13", minInch: 11, maxInch: 13 },
  { id: "13-15", minInch: 13, maxInch: 15 },
  { id: "15-17", minInch: 15, maxInch: 17 },
  { id: "17-24", minInch: 17, maxInch: 24 },
  { id: "24-33", minInch: 24, maxInch: 33 },
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

/**
 * The swatch row: every color the catalog actually stocks, in `COLOR_HEX`'s declared order.
 * Not the full palette — `COLOR_HEX` also carries alternate colors offered on a product's
 * detail page (see `buildColorOptionsForProduct`) that need not be anyone's primary catalog
 * color, and a swatch nobody can ever match is the same silent dead end this file's other
 * facets already guard against. Every id here still owes the dictionary a
 * `filterPage.filters.colorNames.<id>` entry.
 */
export const COLOR_OPTIONS = Object.keys(COLOR_HEX)
  .filter((id) => PRODUCT_CATALOG.some((product) => product.colorId === id))
  .map((id) => ({ id, hex: COLOR_HEX[id] }));
