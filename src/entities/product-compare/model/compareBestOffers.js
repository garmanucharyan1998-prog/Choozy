/**
 * The cheapest live offer for each compared product, plus what that saves against the dearest
 * shop quoting the same product.
 *
 * This is the answer to the question the site exists for — "where is it cheapest right now" —
 * and until now it was only reachable by reading a 12-row shop matrix column by column and
 * spotting the small note under one cell. The matrix stays (it is the evidence); this is the
 * summary that lets a visitor skip it.
 *
 * Everything here is measured, never estimated:
 *  - `priceAmd` is `Math.min` over that product's own generated offers.
 *  - `spreadAmd` is the dearest offer minus the cheapest, **for the same product** — a saving a
 *    visitor can actually realise by picking one shop over another. It is never a comparison
 *    between two different products, which would be a claim about value, not about price.
 *  - `isCheapest` marks the lowest `priceAmd` in the selection. It says one product costs less
 *    than the others and nothing more: a spec table cannot know whether that is a good deal.
 *
 * A product with no offers at all still gets an entry, with `priceAmd: null`. `getOffersForProduct`
 * guarantees at least six shops per product today, but a summary that silently dropped a column
 * would leave the reader counting products to notice.
 */
import { getOffersForProduct } from "entities/product";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";

/**
 * @param {import("entities/product").CatalogProduct[]} products
 * @param {(key: string, fallback?: string) => string} t
 * @returns {{
 *   productId: string,
 *   priceAmd: number | null,
 *   formatted: string | null,
 *   shopNameKey: string | null,
 *   offerCount: number,
 *   spreadAmd: number | null,
 *   spreadFormatted: string | null,
 *   isCheapest: boolean,
 * }[]}
 */
export const buildCompareBestOffers = (products, t) => {
  if (!Array.isArray(products) || products.length === 0) return [];

  const currencySuffix = typeof t === "function" ? t("productDetail.currencySuffix") : "";

  const entries = products.map((product) => {
    const offers = getOffersForProduct(product);
    if (offers.length === 0) {
      return {
        productId: product.id,
        priceAmd: null,
        formatted: null,
        shopNameKey: null,
        offerCount: 0,
        spreadAmd: null,
        spreadFormatted: null,
        isCheapest: false,
      };
    }

    /**
     * `reduce`, not `sort(...)[0]`: sorting would reorder the caller's array in place on some
     * engines and costs a copy on the rest, and the tie-break matters — the first shop in
     * `getOffersForProduct`'s popularity order wins, which is the order the matrix below shows.
     */
    const cheapest = offers.reduce((best, offer) => (offer.priceAmd < best.priceAmd ? offer : best));
    const dearest = offers.reduce((worst, offer) => (offer.priceAmd > worst.priceAmd ? offer : worst));
    const spreadAmd = dearest.priceAmd - cheapest.priceAmd;

    return {
      productId: product.id,
      priceAmd: cheapest.priceAmd,
      formatted: formatPriceAmd(cheapest.priceAmd, currencySuffix),
      shopNameKey: cheapest.shopNameKey,
      offerCount: offers.length,
      /** Zero spread means every shop quotes the same number — a fact, but not a saving. */
      spreadAmd: spreadAmd > 0 ? spreadAmd : null,
      spreadFormatted: spreadAmd > 0 ? formatPriceAmd(spreadAmd, currencySuffix) : null,
      isCheapest: false,
    };
  });

  const prices = entries.map((entry) => entry.priceAmd).filter((price) => typeof price === "number");
  /**
   * `isCheapest` ranks products against each other, so it takes at least two of them. One product
   * is trivially the minimum of one, and badging it "lowest price" states a comparison the page is
   * not making — `/compare?ids=<one>` already says out loud what it is missing.
   */
  if (prices.length < 2) return entries;

  const lowest = Math.min(...prices);
  /**
   * Only when it is *the* cheapest. Two products tied at the bottom means neither is the answer
   * to "which one costs least", and two badges reading "lowest price" would say otherwise.
   */
  const tiedAtLowest = entries.filter((entry) => entry.priceAmd === lowest).length;
  if (tiedAtLowest === 1) {
    entries.forEach((entry) => {
      entry.isCheapest = entry.priceAmd === lowest;
    });
  }

  return entries;
};

export default buildCompareBestOffers;
