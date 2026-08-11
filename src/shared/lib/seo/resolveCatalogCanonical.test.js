import { isValidFilterCategoryId } from "entities/filter-catalog";
import { getCatalogPageCount } from "entities/product";
import { resolveCatalogCanonical } from "./resolveCatalogCanonical";

/** The real catalog, so these clamp against the same page counts the site does. */
const resolve = (search) =>
  resolveCatalogCanonical(search, isValidFilterCategoryId, getCatalogPageCount);

describe("resolveCatalogCanonical", () => {
  test("bare /filter self-canonicalizes and is indexable", () => {
    expect(resolve("")).toEqual({ path: "/filter", categoryId: null, page: 1, noIndex: false });
  });

  /**
   * The defect this fixes: all eight category URLs (× 3 languages = 24) canonicalized to bare
   * `/filter` while the sitemap advertised every one of them, so Google dropped the lot.
   */
  test.each([
    "smartphones",
    "laptops",
    "speakers",
    "headphones",
    "tablets",
    "tv",
    "wearables",
    "cameras",
  ])("?category=%s is its own indexable landing page", (categoryId) => {
    const result = resolve(`?category=${categoryId}`);
    expect(result.path).toBe(`/filter?category=${categoryId}`);
    expect(result.categoryId).toBe(categoryId);
    expect(result.noIndex).toBe(false);
  });

  test("a page that really exists keeps its number and stays indexable", () => {
    const result = resolve("?page=2");
    expect(result.path).toBe("/filter?page=2");
    expect(result.page).toBe(2);
    expect(result.noIndex).toBe(false);
  });

  /**
   * Every category fits on a single page at the default size, so page 2 of one does not
   * exist. Such a URL used to answer 200 with page 1's products under a canonical claiming
   * to be that page — an unbounded family of self-canonical duplicates, each telling a
   * search engine it was not a duplicate of the others.
   */
  test("a category page past the end canonicalizes onto the real page and is not indexed", () => {
    const result = resolve("?category=laptops&page=3");
    expect(result.path).toBe("/filter?category=laptops");
    expect(result.page).toBe(1);
    expect(result.noIndex).toBe(true);
  });

  test.each(["?page=3", "?page=4", "?page=99"])(
    "%s is past the end of the catalog and is not indexed",
    (search) => {
      const result = resolve(search);
      expect(result.path).toBe("/filter?page=2");
      expect(result.noIndex).toBe(true);
    },
  );

  test("page=1 is dropped so it can't duplicate the bare URL", () => {
    expect(resolve("?page=1").path).toBe("/filter");
    expect(resolve("?category=tv&page=1").path).toBe("/filter?category=tv");
  });

  test.each(["?page=0", "?page=-3", "?page=abc", "?page="])("ignores the bogus %s", (search) => {
    expect(resolve(search)).toMatchObject({ path: "/filter", page: 1 });
  });

  /** A filtered view holds the same products as its parent — one of them should be indexed. */
  test.each([
    ["?category=laptops&brand=apple", "/filter?category=laptops"],
    ["?category=laptops&storage=512", "/filter?category=laptops"],
    ["?category=tv&screen=over-40", "/filter?category=tv"],
    ["?category=laptops&color=black", "/filter?category=laptops"],
    ["?category=laptops&priceMin=500000", "/filter?category=laptops"],
    ["?category=laptops&priceMax=900000", "/filter?category=laptops"],
    ["?category=laptops&sort=priceAsc", "/filter?category=laptops"],
    ["?category=laptops&perPage=40", "/filter?category=laptops"],
    ["?brand=apple", "/filter"],
    ["?q=macbook", "/filter"],
  ])("%s canonicalizes up to %s and is not indexed", (search, expectedPath) => {
    const result = resolve(search);
    expect(result.path).toBe(expectedPath);
    expect(result.noIndex).toBe(true);
  });

  test("a narrowed page 2 canonicalizes to the landing page without the page number", () => {
    const result = resolve("?category=laptops&brand=apple&page=2");
    expect(result.path).toBe("/filter?category=laptops");
    expect(result.noIndex).toBe(true);
  });

  /** A made-up category is not a page — index the one it actually falls back to. */
  test("an unknown category falls back to /filter and is not indexed", () => {
    const result = resolve("?category=spaceships");
    expect(result.path).toBe("/filter");
    expect(result.categoryId).toBeNull();
    expect(result.noIndex).toBe(true);
  });

  test("empty parameter values don't count as narrowing", () => {
    expect(resolve("?brand=&q=&sort=")).toMatchObject({ path: "/filter", noIndex: false });
  });

  test("accepts URLSearchParams as well as a string", () => {
    expect(resolve(new URLSearchParams({ category: "tablets" })).path).toBe(
      "/filter?category=tablets",
    );
    expect(resolve(new URLSearchParams({ page: "2" })).path).toBe("/filter?page=2");
  });
});
