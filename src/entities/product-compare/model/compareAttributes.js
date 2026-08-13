/**
 * The numeric facts a comparison can rank a product by, in one global order rather than 11
 * hand-maintained per-category lists: `getValue` returns `null` for a field a category
 * doesn't carry (a monitor has no `ramGb`), and every consumer below — the radar's axis
 * picker, the bars, the table's winner highlight — already has to filter down to "every
 * compared product has a value" regardless of category. A per-category list would just be
 * this same filter, precomputed and gone stale the moment a category's fields change.
 *
 * `direction` says which end of the range is better: `"higher"` (more screen, more RAM, more
 * storage, more battery, newer, longer warranty) or `"lower"` (price, weight). `ratingValue`
 * is deliberately not here — every product in the catalog sits at 4.5–4.9, and min-max
 * normalizing that tight a band would inflate a real 0.3-star difference into a full radar
 * spoke, the kind of chart that lies about how much the numbers actually differ.
 */
import { formatPriceAmd } from "shared/lib/formatPriceAmd";

/**
 * `batteryMah` (a capacity — phones, tablets, consoles, accessories) and `batteryHours` (a
 * rated life — headphones, speakers, wearables) are two different units for "battery"; see
 * `entities/product/model/productSpecs.js`'s own `batteryCapacityRow`/`batteryHoursRow`
 * split. This reads whichever one the product's category actually reports.
 */
const batteryRawValue = (product) =>
  typeof product.batteryMah === "number"
    ? product.batteryMah
    : typeof product.batteryHours === "number"
      ? product.batteryHours
      : null;

const formatWeight = (grams) =>
  grams >= 1000 ? `${Math.round((grams / 1000) * 100) / 100} kg` : `${grams} g`;

const formatStorage = (gb) => (gb >= 1000 ? `${gb / 1000} TB` : `${gb} GB`);

/**
 * `GB`, `Hz`, `mAh`, `g`/`kg` and `″` are unit symbols — the same glyphs in all three
 * languages, and the product pages already print them untranslated. "months" and "hours" are
 * not: they are English words, and the bars used to render "24 mo" and "30 h" to an Armenian
 * reader on a page whose every other number carried a translated unit. Same for the price,
 * which printed a bare "739,000" beside a table row reading "739,000 դր.".
 *
 * `t` is threaded down here rather than applied by the widget because `formatted` is consumed
 * twice — once by the bars, once by the advantage cards — and a unit word applied at one call
 * site is a unit word missing at the other. The English fallback only exists for callers that
 * genuinely have no translator (the model's own unit tests); every rendering path passes one,
 * and `compareBarsModel.test.js` pins that per locale.
 */
const localizedUnit = (t, key, token, value, fallback) =>
  typeof t === "function" ? t(key).replace(`{{${token}}}`, String(value)) : fallback;

export const COMPARE_ATTRIBUTES = [
  {
    key: "screen",
    labelKey: "comparePage.attr.screen",
    direction: "higher",
    getValue: (p) => (typeof p.screenInch === "number" ? p.screenInch : null),
    formatValue: (v) => `${v}″`,
    showBar: true,
  },
  {
    key: "refresh",
    labelKey: "comparePage.attr.refresh",
    direction: "higher",
    getValue: (p) => (typeof p.refreshHz === "number" ? p.refreshHz : null),
    formatValue: (v) => `${v} Hz`,
    showBar: true,
  },
  {
    key: "storage",
    labelKey: "comparePage.attr.storage",
    direction: "higher",
    getValue: (p) => (typeof p.storageGb === "number" ? p.storageGb : null),
    formatValue: (v) => formatStorage(v),
    showBar: true,
  },
  {
    key: "ram",
    labelKey: "comparePage.attr.ram",
    direction: "higher",
    getValue: (p) => (typeof p.ramGb === "number" ? p.ramGb : null),
    formatValue: (v) => `${v} GB`,
    showBar: true,
  },
  {
    key: "battery",
    labelKey: "comparePage.attr.battery",
    direction: "higher",
    getValue: batteryRawValue,
    formatValue: (v, p, t) =>
      typeof p.batteryMah === "number"
        ? `${v} mAh`
        : localizedUnit(t, "productDetail.specsExtended.values.batteryHours", "hours", v, `${v} h`),
    showBar: true,
  },
  {
    key: "price",
    labelKey: "comparePage.attr.price",
    direction: "lower",
    getValue: (p) => (typeof p.priceValue === "number" ? p.priceValue : null),
    formatValue: (v, p, t) =>
      formatPriceAmd(v, typeof t === "function" ? t("productDetail.currencySuffix") : ""),
    showBar: true,
  },
  {
    key: "weight",
    labelKey: "comparePage.attr.weight",
    direction: "lower",
    getValue: (p) => (typeof p.weightGrams === "number" ? p.weightGrams : null),
    formatValue: (v) => formatWeight(v),
    showBar: true,
  },
  {
    key: "year",
    labelKey: "comparePage.attr.year",
    direction: "higher",
    getValue: (p) => (typeof p.releaseYear === "number" ? p.releaseYear : null),
    formatValue: (v) => String(v),
    /** "2024 vs 2025" as a proportional bar communicates nothing; it still works as a radar axis. */
    showBar: false,
  },
  {
    key: "warranty",
    labelKey: "comparePage.attr.warranty",
    direction: "higher",
    getValue: (p) => (typeof p.warrantyMonths === "number" ? p.warrantyMonths : null),
    formatValue: (v, p, t) =>
      localizedUnit(t, "productDetail.specsExtended.values.warrantyMonths", "months", v, `${v} mo`),
    showBar: true,
  },
];

/** @type {Map<string, (typeof COMPARE_ATTRIBUTES)[number]>} */
export const COMPARE_ATTRIBUTE_BY_KEY = new Map(COMPARE_ATTRIBUTES.map((attr) => [attr.key, attr]));

/**
 * The first 5 attributes (in `COMPARE_ATTRIBUTES` order) every compared product has a real
 * value for — a radar axis with a gap for one product would be indistinguishable from a
 * genuine zero. Fewer than 3 candidates and the shape degenerates into a line or a point, not
 * a legible polygon, so callers hide the radar section entirely in that case.
 */
export const pickRadarAxes = (products) => {
  if (!Array.isArray(products) || products.length < 2) return [];
  return COMPARE_ATTRIBUTES.filter((attr) =>
    products.every((product) => typeof attr.getValue(product) === "number"),
  ).slice(0, 5);
};
