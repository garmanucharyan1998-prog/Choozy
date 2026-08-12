/**
 * Spec rows, computed per product from its own category/screenInch/storageGb/brandId
 * (and, since the catalog grew real per-product numbers, its own ramGb/batteryMah/
 * batteryHours/weightGrams/releaseYear/warrantyMonths/refreshHz/mpn too) instead of every
 * product sharing one literal set of rows (`specsBriefRows` / `specsExtendedRows` on
 * `mockProductDetail`) — a TV and a camera lens used to show the exact same "Screen type:
 * LCD / Built-in mic: Yes / SSD: 512 GB" table.
 *
 * Rows are only emitted for facts the product actually has: `screenInch`, `storageGb`,
 * `ramGb`, `batteryMah`, `batteryHours`, `refreshHz` and `warrantyMonths` are all optional,
 * and `withoutEmptyValues` drops anything that resolved to nothing. Screen sizes used to be
 * derived with per-category arithmetic — `${screenInch}.6″`, `* 4` for TVs, `/ 3` for watches
 * — over a field that was fiction to begin with, so a 55-inch TV advertised itself as
 * "60″-class" and an Apple Watch as "4″". RAM, battery life, weight, warranty and year used
 * to be the same anti-pattern in a different field: `RAM_BY_CATEGORY` gave every laptop
 * "16 GB" regardless of the model, "battery: 85%"/"92%" was a fixed literal shared by the
 * whole category, and every product claimed to be released in "2025"/"2024" no matter when
 * it actually shipped.
 *
 * `labelKey` is always translated (the field names — "Screen size:", "RAM:" — are UI copy).
 * A `value` stays plain text when it is language-neutral: "14.2″", "512 GB", "Apple" and
 * "OLED" read the same everywhere, and giving each one its own key would mean a dictionary
 * entry per product per language. A value that is an actual English *word* carries a
 * `valueKey` instead — "Yes", "30 hours" and "48 MP main camera" were rendering
 * untranslated on every Armenian and Russian product page. The view resolves `valueKey`
 * when present and falls back to `value`.
 */
import { formatStorageGb } from "shared/lib/formatStorageGb";
import { getBrandLabel } from "./productBrands";

/** Drops rows whose value came out empty because the product has no such field. */
const withoutEmptyValues = (rows) => rows.filter((row) => row && (row.value || row.valueKey));

const screenSizeRow = (p, labelKey) => ({
  labelKey,
  value: typeof p.screenInch === "number" ? `${p.screenInch}″` : "",
});

const storageRow = (p, labelKey, suffix = "") => {
  const size = formatStorageGb(p.storageGb);
  return { labelKey, value: size ? `${size}${suffix}` : "" };
};

const ramRow = (p, labelKey) => ({
  labelKey,
  value: typeof p.ramGb === "number" ? `${p.ramGb} GB` : "",
});

const refreshRateRow = (p, labelKey) => ({
  labelKey,
  value: typeof p.refreshHz === "number" ? `${p.refreshHz} Hz` : "",
});

/** A device's real rated battery capacity — smartphones, tablets, consoles, accessories. */
const batteryCapacityRow = (p, labelKey) => ({
  labelKey,
  value: typeof p.batteryMah === "number" ? `${p.batteryMah} mAh` : "",
});

/**
 * A device's real rated battery *life* — headphones, speakers and wearables state hours of
 * use rather than a capacity figure, matching how these product pages have always read.
 */
const batteryHoursRow = (p, labelKey) => {
  if (typeof p.batteryHours !== "number") return null;
  return {
    labelKey,
    valueKey: "productDetail.specsExtended.values.batteryHours",
    valueParams: { hours: String(p.batteryHours) },
  };
};

/** "233 g" under a kilogram, "16.6 kg" at or above one — a TV quoted in bare grams reads oddly. */
const formatWeightGrams = (grams) => {
  if (typeof grams !== "number" || grams <= 0) return "";
  if (grams < 1000) return `${grams} g`;
  const kg = Math.round((grams / 1000) * 100) / 100;
  return `${kg} kg`;
};

