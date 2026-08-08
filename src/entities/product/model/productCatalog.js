/**
 * Single product catalog — the source of truth every part of the site reads from.
 *
 * Previously the catalog, the home page's two carousels, the related-products widget,
 * and the search-suggestion index were five separate hand-maintained lists with four
 * different id schemes (fp-N / top-N / var-N / rel-N), most of which just duplicated
 * the same handful of products under a different id and a hand-copied (and therefore
 * driftable) title/price/image. This is the one list; everything else is a view over it
 * (see productSelectors.js) or generated from it at read time (productDetails.js,
 * productOffers.js).
 */
import { getProductDetailHref } from "entities/product-detail/model/productRouteRegistry";
import { formatAmd } from "shared/lib/formatAmd";
import { PRODUCT_IMAGES } from "./productImages";

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   priceValue: number,
 *   image: string,
 *   categoryId: string,
 *   screenInch: number,
 *   brandId: string,
 *   ramGb: number,
 *   colorId: string,
 *   homeSection?: "top" | "variety",
 * }} CatalogProduct
 */

/** @type {Omit<CatalogProduct, "href" | "price" | "description">[]} */
const CATALOG_BASE = [
  {
    id: "fp-1",
    title: "Apple iPhone 17 Pro Max 256GB Cosmic Orange",
    priceValue: 739000,
    image: PRODUCT_IMAGES.iphoneOrange,
    categoryId: "smartphones",
    screenInch: 13,
    brandId: "apple",
    ramGb: 8,
    colorId: "orange",
    homeSection: "top",
  },
  {
    id: "fp-2",
    title: "Apple MacBook Pro 14 M4 Pro 512GB Space Black",
    priceValue: 1290000,
    image: PRODUCT_IMAGES.macbook,
    categoryId: "laptops",
    screenInch: 14,
    brandId: "apple",
    ramGb: 16,
    colorId: "black",
    homeSection: "top",
  },
  {
    id: "fp-3",
    title: "Sony WH-1000XM5 Wireless Headphones",
    priceValue: 165000,
    image: PRODUCT_IMAGES.headphones,
    /** Was "speakers" — these are over-ear headphones, not a speaker; the category had no real speaker in it. */
    categoryId: "headphones",
    screenInch: 11,
    brandId: "sony",
    ramGb: 4,
    colorId: "white",
    homeSection: "top",
  },
  {
    id: "fp-4",
    title: "Samsung Galaxy S25 Ultra 512GB Titanium Black",
    priceValue: 615000,
    image: PRODUCT_IMAGES.samsungPhone,
    categoryId: "smartphones",
    screenInch: 12,
    brandId: "samsung",
    ramGb: 12,
    colorId: "black",
    homeSection: "top",
  },
  {
    id: "fp-5",
    title: "Sigma 30mm f/1.4 Contemporary DC DN",
    priceValue: 185000,
    image: PRODUCT_IMAGES.lens,
    categoryId: "cameras",
    screenInch: 12,
    brandId: "sony",
    ramGb: 8,
    colorId: "black",
    homeSection: "top",
  },
  {
    id: "fp-6",
    title: "Samsung Neo QLED 55-inch 4K Smart TV",
    priceValue: 525000,
    image: PRODUCT_IMAGES.tv,
    categoryId: "tv",
    screenInch: 15,
    brandId: "samsung",
    ramGb: 16,
    colorId: "black",
    homeSection: "top",
  },
  {
    id: "fp-7",
    title: "Dell XPS 15 OLED 1TB Silver",
    priceValue: 1080000,
    image: PRODUCT_IMAGES.laptop,
    categoryId: "laptops",
    screenInch: 15,
    brandId: "dell",
    ramGb: 32,
    colorId: "grey",
  },
  {
    id: "fp-8",
    title: "HP Spectre x360 14 OLED",
    priceValue: 760000,
    image: PRODUCT_IMAGES.laptop,
    categoryId: "laptops",
    screenInch: 14,
    brandId: "hp",
    ramGb: 16,
    colorId: "navy",
  },
  {
    id: "fp-9",
    title: "Lenovo ThinkPad X1 Carbon Gen 12",
    priceValue: 950000,
    image: PRODUCT_IMAGES.laptop,
    categoryId: "laptops",
    screenInch: 14,
    brandId: "lenovo",
    ramGb: 16,
    colorId: "black",
  },
  {
    id: "fp-10",
    title: "Samsung Galaxy Tab S10 Ultra 256GB",
    priceValue: 585000,
    image: PRODUCT_IMAGES.tablet,
    categoryId: "tablets",
    screenInch: 14,
    brandId: "samsung",
    ramGb: 128,
    colorId: "grey",
    homeSection: "variety",
  },
  {
    id: "fp-11",
    title: "Apple iPad Pro 13 M4 256GB Silver",
    priceValue: 715000,
    image: PRODUCT_IMAGES.tablet,
    categoryId: "tablets",
    screenInch: 13,
    brandId: "apple",
    ramGb: 16,
    colorId: "white",
  },
  {
    id: "fp-12",
    title: "Apple AirPods Pro 2 USB-C",
    priceValue: 129000,
    image: PRODUCT_IMAGES.earbuds,
    categoryId: "headphones",
    screenInch: 11,
    brandId: "apple",
    ramGb: 4,
    colorId: "white",
    homeSection: "variety",
  },
  {
    id: "fp-13",
    title: "Apple Watch Ultra 2 Titanium",
    priceValue: 419000,
    image: PRODUCT_IMAGES.watch,
    categoryId: "wearables",
    screenInch: 12,
    brandId: "apple",
    ramGb: 4,
    colorId: "navy",
    homeSection: "variety",
  },
  {
    id: "fp-14",
    title: "Apple MacBook Air 13 M3 256GB Midnight",
    priceValue: 690000,
    image: PRODUCT_IMAGES.macbook,
    categoryId: "laptops",
    screenInch: 13,
    brandId: "apple",
    ramGb: 8,
    colorId: "black",
    homeSection: "variety",
  },
  {
    id: "fp-15",
    title: "Samsung Galaxy Book4 Pro 16",
    priceValue: 880000,
    image: PRODUCT_IMAGES.laptop,
    categoryId: "laptops",
    screenInch: 16,
    brandId: "samsung",
    ramGb: 16,
    colorId: "black",
  },
  {
    id: "fp-16",
    title: "Apple iPhone 16 128GB Ultramarine",
    priceValue: 445000,
    image: PRODUCT_IMAGES.iphoneBlack,
    categoryId: "smartphones",
    screenInch: 13,
    brandId: "apple",
    ramGb: 8,
    colorId: "blue",
  },
  {
    id: "fp-17",
    title: "Dell Latitude 7450 Business Laptop",
    priceValue: 640000,
    image: PRODUCT_IMAGES.laptop,
    categoryId: "laptops",
    screenInch: 14,
    brandId: "dell",
    ramGb: 16,
    colorId: "black",
  },
  {
    id: "fp-18",
    title: "HP Omen 16 RTX Gaming Laptop",
    priceValue: 820000,
    image: PRODUCT_IMAGES.gamingLaptop,
    categoryId: "laptops",
    screenInch: 16,
    brandId: "hp",
    ramGb: 32,
    colorId: "black",
  },
  {
    id: "fp-19",
    title: "Lenovo Yoga Slim 7 14 OLED",
    priceValue: 590000,
    image: PRODUCT_IMAGES.laptop,
    categoryId: "laptops",
    screenInch: 14,
    brandId: "lenovo",
    ramGb: 16,
    colorId: "grey",
  },
  {
    id: "fp-20",
    title: "Samsung Galaxy S24 FE 256GB Graphite",
    priceValue: 335000,
    image: PRODUCT_IMAGES.samsungPhone,
    categoryId: "smartphones",
    screenInch: 15,
    brandId: "samsung",
    ramGb: 8,
    colorId: "black",
  },
  {
    id: "fp-21",
    title: "Sony WF-1000XM5 Wireless Earbuds",
    priceValue: 118000,
    image: PRODUCT_IMAGES.earbuds,
    categoryId: "headphones",
    screenInch: 11,
    brandId: "sony",
    ramGb: 4,
    colorId: "black",
  },
  {
    id: "fp-22",
    title: "Dell Precision 5690 Workstation",
    priceValue: 1420000,
    image: PRODUCT_IMAGES.laptop,
    categoryId: "laptops",
    screenInch: 16,
    brandId: "dell",
    ramGb: 32,
    colorId: "black",
  },
  {
    id: "fp-23",
    title: "HP Chromebook Plus 14",
    priceValue: 245000,
    image: PRODUCT_IMAGES.laptop,
    categoryId: "laptops",
    screenInch: 14,
    brandId: "hp",
    ramGb: 8,
    colorId: "grey",
  },
  {
    id: "fp-24",
    title: "Lenovo Legion 15",
    priceValue: 890000,
    image: PRODUCT_IMAGES.gamingLaptop,
    categoryId: "laptops",
    screenInch: 15,
    brandId: "lenovo",
    ramGb: 16,
    colorId: "black",
  },
  {
    /** Was home-carousel-only ("var-1"), never reachable through the catalog or /filter. */
    id: "fp-25",
    title: "Apple iPhone 17 Pro 128GB Natural Titanium",
    priceValue: 629000,
    image: PRODUCT_IMAGES.iphoneOrange,
    categoryId: "smartphones",
    screenInch: 12,
    brandId: "apple",
    ramGb: 8,
    colorId: "white",
    homeSection: "variety",
  },
  {
    /** Was home-carousel-only ("var-6"). */
    id: "fp-26",
    title: "Lenovo Legion 5 16-inch RTX Gaming Laptop",
    priceValue: 790000,
    image: PRODUCT_IMAGES.gamingLaptop,
    categoryId: "laptops",
    screenInch: 16,
    brandId: "lenovo",
    ramGb: 16,
    colorId: "black",
    homeSection: "variety",
  },
  {
    /**
     * New: "speakers" is one of eight advertised catalog categories (grid tiles on the
     * home page, a facet on /filter) but had zero real products in it before this —
     * fp-3 (headphones) was miscategorized into it instead. A category with an
     * advertised entry point and no products is a dead end for users and a thin/empty
     * page for crawlers.
     */
    id: "fp-27",
    title: "Sony SRS-XG500 Portable Bluetooth Speaker",
    priceValue: 249000,
    image: PRODUCT_IMAGES.speaker,
    categoryId: "speakers",
    screenInch: 11,
    brandId: "sony",
    ramGb: 4,
    colorId: "black",
  },
];

