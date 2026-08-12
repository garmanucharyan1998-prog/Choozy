import { buildColorOptionsForProduct } from "./productColors";
import { buildVariantsForProduct } from "./productVariants";

/**
 * Generated per-product offers — previously `mockProductOffers` was one fixed list of
 * 6 offers shared by every product page (an AirPods page and a MacBook page showed the
 * identical 3 shops at the identical 800k-1.08M AMD prices), which also meant the
 * page's own JSON-LD `AggregateOffer` (built from the real product price) contradicted
 * what the page visibly showed.
 *
 * 12 shops, not 3: with only 3 offers the Best Offers table's own "see more" button was
 * unreachable dead code — `canLoadMore` requires more offers than the initial page of 3,
 * so it could never once evaluate `true` against this list. Every domain below was checked
 * to actually resolve before being added; `location` is a hand-placed Yerevan-area point
 * for the map widget, not a real street address.
 */
const SHOPS = [
  {
    shopId: "zigzag",
    shopNameKey: "productOffers.shops.zigzag",
    shopUrlLabel: "zigzag.am",
    logoLabel: "ZIGZAG",
    badgeKey: "productOffers.badges.discount",
    url: "https://zigzag.am/",
    priceFactor: 0.97,
    location: { lat: 40.1872, lng: 44.5152 },
  },
  {
    shopId: "vega",
    shopNameKey: "productOffers.shops.vega",
    shopUrlLabel: "vegadigital.am",
    logoLabel: "VEGA",
    badgeKey: "productOffers.badges.new",
    url: "https://vegadigital.am/",
    priceFactor: 1.02,
    location: { lat: 40.1766, lng: 44.5132 },
  },
  {
    shopId: "mobilecentre",
    shopNameKey: "productOffers.shops.mobileCentre",
    shopUrlLabel: "mobilecentre.am",
    logoLabel: "MC",
    badgeKey: null,
    url: "https://mobilecentre.am/",
    priceFactor: 1.08,
    location: { lat: 40.1889, lng: 44.5038 },
  },
  {
    shopId: "vlv",
    shopNameKey: "productOffers.shops.vlv",
    shopUrlLabel: "vlv.am",
    logoLabel: "VLV",
    badgeKey: null,
    url: "https://vlv.am/",
    priceFactor: 0.95,
    location: { lat: 40.1831, lng: 44.5136 },
  },
  {
    shopId: "ispace",
    shopNameKey: "productOffers.shops.ispace",
    shopUrlLabel: "ispace.am",
    logoLabel: "ISPACE",
    badgeKey: null,
    url: "https://ispace.am/",
    priceFactor: 1.05,
    location: { lat: 40.1745, lng: 44.5211 },
  },
  {
    shopId: "gadget",
    shopNameKey: "productOffers.shops.gadget",
    shopUrlLabel: "gadget.am",
    logoLabel: "GADGET",
    badgeKey: null,
    url: "https://gadget.am/",
    priceFactor: 0.99,
    location: { lat: 40.1902, lng: 44.4977 },
  },
  {
    shopId: "multimedia",
    shopNameKey: "productOffers.shops.multimedia",
    shopUrlLabel: "multimedia.am",
    logoLabel: "MM",
    badgeKey: null,
    url: "https://multimedia.am/",
    priceFactor: 1.11,
    location: { lat: 40.1699, lng: 44.5079 },
  },
  {
    shopId: "tegh",
    shopNameKey: "productOffers.shops.tegh",
    shopUrlLabel: "tegh.am",
    logoLabel: "TEGH",
    badgeKey: null,
    url: "https://tegh.am/",
    priceFactor: 1.0,
    location: { lat: 40.1958, lng: 44.5205 },
  },
  {
    shopId: "tashir",
    shopNameKey: "productOffers.shops.tashir",
    shopUrlLabel: "tashir.am",
    logoLabel: "TASHIR",
    badgeKey: null,
    url: "https://tashir.am/",
    priceFactor: 1.04,
    location: { lat: 40.1817, lng: 44.4869 },
  },
  {
    shopId: "sas",
    shopNameKey: "productOffers.shops.sas",
    shopUrlLabel: "sas.am",
    logoLabel: "SAS",
    badgeKey: "productOffers.badges.discount",
    url: "https://sas.am/",
    priceFactor: 0.93,
    location: { lat: 40.1621, lng: 44.5147 },
  },
  {
    shopId: "unicomp",
    shopNameKey: "productOffers.shops.unicomp",
    shopUrlLabel: "unicomp.am",
    logoLabel: "UNICOMP",
    badgeKey: "productOffers.badges.new",
    url: "https://unicomp.am/",
    priceFactor: 1.07,
    location: { lat: 40.1876, lng: 44.4903 },
  },
  {
    shopId: "elektronika",
    shopNameKey: "productOffers.shops.elektronika",
    shopUrlLabel: "elektronika.am",
    logoLabel: "EL",
    badgeKey: null,
    url: "https://elektronika.am/",
    priceFactor: 1.015,
    location: { lat: 40.1735, lng: 44.4952 },
  },
];

const roundToThousand = (value) => Math.round(value / 1000) * 1000;

/**
 * @param {{ id: string, priceValue: number, colorId: string, categoryId: string, ramGb: number }} product
 */
export const getOffersForProduct = (product) => {
  if (!product) return [];

  const colors = buildColorOptionsForProduct(product.colorId);
  const variants = buildVariantsForProduct(product);

  return SHOPS.map((shop, index) => ({
    id: `${product.id}-${shop.shopId}`,
    shopNameKey: shop.shopNameKey,
    shopUrlLabel: shop.shopUrlLabel,
    logoLabel: shop.logoLabel,
    badgeKey: shop.badgeKey,
    descriptionKey: "productOffers.offerDescription",
    priceAmd: roundToThousand(product.priceValue * shop.priceFactor),
    url: shop.url,
    location: shop.location,
    variants,
    defaultVariantIndex: 0,
    colors,
    defaultColorIndex: index % colors.length,
  }));
};

export default getOffersForProduct;
