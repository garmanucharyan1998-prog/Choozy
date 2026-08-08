import { PRODUCT_CATALOG } from "./productCatalog";
import { getProductDetailForRoute } from "./productDetails";

describe("getProductDetailForRoute", () => {
  test("resolves a catalog product with its own title, price and gallery", () => {
    const catalogProduct = PRODUCT_CATALOG[0];
    const result = getProductDetailForRoute(catalogProduct.id);

    expect(result).not.toBeNull();
    expect(result.id).toBe(catalogProduct.id);
    expect(result.listingTitle).toBe(catalogProduct.title);
    expect(result.galleryImageUrls.length).toBeGreaterThan(1);
  });

  test("falls back to the default detail product for an empty id", () => {
    const result = getProductDetailForRoute(undefined);
    expect(result).not.toBeNull();
    expect(result.id).toBe(PRODUCT_CATALOG[0].id);
  });

  test("returns null for an id that matches nothing, so the route can 404", () => {
    expect(getProductDetailForRoute("does-not-exist-anywhere")).toBeNull();
  });

  test("two different products get two different specs, galleries and variants (K2 regression)", () => {
    const laptop = PRODUCT_CATALOG.find((p) => p.categoryId === "laptops");
    const headphones = PRODUCT_CATALOG.find((p) => p.categoryId === "headphones");

    const laptopDetail = getProductDetailForRoute(laptop.id);
    const headphonesDetail = getProductDetailForRoute(headphones.id);

    expect(laptopDetail.specsBriefRows).not.toEqual(headphonesDetail.specsBriefRows);
    expect(laptopDetail.galleryImageUrls).not.toEqual(headphonesDetail.galleryImageUrls);
    expect(laptopDetail.priceHistoryAmd).not.toEqual(headphonesDetail.priceHistoryAmd);
  });

  test("the displayed price range matches the min/max of its own generated offers (K1 regression)", () => {
    const product = PRODUCT_CATALOG.find((p) => p.id === "fp-12");
    const detail = getProductDetailForRoute(product.id);

    expect(detail.priceMinAmd).toBeLessThanOrEqual(detail.priceMaxAmd);
    /** Distinct from a flat, unrelated fixed range — must actually derive from this product's own price. */
    expect(detail.priceMinAmd).toBeGreaterThan(product.priceValue * 0.9);
    expect(detail.priceMaxAmd).toBeLessThan(product.priceValue * 1.2);
  });
});
