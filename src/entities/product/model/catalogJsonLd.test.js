import { buildCatalogItemListJsonLd } from "./catalogJsonLd";

const itemsOfLength = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `fp-${i}`,
    title: `Product ${i}`,
    href: `/singleproduct/fp-${i}`,
  }));

describe("buildCatalogItemListJsonLd", () => {
  test("page 1 starts at position 1", () => {
    const jsonLd = buildCatalogItemListJsonLd({ items: itemsOfLength(20), language: "en", page: 1, pageSize: 20 });
    expect(jsonLd.itemListElement[0].position).toBe(1);
  });

  /**
   * The real bug: inferring page size from the current page's item count instead of the
   * actual pageSize. A partial last page (7 items, pageSize 20) used to compute
   * startPosition from 7, not 20 — positions 8-14 instead of 21-27.
   */
  test("a partial last page still continues numbering from the real page size, not its own item count", () => {
    const jsonLd = buildCatalogItemListJsonLd({
      items: itemsOfLength(7),
      language: "en",
      page: 2,
      pageSize: 20,
    });
    expect(jsonLd.itemListElement[0].position).toBe(21);
    expect(jsonLd.itemListElement[6].position).toBe(27);
  });

  test("without an explicit pageSize, falls back to items.length (backward compatible)", () => {
    const jsonLd = buildCatalogItemListJsonLd({ items: itemsOfLength(7), language: "en", page: 2 });
    expect(jsonLd.itemListElement[0].position).toBe(8);
  });
});
