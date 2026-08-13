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

  /**
   * The UI has shipped in three languages while the synonym table only spoke two: a visitor
   * reading the Russian site who typed the obvious Russian word matched nothing, because every
   * catalog title is a Latin-script model name.
   */
  test("the category word in each language finds that category", () => {
    const cases = [
      { categoryId: "laptops", queries: ["laptop", "նոութբուկ", "ноутбук"] },
      { categoryId: "smartphones", queries: ["smartphone", "հեռախոս", "смартфон"] },
      { categoryId: "headphones", queries: ["headphones", "ականջակալ", "наушники"] },
      { categoryId: "tv", queries: ["television", "հեռուստացույց", "телевизор"] },
      { categoryId: "monitors", queries: ["monitor", "մոնիտոր", "монитор"] },
      { categoryId: "consoles", queries: ["game console", "կոնսոլ", "приставка"] },
      { categoryId: "cameras", queries: ["camera", "ֆոտոխցիկ", "фотоаппарат"] },
      { categoryId: "tablets", queries: ["tablet", "պլանշետ", "планшет"] },
      { categoryId: "speakers", queries: ["speaker", "բարձրախոս", "колонка"] },
      { categoryId: "wearables", queries: ["smartwatch", "ժամացույց", "часы"] },
    ];

    cases.forEach(({ categoryId, queries }) => {
      queries.forEach((query) => {
        const hits = PRODUCT_CATALOG.filter((product) => productMatchesSearch(product, query));
        expect(hits.length, `"${query}" found nothing`).toBeGreaterThan(0);
        expect(
          hits.some((product) => product.categoryId === categoryId),
          `"${query}" found nothing in ${categoryId}`,
        ).toBe(true);
      });
    });
  });

  /**
   * The other half of the same bargain: an expansion wide enough to match everything is no
   * better than no search at all. "gaming" was rejected as a console key for this reason — it
   * would have put a PlayStation in the results for "gaming laptop".
   */
  test("a category word does not drag in the whole catalog", () => {
    ["ноутбук", "наушники", "мышь", "роутер", "клавиатура"].forEach((query) => {
      const hits = PRODUCT_CATALOG.filter((product) => productMatchesSearch(product, query));
      expect(hits.length, `"${query}" matched too much`).toBeLessThan(PRODUCT_CATALOG.length / 2);
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
