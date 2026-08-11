import { getTranslator } from "shared/i18n";
import { PRODUCT_CATALOG, getCatalogProductById, getOffersForProduct } from "entities/product";
import { COMPARE_SECTION_IDS, buildCompareRows } from "./compareRows";

const t = getTranslator("en");

/**
 * Until the `comparePage.*` namespace lands, `getTranslator` returns the path itself for a
 * missing key. Reading the placeholder through `t` rather than hardcoding "—" keeps these
 * tests correct on both sides of that change.
 */
const PLACEHOLDER = t("comparePage.noValue");

const byIds = (...ids) => ids.map(getCatalogProductById);
const inCategory = (categoryId) => PRODUCT_CATALOG.filter((p) => p.categoryId === categoryId);

const LAPTOPS = inCategory("laptops");
const HEADPHONES = inCategory("headphones");

const sectionOf = (result, id) => result.sections.find((section) => section.id === id);
const allRows = (result) => result.sections.flatMap((section) => section.rows);
const rowByLabel = (result, labelKey) => allRows(result).find((row) => row.labelKey === labelKey);

describe("buildCompareRows — table shape", () => {
  const result = buildCompareRows(byIds(LAPTOPS[0].id, LAPTOPS[1].id, LAPTOPS[2].id), t);

  test("emits the three sections in a fixed order", () => {
    expect(result.sections.map((section) => section.id)).toEqual([
      COMPARE_SECTION_IDS.OVERVIEW,
      COMPARE_SECTION_IDS.SPECS,
      COMPARE_SECTION_IDS.OFFERS,
    ]);
  });

  test("every section carries a heading key and at least one row", () => {
    result.sections.forEach((section) => {
      expect(section.labelKey).toBeTruthy();
      expect(section.rows.length).toBeGreaterThan(0);
    });
  });

  /** A table with a ragged row is a broken table — this is the whole point of the union. */
  test("every row answers for every column, in column order", () => {
    const expectedIds = [LAPTOPS[0].id, LAPTOPS[1].id, LAPTOPS[2].id];
    allRows(result).forEach((row) => {
      expect(row.labelKey, "every row needs a label").toBeTruthy();
      expect(row.cells.map((cell) => cell.productId)).toEqual(expectedIds);
      row.cells.forEach((cell) => expect(cell.text).toBeTruthy());
    });
  });

  test("no row is emitted that nobody has a value for", () => {
    allRows(result).forEach((row) => {
      expect(row.cells.some((cell) => cell.hasValue)).toBe(true);
    });
  });

  test("a single-product comparison still produces a full table", () => {
    const single = buildCompareRows(byIds(LAPTOPS[0].id), t);
    expect(allRows(single).length).toBeGreaterThan(0);
    allRows(single).forEach((row) => {
      expect(row.cells).toHaveLength(1);
      /** One column can only ever agree with itself. */
      expect(row.allSame).toBe(true);
    });
  });
});

describe("the overview section", () => {
  const result = buildCompareRows(byIds(LAPTOPS[0].id, LAPTOPS[1].id), t);

  test("names price, brand and category", () => {
    expect(sectionOf(result, COMPARE_SECTION_IDS.OVERVIEW).rows.map((row) => row.labelKey)).toEqual([
      "comparePage.rows.price",
      "comparePage.rows.brand",
      "comparePage.rows.category",
    ]);
  });

  test("the brand cell shows the brand's label, not its id", () => {
    const row = rowByLabel(result, "comparePage.rows.brand");
    row.cells.forEach((cell) => {
      const product = getCatalogProductById(cell.productId);
      expect(cell.text).not.toBe(product.brandId);
      expect(cell.text.toLowerCase()).toContain(product.brandId.slice(0, 3));
    });
  });

  /**
   * Comparing two products' prices is the one place a cross-column judgement is allowed, and
   * it is a statement of fact ("this one costs least"), not a recommendation.
   */
  test("marks exactly the cheapest product in the price row", () => {
    const cheapest = [...LAPTOPS].sort((a, b) => a.priceValue - b.priceValue)[0];
    const dearest = [...LAPTOPS].sort((a, b) => b.priceValue - a.priceValue)[0];
    const row = rowByLabel(buildCompareRows(byIds(cheapest.id, dearest.id), t), "comparePage.rows.price");

    expect(row.cells.filter((cell) => cell.isLowest)).toHaveLength(1);
    expect(row.cells.find((cell) => cell.isLowest).productId).toBe(cheapest.id);
  });

  test("two products of the same brand make the brand row agree", () => {
    const sameBrand = LAPTOPS.filter((p) => p.brandId === LAPTOPS[0].brandId).slice(0, 2);
    if (sameBrand.length < 2) return;
    const row = rowByLabel(buildCompareRows(byIds(...sameBrand.map((p) => p.id)), t), "comparePage.rows.brand");
    expect(row.allSame).toBe(true);
  });
});

