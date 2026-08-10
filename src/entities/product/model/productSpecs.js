/**
 * Spec rows, computed per product from its own category/screenInch/storageGb/brandId
 * instead of every product sharing one literal set of rows (`specsBriefRows` /
 * `specsExtendedRows` on `mockProductDetail`) — a TV and a camera lens used to show the
 * exact same "Screen type: LCD / Built-in mic: Yes / SSD: 512 GB" table.
 *
 * Rows are only emitted for facts the product actually has: `screenInch` and `storageGb`
 * are optional in the catalog (headphones have neither). Screen sizes used to be derived
 * with per-category arithmetic — `${screenInch}.6″`, `* 4` for TVs, `/ 3` for watches —
 * over a field that was fiction to begin with, so a 55-inch TV advertised itself as
 * "60″-class" and an Apple Watch as "4″".
 *
 * `labelKey` stays translated (the field names — "Screen size:", "RAM:" — are UI copy).
 * `value` is plain text, not a translation key: like the product title, a spec value
 * ("14″", "16 GB", "Apple") doesn't carry different meaning per locale the way a color
 * name does, and giving every product its own `valueKey` would mean one new dictionary
 * entry per product per language.
 */
import { formatStorageGb } from "shared/lib/formatStorageGb";

const BRAND_LABEL = {
  apple: "Apple",
  samsung: "Samsung",
  sony: "Sony",
  dell: "Dell",
  lenovo: "Lenovo",
  hp: "HP",
};

const brandLabel = (brandId) => BRAND_LABEL[brandId] || brandId;

/** Drops rows whose value came out empty because the product has no such field. */
const withoutEmptyValues = (rows) => rows.filter((row) => row && row.value);

const screenSizeRow = (p, labelKey) => ({
  labelKey,
  value: typeof p.screenInch === "number" ? `${p.screenInch}″` : "",
});

const storageRow = (p, labelKey, suffix = "") => {
  const size = formatStorageGb(p.storageGb);
  return { labelKey, value: size ? `${size}${suffix}` : "" };
};

/**
 * Installed RAM is a per-category fixture, not catalog data — unlike storage, no product
 * title states it. Kept plausible per category rather than one value for everything.
 */
const RAM_BY_CATEGORY = { laptops: "16 GB", tablets: "8 GB", smartphones: "6 GB" };

/** @param {{ categoryId: string, screenInch?: number, storageGb?: number, brandId: string }} p */
const buildBrief = (p) => {
  const ram = RAM_BY_CATEGORY[p.categoryId];

  switch (p.categoryId) {
    case "laptops":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        storageRow(p, "productDetail.specsBrief.storage", " SSD"),
        { labelKey: "productDetail.specsBrief.ram", value: ram },
        { labelKey: "productDetail.specsBrief.battery", value: "85%" },
        { labelKey: "productDetail.specsBrief.year", value: "2025" },
      ]);
    case "smartphones":
    case "tablets":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        storageRow(p, "productDetail.specsBrief.storage"),
        { labelKey: "productDetail.specsBrief.ram", value: ram },
        { labelKey: "productDetail.specsBrief.battery", value: "92%" },
        { labelKey: "productDetail.specsBrief.year", value: "2025" },
      ]);
    case "headphones":
      return [
        { labelKey: "productDetail.specsBrief.battery", value: "30 hours" },
        { labelKey: "productDetail.specsBrief.year", value: "2024" },
      ];
    case "wearables":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        storageRow(p, "productDetail.specsBrief.storage"),
        { labelKey: "productDetail.specsBrief.battery", value: "80 hours" },
        { labelKey: "productDetail.specsBrief.year", value: "2024" },
      ]);
    case "tv":
      return withoutEmptyValues([
        screenSizeRow(p, "productDetail.specsBrief.screenSize"),
        { labelKey: "productDetail.specsBrief.year", value: "2025" },
      ]);
    case "cameras":
      return [{ labelKey: "productDetail.specsBrief.year", value: "2024" }];
    case "speakers":
      return [{ labelKey: "productDetail.specsBrief.battery", value: "24 hours" }];
    default:
      return [];
  }
};

/** @param {{ categoryId: string, screenInch?: number, storageGb?: number, brandId: string }} p */
const buildExtended = (p) => {
  const manufacturer = {
    labelKey: "productDetail.specsExtended.manufacturer",
    value: brandLabel(p.brandId),
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
        bluetooth,
        manufacturer,
      ]);
    case "smartphones":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: "OLED" },
        { labelKey: "productDetail.specsExtended.matrix", value: "48 MP main camera" },
        storageRow(p, "productDetail.specsExtended.ssd"),
        bluetooth,
        manufacturer,
      ]);
    case "tablets":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: "Liquid Retina" },
        storageRow(p, "productDetail.specsExtended.ssd"),
        bluetooth,
        manufacturer,
      ]);
    case "headphones":
      return [
        { labelKey: "productDetail.specsExtended.microphone", value: "Yes" },
        bluetooth,
        manufacturer,
      ];
    case "wearables":
      return withoutEmptyValues([
        { labelKey: "productDetail.specsExtended.screenType", value: "Always-On Retina" },
        storageRow(p, "productDetail.specsExtended.ssd"),
        bluetooth,
        manufacturer,
      ]);
    case "tv":
      return [
        { labelKey: "productDetail.specsExtended.screenType", value: "Neo QLED 4K" },
        { labelKey: "productDetail.specsExtended.technology", value: "HDR10+" },
        manufacturer,
      ];
    case "cameras":
      return [
        { labelKey: "productDetail.specsExtended.technology", value: "f/1.4 aperture" },
        manufacturer,
      ];
    case "speakers":
      return [bluetooth, manufacturer];
    default:
      return [manufacturer];
  }
};

/** @param {{ categoryId: string, screenInch?: number, storageGb?: number, brandId: string }} product */
export const buildSpecsForProduct = (product) => ({
  brief: buildBrief(product),
  extended: buildExtended(product),
});
