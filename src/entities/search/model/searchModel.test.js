import { PRODUCT_CATALOG } from "entities/product";
import { productMatchesSearch } from "entities/filter-catalog";
import { mockArmenianSuggestions } from "shared/api/mocks/mockData";
import { fetchSuggestions } from "./searchModel";

const returnsResults = (term) =>
  PRODUCT_CATALOG.filter((product) => productMatchesSearch(product, term)).length;

describe("fetchSuggestions", () => {
  test("short queries return nothing", async () => {
    expect((await fetchSuggestions("a")).data).toEqual([]);
    expect((await fetchSuggestions("")).data).toEqual([]);
  });

  /**
   * Suggestions navigate to `/filter?q=<suggestion>`, so a suggestion that matches nothing
   * is a dead end. Several expansions named brands the catalog has never carried
   * (PlayStation, Xbox, Nintendo, Bose, Google Pixel, ASUS) and landed on an empty page.
   */
  test("every suggestion offered leads to at least one product", async () => {
    const queries = ["ip", "mac", "սմարթֆոն", "նոութբուկ", "լսափող", "բարձր", "ժամացույց", "sony"];

    for (const query of queries) {
      const { data } = await fetchSuggestions(query);
      data.forEach((suggestion) => {
        expect(returnsResults(suggestion)).toBeGreaterThan(0);
      });
    }
  });

  /** Same invariant at the source, so the table can't drift back into dead entries. */
  test("every Armenian expansion term matches the catalog", () => {
    Object.entries(mockArmenianSuggestions).forEach(([key, terms]) => {
      terms.forEach((term) => {
        expect(returnsResults(term), `${key} -> ${term}`).toBeGreaterThan(0);
      });
    });
  });

  test("a catalog query suggests real product titles", async () => {
    const { data } = await fetchSuggestions("macbook");
    expect(data.length).toBeGreaterThan(0);
    data.forEach((suggestion) => {
      expect(returnsResults(suggestion)).toBeGreaterThan(0);
    });
  });
});
