import { formatStorageGb } from "shared/lib/formatStorageGb";

/**
 * Catalog descriptions are a translation key plus the product's own numbers, resolved at
 * render time — not a sentence baked in English at module scope.
 *
 * They used to be the latter, which meant `/ru/singleproduct/…` and `/en/singleproduct/…`
 * differed from the Armenian page only in UI chrome. To a search engine those are three
 * near-duplicate URLs per product, and the Armenian and Russian versions were thin for the
 * queries they are supposed to answer.
 *
 * @param {{ categoryId: string, brandId?: string }} product
 * @returns {string} a key under `productDescriptions.*`
 */
export const getProductDescriptionKey = (product) => {
  if (product?.categoryId === "smartphones") {
    return product.brandId === "apple"
      ? "productDescriptions.smartphonesIos"
      : "productDescriptions.smartphonesAndroid";
  }
  const known = ["laptops", "headphones", "tablets", "tv", "wearables", "cameras", "speakers"];
  return known.includes(product?.categoryId)
    ? `productDescriptions.${product.categoryId}`
    : "productDescriptions.smartphonesAndroid";
};

/**
 * @param {{ categoryId: string, brandId?: string, screenInch?: number, storageGb?: number }} product
 * @param {(key: string, fallback?: string) => string} t
 * @returns {string}
 */
export const buildProductDescription = (product, t) => {
  if (!product) return "";
  const template = t(getProductDescriptionKey(product));
  return template
    .replace("{{screen}}", typeof product.screenInch === "number" ? `${product.screenInch}″` : "")
    .replace("{{storage}}", formatStorageGb(product.storageGb))
    .trim();
};

export default buildProductDescription;
