import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { LanguageProvider } from "contexts";
import { PRODUCT_CATALOG } from "entities/product";
import { screenBucketIdFor } from "entities/filter-catalog";
import { useFilterCatalogPresenter } from "./useFilterCatalogPresenter";

const renderPresenter = (initialPath = "/filter") =>
  renderHook(() => useFilterCatalogPresenter(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialPath]}>
        <LanguageProvider>{children}</LanguageProvider>
      </MemoryRouter>
    ),
  });

describe("useFilterCatalogPresenter", () => {
  test("with no filters, shows every catalog product", () => {
    const { result } = renderPresenter();
    expect(result.current.totalResults).toBe(PRODUCT_CATALOG.length);
  });

  test("a category in the URL narrows the results to that category (G14 regression)", () => {
    const laptop = PRODUCT_CATALOG.find((p) => p.categoryId === "laptops");
    const { result } = renderPresenter(`/filter?category=${laptop.categoryId}`);

    expect(result.current.totalResults).toBeGreaterThan(0);
    expect(result.current.totalResults).toBeLessThan(PRODUCT_CATALOG.length);
    result.current.filteredProducts.forEach((p) => {
      expect(p.categoryId).toBe(laptop.categoryId);
    });
  });

  test("toggling a brand facet narrows results and the count for that brand matches the actual catalog", () => {
    const { result } = renderPresenter();
    const brandId = "apple";
    const expectedCount = PRODUCT_CATALOG.filter((p) => p.brandId === brandId).length;

    act(() => result.current.toggleBrand(brandId));

    expect(result.current.selectedBrands.has(brandId)).toBe(true);
    expect(result.current.totalResults).toBe(expectedCount);
  });

  test("facet counts reflect the current selection, not the whole catalog (G14 regression)", () => {
    const { result } = renderPresenter();
    const brandId = "apple";
    const appleScreenBuckets = new Set(
      PRODUCT_CATALOG.filter((p) => p.brandId === brandId)
        .map((p) => screenBucketIdFor(p.screenInch))
        .filter(Boolean),
    );

    act(() => result.current.toggleBrand(brandId));

    const screenCountKeys = Object.keys(result.current.screenCounts);
    expect(new Set(screenCountKeys)).toEqual(appleScreenBuckets);
  });

  /**
   * Every option a visitor can tick has to return something, and every product has to be
   * reachable. The hardcoded facet lists broke both: RAM offered 4/8/16/32/128 GB while the
   * Galaxy S25 Ultra carried 12, so that product was silently unfilterable.
   */
  test("every facet option returns at least one product", () => {
    const { result } = renderPresenter();

    result.current.screenOptions.forEach((opt) => {
      expect(result.current.screenCounts[opt.id] ?? 0).toBeGreaterThan(0);
    });
    result.current.storageOptions.forEach((opt) => {
      expect(result.current.storageCounts[opt.id] ?? 0).toBeGreaterThan(0);
    });
  });

  test("every product with a screen or storage is reachable through some option", () => {
    const { result } = renderPresenter();
    const screenIds = new Set(result.current.screenOptions.map((o) => o.id));
    const storageIds = new Set(result.current.storageOptions.map((o) => o.id));

    PRODUCT_CATALOG.forEach((product) => {
      if (typeof product.screenInch === "number") {
        expect(screenIds.has(screenBucketIdFor(product.screenInch))).toBe(true);
      }
      if (typeof product.storageGb === "number") {
        expect(storageIds.has(String(product.storageGb))).toBe(true);
      }
    });
  });

  test("a storage facet selection narrows results to products with that exact size", () => {
    const { result } = renderPresenter();
    const sizeId = result.current.storageOptions[0].id;
    const expected = PRODUCT_CATALOG.filter((p) => String(p.storageGb) === sizeId).length;

    act(() => result.current.toggleStorage(sizeId));

    expect(result.current.totalResults).toBe(expected);
    result.current.filteredProducts.forEach((p) => {
      expect(String(p.storageGb)).toBe(sizeId);
    });
  });

  test("typing into search keeps a trailing space instead of losing it on the URL round-trip (G1 regression)", () => {
    const { result } = renderPresenter();

    act(() => {
      result.current.onSearchChange({ target: { value: "apple " } });
    });

    expect(result.current.search).toBe("apple ");
  });

  test("search actually filters the product list by title", () => {
    const target = PRODUCT_CATALOG[0];
    const uniqueWord = target.title.split(" ")[0];
    const { result } = renderPresenter(`/filter?q=${encodeURIComponent(uniqueWord)}`);

    expect(result.current.filteredProducts.length).toBeGreaterThan(0);
    result.current.filteredProducts.forEach((p) => {
      const haystack = `${p.title} ${p.description}`.toLowerCase();
      expect(haystack).toContain(uniqueWord.toLowerCase());
    });
  });
});
