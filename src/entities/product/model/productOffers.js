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
 *
 * Ordered by `popularityRank` — the "most popular" sort option is the presenter's default
 * and simply keeps this order, so the order is the data behind that option rather than an
 * accident of how the list was typed.
 *
 * Each shop carries the categories a shop of its kind actually carries. All twelve used to
 * list every product, so a camera lens was on sale at a supermarket and an Apple premium
 * reseller stocked Xbox controllers; every product still reaches at least six shops
 * (enforced in `productOffers.test.js`), which keeps the "see more" button reachable
 * everywhere.
 */
const ALL_CATEGORIES = [
  "smartphones",
  "laptops",
  "tablets",
  "monitors",
  "tv",
  "headphones",
  "speakers",
  "wearables",
  "cameras",
  "consoles",
  "accessories",
];

/**
 * `priceFactor` is the shop's own position in the market (a discounter sits below 1, a
 * premium reseller above it); the per-product jitter added in `getOffersForProduct` is what
 * decides the actual winner for a given product. The factors used to span 0.93-1.11 with no
 * jitter at all, so the cheapest shop was *the same shop on all 108 products* — a price
 * comparison where the answer never changes is not a comparison.
 *
 * `ratingValue`/`reviewCount` back the "shop rating" sort option and the score printed on
 * each row. `carriesNewArrivals` marks the authorized/flagship sellers that get a launch
 * allocation, which is what the "new" badge is allowed to mean.
 */
const SHOPS = [
  {
    shopId: "zigzag",
    shopNameKey: "productOffers.shops.zigzag",
    shopUrlLabel: "zigzag.am",
    logoLabel: "ZIGZAG",
    descriptionKey: "productOffers.shopTerms.zigzag",
    url: "https://zigzag.am/",
    priceFactor: 0.97,
    ratingValue: 4.6,
    reviewCount: 2140,
    carriesNewArrivals: true,
    categories: ALL_CATEGORIES,
    location: { lat: 40.1872, lng: 44.5152 },
  },
  {
    shopId: "vlv",
    shopNameKey: "productOffers.shops.vlv",
    shopUrlLabel: "vlv.am",
    logoLabel: "VLV",
    descriptionKey: "productOffers.shopTerms.vlv",
    url: "https://vlv.am/",
    priceFactor: 0.96,
    ratingValue: 4.4,
    reviewCount: 1685,
    carriesNewArrivals: true,
    categories: ALL_CATEGORIES,
    location: { lat: 40.1831, lng: 44.5136 },
  },
  {
    shopId: "vega",
    shopNameKey: "productOffers.shops.vega",
    shopUrlLabel: "vegadigital.am",
    logoLabel: "VEGA",
    descriptionKey: "productOffers.shopTerms.vega",
    url: "https://vegadigital.am/",
    priceFactor: 1.02,
    ratingValue: 4.5,
    reviewCount: 1120,
    carriesNewArrivals: true,
    categories: ALL_CATEGORIES,
    location: { lat: 40.1766, lng: 44.5132 },
  },
  {
    shopId: "mobilecentre",
    shopNameKey: "productOffers.shops.mobileCentre",
    shopUrlLabel: "mobilecentre.am",
    logoLabel: "MC",
    descriptionKey: "productOffers.shopTerms.mobileCentre",
    url: "https://mobilecentre.am/",
    priceFactor: 1.075,
    ratingValue: 4.3,
    reviewCount: 640,
    carriesNewArrivals: true,
    categories: ["smartphones", "tablets", "wearables", "headphones", "speakers", "accessories"],
    location: { lat: 40.1889, lng: 44.5038 },
  },
  {
    shopId: "ispace",
    shopNameKey: "productOffers.shops.ispace",
    shopUrlLabel: "ispace.am",
    logoLabel: "ISPACE",
    descriptionKey: "productOffers.shopTerms.ispace",
    url: "https://ispace.am/",
    priceFactor: 1.065,
    ratingValue: 4.8,
    reviewCount: 930,
    carriesNewArrivals: true,
    categories: ALL_CATEGORIES,
    /** An Apple premium reseller sells Apple. Nothing else on this list is brand-locked. */
    brandIds: ["apple"],
    location: { lat: 40.1745, lng: 44.5211 },
  },
  {
    shopId: "tegh",
    shopNameKey: "productOffers.shops.tegh",
    shopUrlLabel: "tegh.am",
    logoLabel: "TEGH",
    descriptionKey: "productOffers.shopTerms.tegh",
    url: "https://tegh.am/",
    priceFactor: 1.0,
    ratingValue: 4.2,
    reviewCount: 415,
    carriesNewArrivals: false,
    categories: ALL_CATEGORIES,
    location: { lat: 40.1958, lng: 44.5205 },
  },
  {
    shopId: "gadget",
    shopNameKey: "productOffers.shops.gadget",
    shopUrlLabel: "gadget.am",
    logoLabel: "GADGET",
    descriptionKey: "productOffers.shopTerms.gadget",
    url: "https://gadget.am/",
    priceFactor: 0.985,
    ratingValue: 4.4,
    reviewCount: 380,
    carriesNewArrivals: true,
    categories: [
      "smartphones",
      "tablets",
      "wearables",
      "headphones",
      "speakers",
      "consoles",
      "accessories",
    ],
    location: { lat: 40.1902, lng: 44.4977 },
  },
  {
    shopId: "unicomp",
    shopNameKey: "productOffers.shops.unicomp",
    shopUrlLabel: "unicomp.am",
    logoLabel: "UNICOMP",
    descriptionKey: "productOffers.shopTerms.unicomp",
    url: "https://unicomp.am/",
    priceFactor: 1.04,
    ratingValue: 4.5,
    reviewCount: 296,
    carriesNewArrivals: true,
    categories: ["laptops", "tablets", "monitors", "consoles", "accessories"],
    location: { lat: 40.1876, lng: 44.4903 },
  },
  {
    shopId: "multimedia",
    shopNameKey: "productOffers.shops.multimedia",
    shopUrlLabel: "multimedia.am",
    logoLabel: "MM",
    descriptionKey: "productOffers.shopTerms.multimedia",
    url: "https://multimedia.am/",
    priceFactor: 1.055,
    ratingValue: 4.1,
    reviewCount: 244,
    carriesNewArrivals: false,
    categories: ["laptops", "tablets", "monitors", "cameras", "accessories"],
    location: { lat: 40.1699, lng: 44.5079 },
  },
  {
    shopId: "tashir",
    shopNameKey: "productOffers.shops.tashir",
    shopUrlLabel: "tashir.am",
    logoLabel: "TASHIR",
    descriptionKey: "productOffers.shopTerms.tashir",
    url: "https://tashir.am/",
    priceFactor: 1.03,
    ratingValue: 4.0,
    reviewCount: 512,
    carriesNewArrivals: false,
    categories: ["smartphones", "laptops", "monitors", "tv", "headphones", "speakers", "consoles"],
    location: { lat: 40.1817, lng: 44.4869 },
  },
  {
    shopId: "elektronika",
    shopNameKey: "productOffers.shops.elektronika",
    shopUrlLabel: "elektronika.am",
    logoLabel: "EL",
    descriptionKey: "productOffers.shopTerms.elektronika",
    url: "https://elektronika.am/",
    priceFactor: 0.995,
    ratingValue: 4.2,
    reviewCount: 188,
    carriesNewArrivals: false,
    categories: ["monitors", "tv", "headphones", "speakers", "cameras", "accessories"],
    location: { lat: 40.1735, lng: 44.4952 },
  },
  {
    shopId: "sas",
    shopNameKey: "productOffers.shops.sas",
    shopUrlLabel: "sas.am",
    logoLabel: "SAS",
    descriptionKey: "productOffers.shopTerms.sas",
    url: "https://sas.am/",
    priceFactor: 0.955,
    ratingValue: 3.9,
    reviewCount: 1470,
    carriesNewArrivals: false,
    /** A supermarket's electronics aisle: small, giftable things only. */
    categories: ["smartphones", "headphones", "speakers", "wearables", "accessories"],
    location: { lat: 40.1621, lng: 44.5147 },
  },
];

