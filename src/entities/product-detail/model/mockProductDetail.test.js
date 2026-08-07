import { getProductDetailForRoute, mockProductDetail } from "./mockProductDetail";
import { mockFilterProducts } from "entities/filter-catalog/model/mockFilterProducts";
import { mockTopProducts, mockVarietyProducts } from "shared/api/mocks/mockData";

describe("getProductDetailForRoute", () => {
  test("resolves a catalog product (fp-*) with its own title and price", () => {
    const catalogProduct = mockFilterProducts[0];
    const result = getProductDetailForRoute(catalogProduct.id);

    expect(result).not.toBeNull();
    expect(result.id).toBe(catalogProduct.id);
    expect(result.listingTitle).toBe(catalogProduct.title);
    expect(result.priceMinAmd).toBe(catalogProduct.priceValue);
  });

  test("resolves a home-carousel product (top-*) that is not in the catalog", () => {
    const homeProduct = mockTopProducts[0];
    const result = getProductDetailForRoute(homeProduct.id);

    expect(result).not.toBeNull();
    expect(result.id).toBe(homeProduct.id);
    expect(result.listingTitle).toBe(homeProduct.title);
  });

  test("resolves a variety-carousel product (var-*)", () => {
    const varietyProduct = mockVarietyProducts[0];
    const result = getProductDetailForRoute(varietyProduct.id);

    expect(result).not.toBeNull();
    expect(result.id).toBe(varietyProduct.id);
  });

  test("falls back to the default detail product for an empty id", () => {
    const result = getProductDetailForRoute(undefined);
    expect(result).not.toBeNull();
    expect(result.id).toBe(mockProductDetail.id);
  });

  test("returns null for an id that matches nothing, so the route can 404", () => {
    expect(getProductDetailForRoute("does-not-exist-anywhere")).toBeNull();
  });
});
