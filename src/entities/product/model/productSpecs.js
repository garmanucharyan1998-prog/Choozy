/**
 * Spec rows, computed per product from its own category/screenInch/ramGb/brandId
 * instead of every product sharing one literal set of rows (`specsBriefRows` /
 * `specsExtendedRows` on `mockProductDetail`) — a TV and a camera lens used to show the
 * exact same "Screen type: LCD / Built-in mic: Yes / SSD: 512 GB" table.
 *
 * `labelKey` stays translated (the field names — "Screen size:", "RAM:" — are UI copy).
 * `value` is plain text, not a translation key: like the product title, a spec value
 * ("14″", "16 GB", "Apple") doesn't carry different meaning per locale the way a color
 * name does, and giving every product its own `valueKey` would mean one new dictionary
 * entry per product per language.
 */
const BRAND_LABEL = {
  apple: "Apple",
  samsung: "Samsung",
  sony: "Sony",
  dell: "Dell",
  lenovo: "Lenovo",
  hp: "HP",
};

const brandLabel = (brandId) => BRAND_LABEL[brandId] || brandId;

/** @param {{ categoryId: string, screenInch: number, ramGb: number, brandId: string }} p */
const buildBrief = (p) => {
  switch (p.categoryId) {
    case "laptops":
      return [
        { labelKey: "productDetail.specsBrief.screenSize", value: `${p.screenInch}″` },
        { labelKey: "productDetail.specsBrief.storage", value: `${p.ramGb >= 128 ? p.ramGb / 1000 + " TB" : p.ramGb + " GB"} SSD` },
        { labelKey: "productDetail.specsBrief.ram", value: "16 GB" },
        { labelKey: "productDetail.specsBrief.battery", value: "85%" },
        { labelKey: "productDetail.specsBrief.year", value: "2025" },
      ];
    case "smartphones":
    case "tablets":
      return [
        { labelKey: "productDetail.specsBrief.screenSize", value: `${p.screenInch}″` },
        { labelKey: "productDetail.specsBrief.storage", value: `${p.ramGb >= 128 ? p.ramGb / 1000 + " TB" : p.ramGb + " GB"}` },
        { labelKey: "productDetail.specsBrief.ram", value: p.categoryId === "tablets" ? "8 GB" : "6 GB" },
        { labelKey: "productDetail.specsBrief.battery", value: "92%" },
        { labelKey: "productDetail.specsBrief.year", value: "2025" },
      ];
    case "headphones":
      return [
        { labelKey: "productDetail.specsBrief.battery", value: `${p.ramGb > 4 ? "30" : "8"} hours` },
        { labelKey: "productDetail.specsBrief.year", value: "2024" },
      ];
    case "wearables":
      return [
        { labelKey: "productDetail.specsBrief.screenSize", value: `${p.screenInch / 3}″` },
        { labelKey: "productDetail.specsBrief.battery", value: "80 hours" },
        { labelKey: "productDetail.specsBrief.year", value: "2024" },
      ];
    case "tv":
      return [
        { labelKey: "productDetail.specsBrief.screenSize", value: `${p.screenInch * 4}″` },
        { labelKey: "productDetail.specsBrief.year", value: "2025" },
      ];
    case "cameras":
      return [{ labelKey: "productDetail.specsBrief.year", value: "2024" }];
    case "speakers":
      return [{ labelKey: "productDetail.specsBrief.battery", value: "24 hours" }];
    default:
      return [];
  }
};

/** @param {{ categoryId: string, screenInch: number, ramGb: number, brandId: string }} p */
const buildExtended = (p) => {
  const manufacturer = { labelKey: "productDetail.specsExtended.manufacturer", value: brandLabel(p.brandId) };
  const bluetooth = { labelKey: "productDetail.specsExtended.bluetooth", value: "5.3" };

  switch (p.categoryId) {
    case "laptops":
      return [
        { labelKey: "productDetail.specsExtended.screenType", value: "OLED" },
        { labelKey: "productDetail.specsExtended.technology", value: `${p.screenInch}″ Retina/OLED` },
        { labelKey: "productDetail.specsExtended.ssd", value: `${p.ramGb >= 128 ? p.ramGb / 1000 + " TB" : p.ramGb + " GB"}` },
        bluetooth,
        manufacturer,
      ];
    case "smartphones":
      return [
        { labelKey: "productDetail.specsExtended.screenType", value: "OLED" },
        { labelKey: "productDetail.specsExtended.matrix", value: "48 MP main camera" },
        { labelKey: "productDetail.specsExtended.ssd", value: `${p.ramGb >= 128 ? p.ramGb / 1000 + " TB" : p.ramGb + " GB"}` },
        bluetooth,
        manufacturer,
      ];
    case "tablets":
      return [
        { labelKey: "productDetail.specsExtended.screenType", value: "Liquid Retina" },
        { labelKey: "productDetail.specsExtended.ssd", value: `${p.ramGb >= 128 ? p.ramGb / 1000 + " TB" : p.ramGb + " GB"}` },
        bluetooth,
        manufacturer,
      ];
    case "headphones":
      return [
        { labelKey: "productDetail.specsExtended.microphone", value: "Yes" },
        bluetooth,
        manufacturer,
      ];
    case "wearables":
      return [
        { labelKey: "productDetail.specsExtended.screenType", value: "Always-On Retina" },
        bluetooth,
        manufacturer,
      ];
    case "tv":
      return [
        { labelKey: "productDetail.specsExtended.screenType", value: "Neo QLED 4K" },
        { labelKey: "productDetail.specsExtended.technology", value: "HDR10+" },
        manufacturer,
      ];
    case "cameras":
      return [{ labelKey: "productDetail.specsExtended.technology", value: "f/1.4 aperture" }, manufacturer];
    case "speakers":
      return [bluetooth, manufacturer];
    default:
      return [manufacturer];
  }
};

/** @param {{ categoryId: string, screenInch: number, ramGb: number, brandId: string }} product */
export const buildSpecsForProduct = (product) => ({
  brief: buildBrief(product),
  extended: buildExtended(product),
});
