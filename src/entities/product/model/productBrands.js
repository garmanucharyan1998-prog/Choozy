/**
 * The one brand list. It existed three times — a `BRAND_LABEL` map in `productSpecs`, another
 * in `productJsonLd`, and a hand-written `BRAND_OPTIONS` with translation keys in the filter
 * facet — and a product could be filed under a brand that made no sense without anything
 * noticing: the Sigma lens was `brandId: "sony"`, so the spec table, the Product JSON-LD and
 * the brand facet all agreed it was a Sony product.
 *
 * Brand names are proper nouns and read the same in every locale, so they are plain strings
 * rather than translation keys. (The dictionary's own `filterPage.filters.brandNames` block
 * was removed with this: the facet has been labelled from here since it became data-derived,
 * so those six keys were copy nothing read — and a brand added here would never have got one.)
 *
 * Only brands the catalog actually stocks belong here: `BRAND_OPTIONS` is derived from the
 * products, so an entry with nothing behind it is dead weight, not a promise.
 */
export const BRAND_LABEL = {
  acer: "Acer",
  amazfit: "Amazfit",
  anker: "Anker",
  apple: "Apple",
  asus: "ASUS",
  bose: "Bose",
  canon: "Canon",
  dell: "Dell",
  dji: "DJI",
  fujifilm: "Fujifilm",
  garmin: "Garmin",
  google: "Google",
  gopro: "GoPro",
  hisense: "Hisense",
  honor: "Honor",
  hp: "HP",
  jbl: "JBL",
  keychron: "Keychron",
  lenovo: "Lenovo",
  lg: "LG",
  logitech: "Logitech",
  marshall: "Marshall",
  meta: "Meta",
  microsoft: "Microsoft",
  msi: "MSI",
  nikon: "Nikon",
  nintendo: "Nintendo",
  nothing: "Nothing",
  philips: "Philips",
  razer: "Razer",
  samsung: "Samsung",
  sennheiser: "Sennheiser",
  sigma: "Sigma",
  sony: "Sony",
  tamron: "Tamron",
  tcl: "TCL",
  tplink: "TP-Link",
  xiaomi: "Xiaomi",
};

/** @param {string} brandId */
export const getBrandLabel = (brandId) => BRAND_LABEL[brandId] || brandId;

export default BRAND_LABEL;
