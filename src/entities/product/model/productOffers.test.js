import { PRODUCT_CATALOG } from "./productCatalog";
import { getOffersForProduct } from "./productOffers";

describe("getOffersForProduct", () => {
  test("every offer's price is close to its own product's price, not an unrelated fixed range (K1 regression)", () => {
    const cheap = PRODUCT_CATALOG.find((p) => p.id === "fp-12"); // AirPods, ~129,000 AMD
    const expensive = PRODUCT_CATALOG.find((p) => p.id === "fp-2"); // MacBook Pro, ~1,290,000 AMD

    const cheapOffers = getOffersForProduct(cheap);
    const expensiveOffers = getOffersForProduct(expensive);

    cheapOffers.forEach((offer) => {
      expect(offer.priceAmd).toBeGreaterThan(cheap.priceValue * 0.9);
      expect(offer.priceAmd).toBeLessThan(cheap.priceValue * 1.15);
    });
    expensiveOffers.forEach((offer) => {
      expect(offer.priceAmd).toBeGreaterThan(expensive.priceValue * 0.9);
      expect(offer.priceAmd).toBeLessThan(expensive.priceValue * 1.15);
    });

    /** The two products must not share a price range. */
    const maxCheapOffer = Math.max(...cheapOffers.map((o) => o.priceAmd));
    const minExpensiveOffer = Math.min(...expensiveOffers.map((o) => o.priceAmd));
    expect(maxCheapOffer).toBeLessThan(minExpensiveOffer);
  });

  test("offers carry the product's own variants and colors, not an unrelated fixed set", () => {
    const headphones = PRODUCT_CATALOG.find((p) => p.categoryId === "headphones");
    const offers = getOffersForProduct(headphones);

    offers.forEach((offer) => {
      expect(offer.colors[0].id).toBe(headphones.colorId);
      expect(offer.variants.length).toBeGreaterThan(0);
    });
  });

  test("returns an empty array for a missing product instead of throwing", () => {
    expect(getOffersForProduct(null)).toEqual([]);
  });
});
