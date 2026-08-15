import { PRODUCT_CATALOG, getCatalogProductById, getOffersForProduct } from "entities/product";
import { getTranslator } from "shared/i18n";
import { buildCompareBestOffers } from "./compareBestOffers";

const t = getTranslator("am");
const byIds = (...ids) => ids.map((id) => getCatalogProductById(id));
const PHONES = PRODUCT_CATALOG.filter((product) => product.categoryId === "smartphones");

describe("buildCompareBestOffers", () => {
  const products = byIds(PHONES[0].id, PHONES[1].id, PHONES[2].id);
  const result = buildCompareBestOffers(products, t);

  test("answers for every compared product, in column order", () => {
    expect(result.map((entry) => entry.productId)).toEqual(products.map((product) => product.id));
  });

  test("quotes the cheapest offer that product actually has, and the shop it came from", () => {
    result.forEach((entry, index) => {
      const offers = getOffersForProduct(products[index]);
      const cheapest = Math.min(...offers.map((offer) => offer.priceAmd));

      expect(entry.priceAmd).toBe(cheapest);
      expect(entry.offerCount).toBe(offers.length);
      expect(offers.find((offer) => offer.shopNameKey === entry.shopNameKey).priceAmd).toBe(
        cheapest,
      );
      /** Formatted through the same helper the table uses, so the two never disagree. */
      expect(entry.formatted).toContain(t("productDetail.currencySuffix"));
    });
  });

  /**
   * A saving is the gap between two shops quoting *the same product*. The difference between two
   * different phones is not a saving, and stating it as one would turn arithmetic into advice.
   */
  test("the saving is this product's own price spread, never a gap between products", () => {
    result.forEach((entry, index) => {
      const prices = getOffersForProduct(products[index]).map((offer) => offer.priceAmd);
      expect(entry.spreadAmd).toBe(Math.max(...prices) - Math.min(...prices));
    });
  });

  test("marks exactly one product cheapest, and only when nothing ties it", () => {
    const cheapest = result.filter((entry) => entry.isCheapest);
    const lowest = Math.min(...result.map((entry) => entry.priceAmd));
    const tied = result.filter((entry) => entry.priceAmd === lowest).length;

    expect(cheapest).toHaveLength(tied === 1 ? 1 : 0);
    if (tied === 1) expect(cheapest[0].priceAmd).toBe(lowest);
  });

  /**
   * Two products at the same lowest price means neither answers "which costs least".
   *
   * The fixture is the same product twice — two distinct objects carrying one id — because
   * `getOffersForProduct` derives its per-shop jitter from the product id, so that is the only
   * way to make two entries land on the same number. A selection can never contain a duplicate
   * in the app (`normalizeCompareIds` drops it), but the tie branch is real: two different phones
   * can be quoted the same cheapest price.
   */
  test("a tie at the bottom leaves nobody marked", () => {
    const [product] = products;
    const tie = buildCompareBestOffers([product, { ...product }], t);

    expect(tie.map((entry) => entry.priceAmd)).toEqual([tie[0].priceAmd, tie[0].priceAmd]);
    expect(tie.filter((entry) => entry.isCheapest)).toHaveLength(0);
  });

  test("a product with no offers still gets an entry, with nothing invented in it", () => {
    const [entry] = buildCompareBestOffers([{ id: "nope", categoryId: "nothing" }], t);

    expect(entry).toMatchObject({
      productId: "nope",
      priceAmd: null,
      formatted: null,
      shopNameKey: null,
      offerCount: 0,
      spreadAmd: null,
      isCheapest: false,
    });
  });

  /** One product is the minimum of one. Badging it would state a comparison nothing is making. */
  test("a single product is never marked cheapest", () => {
    const [only] = buildCompareBestOffers([products[0]], t);

    expect(only.priceAmd).toBeGreaterThan(0);
    expect(only.isCheapest).toBe(false);
  });

  test("an empty selection produces nothing rather than throwing", () => {
    expect(buildCompareBestOffers([], t)).toEqual([]);
    expect(buildCompareBestOffers(null, t)).toEqual([]);
  });
});
