import { PRODUCT_CATALOG, getCatalogProductById } from "entities/product";
import { slugifyProductTitle } from "entities/product-detail";
import {
  COMPARE_PAIRS,
  buildComparePairSlug,
  getCanonicalSlugForReversed,
  getComparePairBySlug,
  getComparePairPath,
  getComparePairSlugForIds,
} from "./comparePairs";

const catalogIndex = (id) => PRODUCT_CATALOG.findIndex((product) => product.id === id);

describe("the generated pair set", () => {
  test("is not empty and every entry names two real, distinct products", () => {
    expect(COMPARE_PAIRS.length).toBeGreaterThan(0);
    COMPARE_PAIRS.forEach(({ ids }) => {
      expect(ids).toHaveLength(2);
      expect(ids[0]).not.toBe(ids[1]);
      ids.forEach((id) => expect(getCatalogProductById(id)).toBeTruthy());
    });
  });

  /** The table would be mostly dashes otherwise — the same rule the selection enforces. */
  test("never pairs across categories", () => {
    COMPARE_PAIRS.forEach(({ ids, categoryId }) => {
      ids.forEach((id) => expect(getCatalogProductById(id).categoryId).toBe(categoryId));
    });
  });

  /**
   * These URLs go in the sitemap, so two pairs sharing a slug would mean one of them is
   * unreachable while the sitemap still advertises it.
   */
  test("every slug is unique", () => {
    const slugs = COMPARE_PAIRS.map((pair) => pair.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("no pair is listed twice under a different order", () => {
    const keys = COMPARE_PAIRS.map((pair) => [...pair.ids].sort().join("|"));
    expect(new Set(keys).size).toBe(keys.length);
  });

  /** Catalog order, not price order: a repricing must not reshuffle already-indexed slugs. */
  test("the first product named is the one earlier in the catalog", () => {
    COMPARE_PAIRS.forEach(({ ids }) => {
      expect(catalogIndex(ids[0])).toBeLessThan(catalogIndex(ids[1]));
    });
  });

  test("the slug is built from both titles with the same slugifier the product routes use", () => {
    COMPARE_PAIRS.forEach(({ slug, ids }) => {
      const [a, b] = ids.map(getCatalogProductById);
      expect(slug).toBe(`${slugifyProductTitle(a.title)}-vs-${slugifyProductTitle(b.title)}`);
    });
  });

  /**
   * The window is what keeps this linear. 13 laptops is 78 possible pairings; the rule must
   * stay well under that or the sitemap fills with near-identical pages.
   */
  test("stays linear in catalog size rather than quadratic", () => {
    expect(COMPARE_PAIRS.length).toBeLessThanOrEqual(PRODUCT_CATALOG.length * 2);
  });

  test("only pairs products that are near each other in their category's price order", () => {
    COMPARE_PAIRS.forEach(({ ids, categoryId }) => {
      const order = PRODUCT_CATALOG.filter((p) => p.categoryId === categoryId)
        .slice()
        .sort((a, b) => a.priceValue - b.priceValue || catalogIndex(a.id) - catalogIndex(b.id))
        .map((p) => p.id);
      const distance = Math.abs(order.indexOf(ids[0]) - order.indexOf(ids[1]));
      expect(distance).toBeGreaterThanOrEqual(1);
      expect(distance).toBeLessThanOrEqual(2);
    });
  });

  /** Every category with something to compare should produce at least one page. */
  test("covers every category that has more than one product", () => {
    const multiProductCategories = [
      ...new Set(
        PRODUCT_CATALOG.map((p) => p.categoryId).filter(
          (categoryId, _i, all) => all.filter((c) => c === categoryId).length > 1,
        ),
      ),
    ];
    const covered = new Set(COMPARE_PAIRS.map((pair) => pair.categoryId));
    multiProductCategories.forEach((categoryId) => expect(covered).toContain(categoryId));
  });
});

describe("resolving a slug", () => {
  test("every generated slug resolves back to exactly its own pair", () => {
    COMPARE_PAIRS.forEach((pair) => {
      expect(getComparePairBySlug(pair.slug)).toEqual(pair);
    });
  });

  test("an unknown slug resolves to null rather than to a default pair", () => {
    expect(getComparePairBySlug("nothing-vs-nothing")).toBeNull();
    expect(getComparePairBySlug("")).toBeNull();
    expect(getComparePairBySlug(undefined)).toBeNull();
  });

  test("the reversed slug maps onto the canonical one, so it can be redirected", () => {
    COMPARE_PAIRS.forEach((pair) => {
      const [a, b] = pair.ids.map(getCatalogProductById);
      const reversed = buildComparePairSlug(b, a);

      expect(getComparePairBySlug(reversed)).toBeNull();
      expect(getCanonicalSlugForReversed(reversed)).toBe(pair.slug);
    });
  });

  test("a canonical slug is not itself treated as a reversal", () => {
    COMPARE_PAIRS.forEach((pair) => {
      expect(getCanonicalSlugForReversed(pair.slug)).toBeNull();
    });
  });
});

describe("matching a selection to a pair", () => {
  test("a known pair is found whichever order the ids arrive in", () => {
    COMPARE_PAIRS.forEach((pair) => {
      expect(getComparePairSlugForIds(pair.ids)).toBe(pair.slug);
      expect(getComparePairSlugForIds([...pair.ids].reverse())).toBe(pair.slug);
    });
  });

  test("a selection that is not a known pair has no pretty page", () => {
    expect(getComparePairSlugForIds([])).toBeNull();
    expect(getComparePairSlugForIds([COMPARE_PAIRS[0].ids[0]])).toBeNull();
    expect(getComparePairSlugForIds(["fp-9999", "fp-9998"])).toBeNull();
  });

  test("a three-product selection has no pretty page — only pairs are indexable", () => {
    const laptops = PRODUCT_CATALOG.filter((p) => p.categoryId === "laptops").map((p) => p.id);
    expect(getComparePairSlugForIds(laptops.slice(0, 3))).toBeNull();
  });
});

describe("getComparePairPath", () => {
  test("produces a language-agnostic path under /compare", () => {
    expect(getComparePairPath(COMPARE_PAIRS[0].slug)).toBe(`/compare/${COMPARE_PAIRS[0].slug}`);
  });

  /** `localizedPath` and the sitemap both assume a plain, already-safe path segment. */
  test("every slug is URL-safe as written, needing no escaping", () => {
    COMPARE_PAIRS.forEach(({ slug }) => {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(encodeURIComponent(slug)).toBe(slug);
    });
  });
});