const DESCRIPTION_TEMPLATES = {
  smartphones: (p) => `${p.brandId === "apple" ? "iOS" : "Android"} smartphone with a ${p.screenInch}.6″ display and ${p.ramGb} GB RAM.`,
  laptops: (p) => `${p.screenInch}″ laptop with ${p.ramGb} GB RAM, built for everyday work and travel.`,
  headphones: (p) => `Wireless audio with active noise cancellation and a ${p.ramGb > 4 ? "long" : "compact"} battery life.`,
  tablets: (p) => `${p.screenInch}″ tablet with ${p.ramGb} GB storage, suited for media, notes and light creative work.`,
  tv: (p) => `${p.screenInch * 4}″-class 4K smart TV with a ${p.ramGb} GB smart platform.`,
  wearables: () => `Titanium-built smartwatch with extended battery life and GPS tracking.`,
  cameras: () => `Prime lens with a wide aperture for portraits, low light and street photography.`,
  speakers: () => `Portable Bluetooth speaker with rich bass and a water-resistant build.`,
};

/**
 * Short catalog description, generated per product from its own category and specs
 * instead of one literal sentence shared by all 24 (`DESC`, removed). Not translated —
 * matches how product titles already work in this catalog (brand/model names and specs
 * stay as-is across locales; only UI chrome translates). Full bespoke marketing copy in
 * all three languages remains a content task, not a structural one — see plan item 7.
 */
const buildDescription = (product) =>
  (DESCRIPTION_TEMPLATES[product.categoryId] || DESCRIPTION_TEMPLATES.smartphones)(product);

/** @type {CatalogProduct[]} */
export const PRODUCT_CATALOG = CATALOG_BASE.map((p) => ({
  ...p,
  price: `${formatAmd(p.priceValue)} AMD`,
  description: buildDescription(p),
  href: getProductDetailHref(p.id, p.title),
}));

export const getCatalogProductById = (id) => PRODUCT_CATALOG.find((p) => p.id === id) ?? null;