const weightRow = (p, labelKey) => ({ labelKey, value: formatWeightGrams(p.weightGrams) });

const warrantyRow = (p, labelKey) => {
  if (typeof p.warrantyMonths !== "number" || p.warrantyMonths <= 0) return null;
  return {
    labelKey,
    valueKey: "productDetail.specsExtended.values.warrantyMonths",
    valueParams: { months: String(p.warrantyMonths) },
  };
};

/** The manufacturer's own model code — the same identifier the Product JSON-LD's `mpn` carries. */
const modelNumberRow = (p, labelKey) => ({
  labelKey,
  value: typeof p.mpn === "string" ? p.mpn : "",
});

const yearRow = (p, labelKey) => ({
  labelKey,
  value: typeof p.releaseYear === "number" ? String(p.releaseYear) : "",
});

/**
 * Installed RAM used to be a per-category fixture ("16 GB" for every laptop, "8 GB" for
 * every tablet) rather than catalog data — unlike storage, no product title states it, but
 * the catalog now carries each model's own real figure, so the fixture is gone.
 */

/** @param {import("./productCatalog").CatalogProduct} p */
const buildBrief = (p) => {
  switch (p.categoryId) {
    case "laptops":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        storageRow(p, "productDetail.specsBrief.storage", " SSD"),
        ramRow(p, "productDetail.specsBrief.ram"),
        yearRow(p, "productDetail.specsBrief.year"),
      ]);
    case "smartphones":
    case "tablets":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        storageRow(p, "productDetail.specsBrief.storage"),
        ramRow(p, "productDetail.specsBrief.ram"),
        batteryCapacityRow(p, "productDetail.specsBrief.battery"),
        yearRow(p, "productDetail.specsBrief.year"),
      ]);
    case "headphones":
      return withoutEmptyValues([
        batteryHoursRow(p, "productDetail.specsBrief.battery"),
        yearRow(p, "productDetail.specsBrief.year"),
      ]);
    case "wearables":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        storageRow(p, "productDetail.specsBrief.storage"),
        batteryHoursRow(p, "productDetail.specsBrief.battery"),
        yearRow(p, "productDetail.specsBrief.year"),
      ]);
    case "tv":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        yearRow(p, "productDetail.specsBrief.year"),
      ]);
    case "cameras":
      return withoutEmptyValues([yearRow(p, "productDetail.specsBrief.year")]);
    case "speakers":
      return withoutEmptyValues([batteryHoursRow(p, "productDetail.specsBrief.battery")]);
    case "monitors":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        refreshRateRow(p, "productDetail.specsExtended.refreshRate"),
        yearRow(p, "productDetail.specsBrief.year"),
      ]);
    case "consoles":
      return withoutEmptyValues([
        storageRow(p, "productDetail.specsBrief.storage"),
        batteryCapacityRow(p, "productDetail.specsBrief.battery"),
        yearRow(p, "productDetail.specsBrief.year"),
      ]);
    case "accessories":
      return withoutEmptyValues([
        batteryCapacityRow(p, "productDetail.specsBrief.battery"),
        yearRow(p, "productDetail.specsBrief.year"),
      ]);
    default:
      return [];
  }
};

/** Facts every category's product carries, appended to every extended table. */
const buildUniversalExtended = (p, manufacturer) => [
  weightRow(p, "productDetail.specsExtended.weight"),
  warrantyRow(p, "productDetail.specsExtended.warranty"),
  modelNumberRow(p, "productDetail.specsExtended.modelNumber"),
  manufacturer,
];

