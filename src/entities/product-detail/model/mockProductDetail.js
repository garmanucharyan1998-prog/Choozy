/**
 * Demo catalog payload for product detail MVP (replace with API integration later).
 */

import { mockFilterProducts } from "entities/filter-catalog/model/mockFilterProducts";
import { mockTopProducts, mockVarietyProducts } from "shared/api/mocks/mockData";
import { resolveProductRouteParam } from "./productRouteRegistry";

const LAPTOP_IMAGE =
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=82";

export const mockProductDetail = {
  id: "apple-macbook-pro-demo",
  galleryImageUrls: Array.from({ length: 6 }, (_, i) => `${LAPTOP_IMAGE}&sig=${i}`),
  variantIds: ["v256a", "v256b", "v1tb"],
  colorIds: ["black", "gray", "white", "blue"],
  colors: [
    { id: "black", hex: "#1c1c1e" },
    { id: "gray", hex: "#aeaeb2" },
    { id: "white", hex: "#f5f5f7" },
    { id: "blue", hex: "#152147" },
  ],
  priceMinAmd: 800500,
  priceMaxAmd: 1079000,
  /** Sample AMD amounts for the trailing months shown in the chart. */
  priceHistoryAmd: [250000, 260000, 200000, 320000, 240000],
  /** Shown under «Հակիրճ նկարագրություն». */
  specsBriefRows: [
    { labelKey: "productDetail.specsBrief.screenSize", valueKey: "productDetail.specsBrief.screenSizeValue" },
    { labelKey: "productDetail.specsBrief.storage", valueKey: "productDetail.specsBrief.storageValue" },
    { labelKey: "productDetail.specsBrief.ram", valueKey: "productDetail.specsBrief.ramValue" },
    { labelKey: "productDetail.specsBrief.battery", valueKey: "productDetail.specsBrief.batteryValue" },
    { labelKey: "productDetail.specsBrief.year", valueKey: "productDetail.specsBrief.yearValue" },
  ],
  /** Shown under «Նկարագրություն». */
  specsExtendedRows: [
    { labelKey: "productDetail.specsExtended.screenType", valueKey: "productDetail.specsExtended.screenTypeValue" },
    { labelKey: "productDetail.specsExtended.microphone", valueKey: "productDetail.specsExtended.microphoneValue" },
    { labelKey: "productDetail.specsExtended.technology", valueKey: "productDetail.specsExtended.technologyValue" },
    { labelKey: "productDetail.specsExtended.matrix", valueKey: "productDetail.specsExtended.matrixValue" },
    { labelKey: "productDetail.specsExtended.ssd", valueKey: "productDetail.specsExtended.ssdValue" },
    { labelKey: "productDetail.specsExtended.bluetooth", valueKey: "productDetail.specsExtended.bluetoothValue" },
    { labelKey: "productDetail.specsExtended.manufacturer", valueKey: "productDetail.specsExtended.manufacturerValue" },
  ],
};

/** Default route id when visiting `/singleproduct` without a segment. */
export const defaultProductDetailRouteId = mockProductDetail.id;

const repeatGallery = (imageUrl, count = 6) => Array.from({ length: count }, () => imageUrl);

const parseAmdFromPriceString = (price) => {
  if (price == null) return undefined;
  if (typeof price === "number" && Number.isFinite(price)) return price;
  const digits = String(price).replace(/[^\d]/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isFinite(n) ? n : undefined;
};

const findHomeCarouselProduct = (id) =>
  mockVarietyProducts.find((p) => p.id === id) || mockTopProducts.find((p) => p.id === id);

/**
 * Resolves demo detail payload for `/singleproduct/:slug` (SEO slug~id) or legacy `/singleproduct/fp-1` ids.
 * Returns `null` for ids that match no product, so the route can render a real 404 instead of
 * serving identical placeholder content on unlimited URLs.
 *
 * @param {string | undefined} routeProductId
 * @returns {object | null}
 */
export const getProductDetailForRoute = (routeProductId) => {
  const id =
    routeProductId != null && String(routeProductId).trim() !== ""
      ? resolveProductRouteParam(routeProductId)
      : mockProductDetail.id;

  const catalog = mockFilterProducts.find((p) => p.id === id);
  if (catalog) {
    const baseMin = mockProductDetail.priceMinAmd;
    const scale = baseMin > 0 ? catalog.priceValue / baseMin : 1;
    return {
      ...mockProductDetail,
      id: catalog.id,
      listingTitle: catalog.title,
      listingDescription: catalog.description,
      galleryImageUrls: repeatGallery(catalog.image),
      priceMinAmd: catalog.priceValue,
      priceMaxAmd: Math.round(catalog.priceValue * (mockProductDetail.priceMaxAmd / mockProductDetail.priceMinAmd)),
      priceHistoryAmd: mockProductDetail.priceHistoryAmd.map((v) => Math.round(v * scale)),
    };
  }

  const homeProduct = findHomeCarouselProduct(id);
  if (homeProduct) {
    const priceMin = parseAmdFromPriceString(homeProduct.price) ?? mockProductDetail.priceMinAmd;
    const baseMin = mockProductDetail.priceMinAmd;
    const scale = baseMin > 0 ? priceMin / baseMin : 1;
    return {
      ...mockProductDetail,
      id: homeProduct.id,
      listingTitle: homeProduct.title,
      listingDescription: homeProduct.description,
      galleryImageUrls: repeatGallery(homeProduct.image),
      priceMinAmd: priceMin,
      priceMaxAmd: Math.round(priceMin * (mockProductDetail.priceMaxAmd / mockProductDetail.priceMinAmd)),
      priceHistoryAmd: mockProductDetail.priceHistoryAmd.map((v) => Math.round(v * scale)),
    };
  }

  if (id === mockProductDetail.id) {
    return { ...mockProductDetail, listingTitle: "Apple MacBook Pro" };
  }

  return null;
};
