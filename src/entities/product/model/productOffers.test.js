import { PRODUCT_CATALOG } from "./productCatalog";
import { getOffersForProduct, OFFER_SHOP_COUNT } from "./productOffers";

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

  /** The bound above, over the whole catalog rather than two hand-picked products. */
  test("no product anywhere in the catalog is quoted outside +/-15% of its own price", () => {
    const outliers = PRODUCT_CATALOG.flatMap((product) =>
      getOffersForProduct(product)
        .filter(
          (offer) =>
            offer.priceAmd <= product.priceValue * 0.9 ||
            offer.priceAmd >= product.priceValue * 1.15,
        )
        .map((offer) => `${offer.id}: ${offer.priceAmd} vs ${product.priceValue}`),
    );

    expect(outliers).toEqual([]);
  });

  test("offers carry the product's own variants and colors, not an unrelated fixed set", () => {
    const phone = PRODUCT_CATALOG.find((p) => p.categoryId === "smartphones");
    const offers = getOffersForProduct(phone);

    offers.forEach((offer) => {
      expect(offer.colors[0].id).toBe(phone.colorId);
      expect(offer.variants.map((v) => v.label)).toContain("256 GB");
    });
  });

  /**
   * A pair of earbuds has no storage tiers to choose between. They used to be offered one
   * chip labelled from the old `ramGb` "memory tier" field — "4 GB" on headphones.
   */
  test("a product with no storage axis offers no variants", () => {
    const headphones = PRODUCT_CATALOG.find((p) => p.categoryId === "headphones");
    const offers = getOffersForProduct(headphones);

    expect(offers.length).toBeGreaterThan(0);
    offers.forEach((offer) => {
      expect(offer.colors[0].id).toBe(headphones.colorId);
      expect(offer.variants).toEqual([]);
    });
  });

  test("returns an empty array for a missing product instead of throwing", () => {
    expect(getOffersForProduct(null)).toEqual([]);
  });

  /**
   * Shops only list the categories they carry, so an offer count below the whole roster is
   * expected — but the Best Offers table shows 3 rows and only offers a "see more" button when
   * there are strictly more than 3, so a product carried by 3 shops would silently hide the
   * rest of its own offers.
   */
  test("every product is carried by more shops than the offers table shows at once", () => {
    const thin = PRODUCT_CATALOG.filter((product) => getOffersForProduct(product).length < 6).map(
      (product) =>
        `${product.id} (${product.categoryId}/${product.brandId}): ${getOffersForProduct(product).length}`,
    );

    expect(thin).toEqual([]);
  });

  test("no product is listed by every single shop — coverage is per shop, not universal", () => {
    const universal = PRODUCT_CATALOG.filter(
      (product) => getOffersForProduct(product).length === OFFER_SHOP_COUNT,
    ).map((product) => product.id);

    expect(universal).toEqual([]);
  });

  /** An Apple premium reseller is the one brand-locked shop on the roster. */
  test("iSpace only appears on Apple products", () => {
    const wrong = PRODUCT_CATALOG.filter(
      (product) =>
        product.brandId !== "apple" &&
        getOffersForProduct(product).some((offer) => offer.shopUrlLabel === "ispace.am"),
    ).map((product) => `${product.id} (${product.brandId})`);

    expect(wrong).toEqual([]);
  });

  /** A supermarket's electronics aisle does not stock camera lenses or 65-inch televisions. */
  test("the supermarket does not list categories it has no aisle for", () => {
    const wrong = PRODUCT_CATALOG.filter(
      (product) =>
        ["cameras", "tv", "laptops", "monitors", "consoles", "tablets"].includes(
          product.categoryId,
        ) && getOffersForProduct(product).some((offer) => offer.shopUrlLabel === "sas.am"),
    ).map((product) => `${product.id} (${product.categoryId})`);

    expect(wrong).toEqual([]);
  });

  /**
   * The whole point of a price comparison. With one fixed factor per shop and no per-product
   * variation, the cheapest offer was the same shop on all 108 products.
   */
  test("the cheapest shop is not the same shop for every product", () => {
    const winners = new Set(
      PRODUCT_CATALOG.map((product) => {
        const offers = getOffersForProduct(product);
        return offers.reduce((best, offer) => (offer.priceAmd < best.priceAmd ? offer : best))
          .shopUrlLabel;
      }),
    );

    expect(winners.size).toBeGreaterThan(2);
  });

  /** Two shops quoting the identical number on the identical product reads as copied data. */
  test("a product's offers are not all the same price", () => {
    const flat = PRODUCT_CATALOG.filter((product) => {
      const prices = new Set(getOffersForProduct(product).map((offer) => offer.priceAmd));
      return prices.size < 4;
    }).map((product) => product.id);

    expect(flat).toEqual([]);
  });

  test("a discount badge only sits on a row that is actually below the product's price", () => {
    const dishonest = PRODUCT_CATALOG.flatMap((product) =>
      getOffersForProduct(product)
        .filter(
          (offer) =>
            offer.badgeKey === "productOffers.badges.discount" &&
            offer.priceAmd > product.priceValue * 0.97,
        )
        .map((offer) => offer.id),
    );

    expect(dishonest).toEqual([]);
  });

  test("a new badge only sits on a product that is actually new", () => {
    const dishonest = PRODUCT_CATALOG.flatMap((product) =>
      getOffersForProduct(product)
        .filter(
          (offer) => offer.badgeKey === "productOffers.badges.new" && product.releaseYear < 2025,
        )
        .map((offer) => `${offer.id} (${product.releaseYear})`),
    );

    expect(dishonest).toEqual([]);
  });

  /**
   * Every row used to repeat one shared `offerDescription`, so twelve shops with different
   * prices, coverage and delivery terms were each described by the same sentence.
   */
  test("each shop describes itself with its own copy", () => {
    const offers = getOffersForProduct(PRODUCT_CATALOG.find((p) => p.brandId === "apple"));
    const keys = offers.map((offer) => offer.descriptionKey);

    expect(new Set(keys).size).toBe(keys.length);
  });

  test("every offer carries the shop's rating for the rating sort to order by", () => {
    getOffersForProduct(PRODUCT_CATALOG[0]).forEach((offer) => {
      expect(offer.shopRatingValue).toBeGreaterThan(3);
      expect(offer.shopRatingValue).toBeLessThanOrEqual(5);
      expect(offer.shopReviewCount).toBeGreaterThan(0);
    });
  });
});