/** Exported for the shop-coverage test and anything that needs the roster without a product. */
export const OFFER_SHOP_COUNT = SHOPS.length;

/**
 * Rounded by magnitude rather than always to the nearest 1,000: a thousand-dram step is 4% of
 * a 24,000 AMD cable (so the quoted prices of two shops that differ by 2% collapsed onto the
 * same number) and invisible noise on a 1.4M laptop, where no shop posts a price that precise.
 */
const priceStepFor = (amount) => {
  if (amount < 100_000) return 500;
  if (amount < 500_000) return 1000;
  return 5000;
};

const roundToStep = (value, step) => Math.round(value / step) * step;

/**
 * Same positional hash as `productPriceHistory` — a plain character-code sum is
 * order-insensitive, so "fp-12"/"fp-21" and shop pairs that are permutations of each other
 * would land on the same seed and quote the same price.
 */
const hashString = (value) =>
  String(value)
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);

const seededFraction = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** +/-4% around the shop's own market position, stable for a given product/shop pair. */
const JITTER_SPAN = 0.08;

const jitterFor = (productId, shopId) =>
  (seededFraction(hashString(`${productId}::${shopId}`)) - 0.5) * JITTER_SPAN;

const shopCarries = (shop, product) => {
  if (Array.isArray(shop.brandIds) && !shop.brandIds.includes(product.brandId)) return false;
  return shop.categories.includes(product.categoryId);
};

/**
 * A badge has to be earned by the row it sits on. Both used to be fixed per shop, so
 * Zigzag advertised a "discount" on all 108 products — including the ones it quoted the
 * highest price for — and "new" appeared on a 2019 lens.
 */
const NEW_ARRIVAL_FROM_YEAR = 2025;

const badgeKeyFor = (shop, product, priceAmd) => {
  if (priceAmd <= product.priceValue * 0.97) return "productOffers.badges.discount";
  if (shop.carriesNewArrivals && product.releaseYear >= NEW_ARRIVAL_FROM_YEAR) {
    return "productOffers.badges.new";
  }
  return null;
};

/**
 * @param {{ id: string, priceValue: number, colorId: string, categoryId: string, brandId: string, releaseYear?: number }} product
 */
export const getOffersForProduct = (product) => {
  if (!product) return [];

  const colors = buildColorOptionsForProduct(product.colorId);
  const variants = buildVariantsForProduct(product);

  return SHOPS.filter((shop) => shopCarries(shop, product)).map((shop, index) => {
    const factor = shop.priceFactor + jitterFor(product.id, shop.shopId);
    const priceAmd = roundToStep(product.priceValue * factor, priceStepFor(product.priceValue));

    return {
      id: `${product.id}-${shop.shopId}`,
      shopNameKey: shop.shopNameKey,
      shopUrlLabel: shop.shopUrlLabel,
      logoLabel: shop.logoLabel,
      badgeKey: badgeKeyFor(shop, product, priceAmd),
      descriptionKey: shop.descriptionKey,
      shopRatingValue: shop.ratingValue,
      shopReviewCount: shop.reviewCount,
      priceAmd,
      url: shop.url,
      location: shop.location,
      variants,
      defaultVariantIndex: 0,
      colors,
      defaultColorIndex: index % colors.length,
    };
  });
};

export default getOffersForProduct;