describe("the specs section", () => {
  test("uses the same label keys the product page's spec table does", () => {
    const result = buildCompareRows(byIds(LAPTOPS[0].id, LAPTOPS[1].id), t);
    sectionOf(result, COMPARE_SECTION_IDS.SPECS).rows.forEach((row) => {
      expect(row.labelKey).toMatch(/^productDetail\.specs(Brief|Extended)\./);
    });
  });

  test("resolves values that are translation keys rather than printing the key", () => {
    const result = buildCompareRows(byIds(HEADPHONES[0].id, HEADPHONES[1].id), t);
    allRows(result).forEach((row) => {
      row.cells.forEach((cell) => {
        expect(cell.text).not.toMatch(/^productDetail\./);
      });
    });
  });

  test("marks a row every column agrees on as allSame", () => {
    const result = buildCompareRows(byIds(LAPTOPS[0].id, LAPTOPS[1].id), t);
    const rows = sectionOf(result, COMPARE_SECTION_IDS.SPECS).rows;
    rows.forEach((row) => {
      const texts = row.cells.map((cell) => cell.text);
      expect(row.allSame).toBe(new Set(texts).size === 1);
    });
    /** RAM is a per-category fixture, so two laptops must agree on it — proves the flag fires. */
    expect(rowByLabel(result, "productDetail.specsBrief.ram").allSame).toBe(true);
  });

  /**
   * `normalizeCompareIds` makes a mixed-category selection unreachable through the UI, but the
   * union is what keeps this function total: it must not produce a ragged table if it is ever
   * handed one, and the gap must read as a gap rather than as an empty cell.
   */
  test("fills a spec one product has and another lacks with the placeholder", () => {
    const result = buildCompareRows(byIds(LAPTOPS[0].id, HEADPHONES[0].id), t);
    const screenRow = rowByLabel(result, "productDetail.specsBrief.screenSize");

    expect(screenRow, "a laptop contributes a screen row").toBeTruthy();
    expect(screenRow.cells[0].hasValue).toBe(true);
    expect(screenRow.cells[1].hasValue).toBe(false);
    expect(screenRow.cells[1].text).toBe(PLACEHOLDER);
    expect(screenRow.allSame).toBe(false);
  });
});

describe("the offers section", () => {
  const result = buildCompareRows(byIds(LAPTOPS[0].id, LAPTOPS[1].id), t);
  const offers = sectionOf(result, COMPARE_SECTION_IDS.OFFERS);

  test("has one row per shop, keyed by the shop's own translation key", () => {
    const shopKeys = getOffersForProduct(LAPTOPS[0]).map((offer) => offer.shopNameKey);
    expect(offers.rows.map((row) => row.labelKey)).toEqual(shopKeys);
    expect(shopKeys.length).toBeGreaterThan(1);
  });

  test("every shop quotes a price for every column", () => {
    offers.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        expect(cell.hasValue).toBe(true);
        expect(cell.text).toMatch(/\d/);
      });
    });
  });

  /**
   * The cheapest shop is marked **within each column**. Marking the cheapest across columns
   * would be answering "which product should I buy", which a spec table has no business doing.
   */
  test("marks exactly one cheapest shop per product, independently per column", () => {
    [LAPTOPS[0], LAPTOPS[1]].forEach((product, column) => {
      const marked = offers.rows.filter((row) => row.cells[column].isLowest);
      expect(marked, `one lowest offer for ${product.id}`).toHaveLength(1);

      const cheapestShopKey = getOffersForProduct(product).reduce((best, offer) =>
        offer.priceAmd < best.priceAmd ? offer : best,
      ).shopNameKey;
      expect(marked[0].labelKey).toBe(cheapestShopKey);
    });
  });

  test("the dearer product's cheapest shop is still marked, even though it costs more than the other column's dearest", () => {
    const cheap = [...LAPTOPS].sort((a, b) => a.priceValue - b.priceValue)[0];
    const dear = [...LAPTOPS].sort((a, b) => b.priceValue - a.priceValue)[0];
    const rows = sectionOf(buildCompareRows(byIds(cheap.id, dear.id), t), COMPARE_SECTION_IDS.OFFERS).rows;

    expect(rows.filter((row) => row.cells[0].isLowest)).toHaveLength(1);
    expect(rows.filter((row) => row.cells[1].isLowest)).toHaveLength(1);
  });
});