/** @param {import("./productCatalog").CatalogProduct} p */
const buildExtended = (p) => {
  const manufacturer = {
    labelKey: "productDetail.specsExtended.manufacturer",
    value: getBrandLabel(p.brandId),
  };
  const bluetooth = { labelKey: "productDetail.specsExtended.bluetooth", value: "5.3" };

  switch (p.categoryId) {
    case "laptops":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: "OLED" },
        {
          labelKey: "productDetail.specsExtended.technology",
          value: typeof p.screenInch === "number" ? `${p.screenInch}″ Retina/OLED` : "",
        },
        storageRow(p, "productDetail.specsExtended.ssd"),
        refreshRateRow(p, "productDetail.specsExtended.refreshRate"),
        bluetooth,
        ...buildUniversalExtended(p, manufacturer),
      ]);
    case "smartphones":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: "OLED" },
        {
          labelKey: "productDetail.specsExtended.camera",
          valueKey: "productDetail.specsExtended.values.mainCamera",
          valueParams: { mp: "48" },
        },
        /**
         * `productDetail.specsBrief.storage`, not `specsExtended.ssd` — a phone's flash
         * storage isn't a solid-state drive, unlike the laptops case below which genuinely
         * has one. Reuses the brief section's already-neutral "Storage:" label instead of
         * minting a near-duplicate key.
         */
        storageRow(p, "productDetail.specsBrief.storage"),
        refreshRateRow(p, "productDetail.specsExtended.refreshRate"),
        bluetooth,
        ...buildUniversalExtended(p, manufacturer),
      ]);
    case "tablets":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: "Liquid Retina" },
        storageRow(p, "productDetail.specsBrief.storage"),
        refreshRateRow(p, "productDetail.specsExtended.refreshRate"),
        bluetooth,
        ...buildUniversalExtended(p, manufacturer),
      ]);
    case "headphones":
      return withoutEmptyValues([
        {
          labelKey: "productDetail.specsExtended.microphone",
          valueKey: "productDetail.specsExtended.values.yes",
        },
        bluetooth,
        ...buildUniversalExtended(p, manufacturer),
      ]);
    case "wearables":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: "Always-On Retina" },
        storageRow(p, "productDetail.specsBrief.storage"),
        bluetooth,
        ...buildUniversalExtended(p, manufacturer),
      ]);
    case "tv":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: p.panelType || "LED" },
        { labelKey: "productDetail.specsExtended.technology", value: "HDR10+" },
        refreshRateRow(p, "productDetail.specsExtended.refreshRate"),
        ...buildUniversalExtended(p, manufacturer),
      ]);
    case "cameras": {
      /**
       * "f/1.4 aperture" used to print on every product in this category, including camera
       * bodies, an action camera and a drone that have no such spec — only an interchangeable
       * lens (`lensAperture`) actually carries a fixed maximum aperture.
       */
      const technologyRow = p.lensAperture
        ? { labelKey: "productDetail.specsExtended.technology", value: `${p.lensAperture} aperture` }
        : {
            labelKey: "productDetail.specsExtended.technology",
            valueKey:
              p.cameraKind === "action"
                ? "productDetail.specsExtended.values.actionCamera"
                : p.cameraKind === "drone"
                  ? "productDetail.specsExtended.values.droneCamera"
                  : "productDetail.specsExtended.values.mirrorlessBody",
          };
      return withoutEmptyValues([technologyRow, ...buildUniversalExtended(p, manufacturer)]);
    }
    case "speakers":
      return withoutEmptyValues([bluetooth, ...buildUniversalExtended(p, manufacturer)]);
    case "monitors":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: p.panelType || "IPS" },
        ...buildUniversalExtended(p, manufacturer),
      ]);
    case "consoles":
      return withoutEmptyValues([
        ramRow(p, "productDetail.specsBrief.ram"),
        refreshRateRow(p, "productDetail.specsExtended.refreshRate"),
        ...buildUniversalExtended(p, manufacturer),
      ]);
    case "accessories":
      return withoutEmptyValues(buildUniversalExtended(p, manufacturer));
    default:
      return withoutEmptyValues(buildUniversalExtended(p, manufacturer));
  }
};

/** @param {import("./productCatalog").CatalogProduct} product */
export const buildSpecsForProduct = (product) => ({
  brief: buildBrief(product),
  extended: buildExtended(product),
});
