/**
 * Demo offers for the product detail page map + best-offers sections.
 * Replace with API data once backend integration is available.
 */

export const defaultMapCenter = {
  lat: 40.1792,
  lng: 44.4991,
  zoom: 11,
};

const SHARED_VARIANT_KEYS = [
  "productDetail.variants.v256a",
  "productDetail.variants.v256b",
  "productDetail.variants.v1tb",
];

const VARIANT_KEYS_256 = [
  "productDetail.variants.v256a",
  "productDetail.variants.v256b",
];

const VARIANT_KEYS_1TB = ["productDetail.variants.v1tb"];

const COLOR_YELLOW = { id: "yellow", hex: "#f2c94c" };
const COLOR_BLACK = { id: "black", hex: "#1c1c1e" };
const COLOR_WHITE = { id: "white", hex: "#f5f5f7" };
const COLOR_BLUE = { id: "blue", hex: "#152147" };

export const mockProductOffers = [
  {
    id: "zigzag-1",
    shopNameKey: "productOffers.shops.zigzag",
    shopUrlLabel: "zigzag.am",
    logoLabel: "ZIGZAG",
    badgeKey: "productOffers.badges.discount",
    descriptionKey: "productOffers.offerDescription",
    variantKey: "productDetail.variants.v256b",
    variantKeys: SHARED_VARIANT_KEYS,
    supportedVariantKeys: VARIANT_KEYS_256,
    defaultVariantIndex: 1,
    colors: [COLOR_YELLOW, COLOR_BLACK, COLOR_WHITE, COLOR_BLUE],
    defaultColorIndex: 0,
    priceAmd: 850000,
    url: "https://zigzag.am/",
    location: { lat: 40.1872, lng: 44.5152 },
  },
  {
    id: "vega-1",
    shopNameKey: "productOffers.shops.vega",
    shopUrlLabel: "vegadigital.am",
    logoLabel: "VEGA",
    badgeKey: "productOffers.badges.new",
    descriptionKey: "productOffers.offerDescription",
    variantKey: "productDetail.variants.v256b",
    variantKeys: SHARED_VARIANT_KEYS,
    supportedVariantKeys: VARIANT_KEYS_256,
    defaultVariantIndex: 1,
    colors: [COLOR_BLACK, COLOR_YELLOW, COLOR_BLUE],
    defaultColorIndex: 0,
    priceAmd: 890000,
    url: "https://vegadigital.am/",
    location: { lat: 40.1766, lng: 44.5132 },
  },
  {
    id: "mobilecentre-1",
    shopNameKey: "productOffers.shops.mobileCentre",
    shopUrlLabel: "mobilecentre.am",
    logoLabel: "MC",
    badgeKey: null,
    descriptionKey: "productOffers.offerDescription",
    variantKey: "productDetail.variants.v1tb",
    variantKeys: SHARED_VARIANT_KEYS,
    supportedVariantKeys: VARIANT_KEYS_1TB,
    defaultVariantIndex: 2,
    colors: [COLOR_BLUE, COLOR_BLACK, COLOR_WHITE],
    defaultColorIndex: 0,
    priceAmd: 1079000,
    url: "https://mobilecentre.am/",
    location: { lat: 40.1889, lng: 44.5038 },
  },
  {
    id: "zigzag-2",
    shopNameKey: "productOffers.shops.zigzag",
    shopUrlLabel: "zigzag.am",
    logoLabel: "ZIGZAG",
    badgeKey: "productOffers.badges.discount",
    descriptionKey: "productOffers.offerDescription",
    variantKey: "productDetail.variants.v256b",
    variantKeys: SHARED_VARIANT_KEYS,
    supportedVariantKeys: VARIANT_KEYS_256,
    defaultVariantIndex: 1,
    colors: [COLOR_WHITE, COLOR_BLACK, COLOR_YELLOW, COLOR_BLUE],
    defaultColorIndex: 0,
    priceAmd: 839000,
    url: "https://zigzag.am/",
    location: { lat: 40.1811, lng: 44.5212 },
  },
  {
    id: "vega-2",
    shopNameKey: "productOffers.shops.vega",
    shopUrlLabel: "vegadigital.am",
    logoLabel: "VEGA",
    badgeKey: null,
    descriptionKey: "productOffers.offerDescription",
    variantKey: "productDetail.variants.v256b",
    variantKeys: SHARED_VARIANT_KEYS,
    supportedVariantKeys: VARIANT_KEYS_256,
    defaultVariantIndex: 1,
    colors: [COLOR_BLACK, COLOR_YELLOW, COLOR_BLUE],
    defaultColorIndex: 1,
    priceAmd: 884000,
    url: "https://vegadigital.am/",
    location: { lat: 40.1809, lng: 44.4988 },
  },
  {
    id: "mobilecentre-2",
    shopNameKey: "productOffers.shops.mobileCentre",
    shopUrlLabel: "mobilecentre.am",
    logoLabel: "MC",
    badgeKey: "productOffers.badges.new",
    descriptionKey: "productOffers.offerDescription",
    variantKey: "productDetail.variants.v1tb",
    variantKeys: SHARED_VARIANT_KEYS,
    supportedVariantKeys: VARIANT_KEYS_1TB,
    defaultVariantIndex: 2,
    colors: [COLOR_BLACK, COLOR_WHITE, COLOR_BLUE],
    defaultColorIndex: 0,
    priceAmd: 1099000,
    url: "https://mobilecentre.am/",
    location: { lat: 40.1921, lng: 44.5121 },
  },
];
