import { COMPARE_PAIRS, getComparePairPath } from "entities/product-compare";
import { PRODUCT_CATALOG } from "entities/product";
import { getIndexableRoutes } from "app/seo/routeInventory";
import { resolveCompareCanonical } from "./compareSeo";

const laptopIds = PRODUCT_CATALOG.filter((p) => p.categoryId === "laptops").map((p) => p.id);

describe("resolveCompareCanonical", () => {
  test("the bare landing page indexes itself", () => {
    expect(resolveCompareCanonical("")).toEqual({ path: "/compare", ids: [], noIndex: false });
  });

  /**
   * With 27 products there are thousands of possible selections, every one a thin variation on
   * the others. `/filter?page=N` already cost this project an unbounded family of
   * self-canonical URLs; this is the same rule applied before it can happen again.
   */
  test("a visitor's own selection is kept out of the index and points at the landing page", () => {
    const { path, noIndex } = resolveCompareCanonical(`?ids=${laptopIds.slice(0, 3).join(",")}`);
    expect(path).toBe("/compare");
    expect(noIndex).toBe(true);
  });

  test("a selection that happens to be a known pair points at that pair's own page", () => {
    const pair = COMPARE_PAIRS[0];
    const { path, noIndex } = resolveCompareCanonical(`?ids=${pair.ids.join(",")}`);
    expect(path).toBe(getComparePairPath(pair.slug));
    expect(noIndex).toBe(true);
  });

  test("the pair is recognised whichever order the ids arrive in", () => {
    const pair = COMPARE_PAIRS[0];
    const reversed = [...pair.ids].reverse().join(",");
    expect(resolveCompareCanonical(`?ids=${reversed}`).path).toBe(getComparePairPath(pair.slug));
  });

  /** A hand-typed `?ids=` must not be able to invent an indexable URL. */
  test("garbage ids fall back to the landing page and stay indexable when nothing survives", () => {
    expect(resolveCompareCanonical("?ids=fp-9999,nonsense")).toEqual({
      path: "/compare",
      ids: [],
      noIndex: false,
    });
  });

  test("a mixed-category selection is filtered down before the pair lookup", () => {
    const phone = PRODUCT_CATALOG.find((p) => p.categoryId === "smartphones").id;
    const { ids } = resolveCompareCanonical(`?ids=${laptopIds[0]},${phone}`);
    expect(ids).toEqual([laptopIds[0]]);
  });

  test("accepts URLSearchParams as well as a raw query string", () => {
    const params = new URLSearchParams({ ids: laptopIds.slice(0, 2).join(",") });
    expect(resolveCompareCanonical(params).noIndex).toBe(true);
  });
});

describe("the compare URLs in the sitemap", () => {
  const paths = getIndexableRoutes().map((route) => route.path);

  test("lists the compare landing page", () => {
    expect(paths).toContain("/compare");
  });

  test("lists every generated pair exactly once", () => {
    COMPARE_PAIRS.forEach((pair) => {
      const wanted = getComparePairPath(pair.slug);
      expect(paths.filter((path) => path === wanted)).toHaveLength(1);
    });
  });

  /**
   * The sitemap may only advertise URLs the router really answers. A `?ids=` entry would be a
   * page that returns `noindex` — telling a crawler to fetch a page and then ignore it.
   */
  test("advertises no selection URLs", () => {
    expect(paths.filter((path) => path.includes("ids="))).toEqual([]);
  });

  test("every listed compare URL resolves to a pair the router can serve", () => {
    const slugs = new Set(COMPARE_PAIRS.map((pair) => pair.slug));
    paths
      .filter((path) => path.startsWith("/compare/"))
      .forEach((path) => expect(slugs).toContain(path.replace("/compare/", "")));
  });

  test("no route in the inventory is listed twice", () => {
    expect(new Set(paths).size).toBe(paths.length);
  });
});
