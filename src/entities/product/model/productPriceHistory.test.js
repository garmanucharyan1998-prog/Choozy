import { buildPriceHistoryForProduct } from "./productPriceHistory";

describe("buildPriceHistoryForProduct", () => {
  test("is deterministic for the same product", () => {
    const product = { id: "fp-3", priceValue: 100000 };
    expect(buildPriceHistoryForProduct(product)).toEqual(buildPriceHistoryForProduct(product));
  });

  /**
   * hashProductId used to sum character codes with no positional weighting, so ids that are
   * digit permutations of each other hashed to the same seed — "fp-1X" collided with
   * "fp-2(X-1)" for every X from 1 to 8. Using the same priceValue for both sides removes
   * the scaling that would otherwise mask the collision.
   */
  test("previously-colliding ids (fp-11..18 vs fp-20..27) now get different curves", () => {
    const pairs = [
      ["fp-11", "fp-20"],
      ["fp-12", "fp-21"],
      ["fp-13", "fp-22"],
      ["fp-14", "fp-23"],
      ["fp-15", "fp-24"],
      ["fp-16", "fp-25"],
      ["fp-17", "fp-26"],
      ["fp-18", "fp-27"],
    ];

    pairs.forEach(([a, b]) => {
      const historyA = buildPriceHistoryForProduct({ id: a, priceValue: 200000 });
      const historyB = buildPriceHistoryForProduct({ id: b, priceValue: 200000 });
      expect(historyA).not.toEqual(historyB);
    });
  });

  test("returns 5 values roughly centered on the product's own price", () => {
    const priceValue = 150000;
    const history = buildPriceHistoryForProduct({ id: "fp-9", priceValue });

    expect(history).toHaveLength(5);
    history.forEach((value) => {
      expect(value).toBeGreaterThan(priceValue * 0.85);
      expect(value).toBeLessThan(priceValue * 1.15);
    });
  });
});
