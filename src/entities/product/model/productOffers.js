import { buildColorOptionsForProduct } from "./productColors";
import { buildVariantsForProduct } from "./productVariants";

/**
 * Generated per-product offers — previously `mockProductOffers` was one fixed list of
 * 6 offers shared by every product page (an AirPods page and a MacBook page showed the
 * identical 3 shops at the identical 800k-1.08M AMD prices), which also meant the
 * page's own JSON-LD `AggregateOffer` (built from the real product price) contradicted
 * what the page visibly showed.
 *
 * Kept to the same 3 recurring shops (translated names/URLs unchanged) so no i18n
 * content is lost — only the price, variant list and color options are now derived
 * from the actual product instead of being hardcoded.
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
