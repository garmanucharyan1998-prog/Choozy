import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { LanguageProvider } from "contexts";
import { mockFilterProducts } from "entities/filter-catalog/model/mockFilterProducts";
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
    expect(result.current.totalResults).toBe(mockFilterProducts.length);
  });

  test("a category in the URL narrows the results to that category (G14 regression)", () => {
    const laptop = mockFilterProducts.find((p) => p.categoryId === "laptops");
    const { result } = renderPresenter(`/filter?category=${laptop.categoryId}`);

    expect(result.current.totalResults).toBeGreaterThan(0);
    expect(result.current.totalResults).toBeLessThan(mockFilterProducts.length);
    result.current.filteredProducts.forEach((p) => {
      expect(p.categoryId).toBe(laptop.categoryId);
    });
  });

  test("toggling a brand facet narrows results and the count for that brand matches the actual catalog", () => {
    const { result } = renderPresenter();
    const brandId = "apple";
    const expectedCount = mockFilterProducts.filter((p) => p.brandId === brandId).length;

    act(() => result.current.toggleBrand(brandId));

    expect(result.current.selectedBrands.has(brandId)).toBe(true);
    expect(result.current.totalResults).toBe(expectedCount);
  });

  test("facet counts reflect the current selection, not the whole catalog (G14 regression)", () => {
    const { result } = renderPresenter();
    const brandId = "apple";
    const appleScreenSizes = new Set(
      mockFilterProducts.filter((p) => p.brandId === brandId).map((p) => String(p.screenInch)),
    );

    act(() => result.current.toggleBrand(brandId));

    const screenCountKeys = Object.keys(result.current.screenCounts);
    expect(new Set(screenCountKeys)).toEqual(appleScreenSizes);
  });

  test("typing into search keeps a trailing space instead of losing it on the URL round-trip (G1 regression)", () => {
    const { result } = renderPresenter();

    act(() => {
      result.current.onSearchChange({ target: { value: "apple " } });
    });

    expect(result.current.search).toBe("apple ");
  });

  test("search actually filters the product list by title", () => {
    const target = mockFilterProducts[0];
    const uniqueWord = target.title.split(" ")[0];
    const { result } = renderPresenter(`/filter?q=${encodeURIComponent(uniqueWord)}`);

    expect(result.current.filteredProducts.length).toBeGreaterThan(0);
    result.current.filteredProducts.forEach((p) => {
      const haystack = `${p.title} ${p.description}`.toLowerCase();
      expect(haystack).toContain(uniqueWord.toLowerCase());
    });
  });
});
