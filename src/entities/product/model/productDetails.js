import { getProductDescriptionKey } from "./productDescriptions";
import { resolveProductRouteParam } from "entities/product-detail/model/productRouteRegistry";
import { PRODUCT_CATALOG, getCatalogProductById } from "./productCatalog";
import { buildGalleryForProduct } from "./productImages";
import { buildColorOptionsForProduct } from "./productColors";
import { buildVariantsForProduct } from "./productVariants";
import { buildPriceHistoryForProduct } from "./productPriceHistory";
import { buildSpecsForProduct } from "./productSpecs";
import { getOffersForProduct } from "./productOffers";

/**
 * Full detail payload for a single product page — assembled from the catalog entry at
 * read time. Previously every product page rendered the exact same `mockProductDetail`
 * record (one gallery repeated via `repeatGallery`, one set of variants, one set of
 * specs, one price-history curve, all linearly rescaled) with only the title/price/image
 * swapped in; this builds each field from the product actually being viewed.
 *
 * @param {string | undefined} routeProductId
 * @returns {object | null} `null` for an id that matches nothing, so the route can 404.
 */
export const getProductDetailForRoute = (routeProductId) => {
  const id =
    routeProductId != null && String(routeProductId).trim() !== ""
      ? resolveProductRouteParam(routeProductId)
      : PRODUCT_CATALOG[0].id;

  const product = getCatalogProductById(id);
  if (!product) return null;

  const offers = getOffersForProduct(product);
  const offerPrices = offers.map((o) => o.priceAmd);
  const specs = buildSpecsForProduct(product);

  return {
    ...product,
    listingTitle: product.title,
    /** Resolved by the view with the visitor's language — see buildProductDescription. */
    descriptionKey: getProductDescriptionKey(product),
    galleryImageUrls: buildGalleryForProduct(product),
    variants: buildVariantsForProduct(product),
    colors: buildColorOptionsForProduct(product.colorId),
    /**
     * The displayed price range matches the actual generated offers below it (min/max
     * across shops) rather than an arbitrary fixed markup — otherwise the range shown
     * here could itself disagree with the offers table, the same class of bug this
     * whole module exists to fix.
     */
    priceMinAmd: Math.min(product.priceValue, ...offerPrices),
    priceMaxAmd: Math.max(product.priceValue, ...offerPrices),
    priceHistoryAmd: buildPriceHistoryForProduct(product),
    specsBriefRows: specs.brief,
    specsExtendedRows: specs.extended,
  };
};

export const defaultProductDetailRouteId = PRODUCT_CATALOG[0].id;
