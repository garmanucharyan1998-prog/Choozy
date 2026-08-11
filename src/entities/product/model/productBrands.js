/**
 * The one brand list. It existed three times — a `BRAND_LABEL` map in `productSpecs`, another
 * in `productJsonLd`, and a hand-written `BRAND_OPTIONS` with translation keys in the filter
 * facet — and a product could be filed under a brand that made no sense without anything
 * noticing: the Sigma lens was `brandId: "sony"`, so the spec table, the Product JSON-LD and
 * the brand facet all agreed it was a Sony product.
 *
 * Brand names are proper nouns and read the same in every locale, so they are plain strings
 * rather than translation keys.
 */
export const BRAND_LABEL = {
  apple: "Apple",
  samsung: "Samsung",
  sony: "Sony",
  sigma: "Sigma",
  dell: "Dell",
  lenovo: "Lenovo",
  hp: "HP",
};

/** @param {string} brandId */
export const getBrandLabel = (brandId) => BRAND_LABEL[brandId] || brandId;

export default BRAND_LABEL;
