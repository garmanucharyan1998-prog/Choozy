import { PRODUCT_CATALOG, getCatalogProductById } from "entities/product";
import { getTranslator } from "shared/i18n";
import { COMPARE_ATTRIBUTE_BY_KEY } from "./compareAttributes";
import { buildCompareBars } from "./compareBarsModel";
import { buildCompareKeyDifferences } from "./compareKeyDifferences";

const t = getTranslator("am");
const byIds = (...ids) => ids.map((id) => getCatalogProductById(id));
const PHONES = PRODUCT_CATALOG.filter((product) => product.categoryId === "smartphones");

describe("buildCompareKeyDifferences", () => {
  const products = byIds(PHONES[0].id, PHONES[1].id, PHONES[2].id, PHONES[3].id);
  const result = buildCompareKeyDifferences(products, t);

  test("finds something to say about a real four-phone comparison", () => {
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(4);
  });

  /**
   * The guard that keeps this section honest: only attributes the catalog declares a direction
   * for are ranked. "OLED instead of LCD" differs and has no better end, so it is never claimed
   * here — the count printed beside the list is what points at rows like that.
   */
  test("only ever ranks attributes whose better end the catalog declares", () => {
    result.forEach((difference) => {
      const attr = COMPARE_ATTRIBUTE_BY_KEY.get(difference.key);
      expect(attr, `unknown attribute ${difference.key}`).toBeTruthy();
      expect(["higher", "lower"]).toContain(attr.direction);
      expect(difference.direction).toBe(attr.direction);
    });
  });

  test("names one winner and the value it beat, never a bare number", () => {
    result.forEach((difference) => {
      expect(products.map((product) => product.id)).toContain(difference.winnerId);
      expect(difference.winnerFormatted).toBeTruthy();
      expect(difference.baselineFormatted).toBeTruthy();
      expect(difference.winnerFormatted).not.toBe(difference.baselineFormatted);
      expect(difference.deltaPercent).toBeGreaterThanOrEqual(10);
    });
  });

  test("puts the widest margin first", () => {
    const deltas = result.map((difference) => difference.deltaPercent);
    expect(deltas).toEqual([...deltas].sort((a, b) => b - a));
  });

  /**
   * Two products tied at the top is not a reason to pick either of them, and naming one would be
   * arbitrary — so a shared win is left to the table.
   */
  test("skips an attribute two products are tied at the top of", () => {
    const contested = buildCompareBars(products, t).filter(
      (row) => row.bars.filter((bar) => bar.isWinner).length > 1,
    );
    const ranked = new Set(result.map((difference) => difference.key));

    expect(contested.length, "the fixture must contain a shared win").toBeGreaterThan(0);
    contested.forEach((row) => expect(ranked.has(row.key)).toBe(false));
  });

  test("a selection too small to compare produces nothing", () => {
    expect(buildCompareKeyDifferences([products[0]], t)).toEqual([]);
    expect(buildCompareKeyDifferences([], t)).toEqual([]);
    expect(buildCompareKeyDifferences(null, t)).toEqual([]);
  });

  /** Two identical products differ by nothing, so there is nothing to lead with. */
  test("identical products produce no key differences", () => {
    const [product] = products;
    expect(buildCompareKeyDifferences([product, { ...product, id: `${product.id}-copy` }], t)).toEqual(
      [],
    );
  });
});
