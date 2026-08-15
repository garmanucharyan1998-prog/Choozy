import { getTranslator } from "shared/i18n";
import { PRODUCT_CATALOG, getCatalogProductById, getOffersForProduct } from "entities/product";
import {
  COMPARE_SECTION_IDS,
  OFFER_SORT_DIRECTIONS,
  buildCompareRows,
  sortOfferRowsByPrice,
} from "./compareRows";

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
/**
 * The spec rows are split across several semantic groups (see `compareSpecGroups.js`), so
 * `section.id` is unique per rendered block and `section.kind` is what says "this is a spec
 * section". Most of what these tests assert is about the rows themselves, not about which
 * heading they happen to sit under.
 */
const rowsOfKind = (result, kind) =>
  result.sections.filter((section) => section.kind === kind).flatMap((section) => section.rows);
const allRows = (result) => result.sections.flatMap((section) => section.rows);
const rowByLabel = (result, labelKey) => allRows(result).find((row) => row.labelKey === labelKey);

describe("buildCompareRows — table shape", () => {
  const result = buildCompareRows(byIds(LAPTOPS[0].id, LAPTOPS[1].id, LAPTOPS[2].id), t);

  /**
   * The overview first, the shop prices last, and every specification group in between — a
   * reader meets "what is this and what does it cost", then the specifications, then where to
   * buy. The middle used to be one flat section; it is now one per semantic group, which is why
   * this asserts the *kinds* rather than a fixed list of three ids.
   */
  test("emits the sections in a fixed order: overview, spec groups, offers", () => {
    const kinds = result.sections.map((section) => section.kind);

    expect(kinds.at(0)).toBe(COMPARE_SECTION_IDS.OVERVIEW);
    expect(kinds.at(-1)).toBe(COMPARE_SECTION_IDS.OFFERS);
    expect(kinds.slice(1, -1)).not.toHaveLength(0);
    kinds.slice(1, -1).forEach((kind) => expect(kind).toBe(COMPARE_SECTION_IDS.SPECS));
  });

  /** Two blocks sharing an id would collide as React keys and as `aria-controls` targets. */
  test("every section id is unique", () => {
    const ids = result.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /**
   * Grouping is allowed to decide which heading a row sits under; it is never allowed to lose
   * one. Anything `compareSpecGroups` does not know about falls into the trailing group.
   */
  test("grouping keeps every spec row the flat build would have emitted", () => {
    const grouped = rowsOfKind(result, COMPARE_SECTION_IDS.SPECS).map((row) => row.labelKey);
    expect(new Set(grouped).size).toBe(grouped.length);
    grouped.forEach((labelKey) => {
      expect(labelKey).toMatch(/^productDetail\.specs(Brief|Extended)\./);
    });
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

/**
 * A win is only marked when it is a *minority* position. Three of four phones released in 2025
 * and one in 2024 is a real difference, but painting three "best" ticks says nothing a reader can
 * act on — it spends the table's strongest signal on the majority and leaves the one value that
 * actually stands out unmarked. The row keeps every value either way, and still counts as a
 * difference for "show differences only", so nothing is hidden by this.
 */
describe("marking a winner only when the win is a minority", () => {
  const YEAR = "productDetail.specsBrief.year";

  test("marks a value two of four columns share", () => {
    const row = rowByLabel(buildCompareRows(byIds("fp-1", "fp-4", "fp-16", "fp-20"), t), YEAR);

    expect(row.allSame).toBe(false);
    expect(row.cells.filter((cell) => cell.isBest)).toHaveLength(2);
    expect(new Set(row.cells.filter((cell) => cell.isBest).map((cell) => cell.text)).size).toBe(1);
  });

  test("marks nothing when three of four columns share the best value", () => {
    const row = rowByLabel(buildCompareRows(byIds("fp-30", "fp-31", "fp-32", "fp-33"), t), YEAR);

    expect(row.allSame, "a row where everything agrees would prove nothing").toBe(false);
    expect(row.cells.filter((cell) => cell.isBest)).toHaveLength(0);
  });

  /** One of two is still a minority — otherwise a pair page could never mark anything. */
  test("still marks the winner of a two-column comparison", () => {
    const row = rowByLabel(buildCompareRows(byIds("fp-1", "fp-16"), t), YEAR);

    expect(row.cells.filter((cell) => cell.isBest)).toHaveLength(1);
  });
});

describe("the specs section", () => {
  test("uses the same label keys the product page's spec table does", () => {
    const result = buildCompareRows(byIds(LAPTOPS[0].id, LAPTOPS[1].id), t);
    const rows = rowsOfKind(result, COMPARE_SECTION_IDS.SPECS);
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
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
    const rows = rowsOfKind(result, COMPARE_SECTION_IDS.SPECS);
    rows.forEach((row) => {
      const texts = row.cells.map((cell) => cell.text);
      expect(row.allSame).toBe(new Set(texts).size === 1);
    });
  });

  /**
   * RAM is each laptop's own real `ramGb`, not one value shared by the whole category — two
   * laptops can genuinely differ (a MacBook Pro's 24 GB really isn't an XPS 15's 32 GB), so
   * `allSame` has to earn a `true` and a `false` here rather than getting one for free from a
   * fixture that never varied in the first place.
   */
  test("the RAM row agrees only when the two laptops' real RAM matches", () => {
    const byRam = new Map();
    LAPTOPS.forEach((p) => {
      const bucket = byRam.get(p.ramGb) ?? [];
      bucket.push(p);
      byRam.set(p.ramGb, bucket);
    });
    const sameRam = [...byRam.values()].find((bucket) => bucket.length > 1);
    const differentRam = LAPTOPS.find((p) => p.ramGb !== sameRam[0].ramGb);
    expect(sameRam, "fixture needs two laptops sharing a RAM size").toBeTruthy();
    expect(differentRam, "fixture needs a laptop with a different RAM size").toBeTruthy();

    const agreeing = buildCompareRows(byIds(sameRam[0].id, sameRam[1].id), t);
    expect(rowByLabel(agreeing, "productDetail.specsBrief.ram").allSame).toBe(true);

    const disagreeing = buildCompareRows(byIds(sameRam[0].id, differentRam.id), t);
    expect(rowByLabel(disagreeing, "productDetail.specsBrief.ram").allSame).toBe(false);
  });

  /**
   * `isBest` is the new, deliberately cross-column judgement for specs backed by a known
   * numeric fact (unlike `allSame`, which only compares formatted text). RAM is "higher is
   * better", so whichever laptop reports the bigger `ramGb` should be the one marked.
   */
  test("marks the cell with the higher raw RAM value as isBest, on a row with real numeric backing", () => {
    const byRam = new Map();
    LAPTOPS.forEach((p) => {
      const bucket = byRam.get(p.ramGb) ?? [];
      bucket.push(p);
      byRam.set(p.ramGb, bucket);
    });
    const ramValues = [...byRam.keys()];
    const higherRam = LAPTOPS.find((p) => p.ramGb === Math.max(...ramValues));
    const lowerRam = LAPTOPS.find((p) => p.ramGb === Math.min(...ramValues));
    expect(higherRam.ramGb).toBeGreaterThan(lowerRam.ramGb);

    const result = buildCompareRows(byIds(lowerRam.id, higherRam.id), t);
    const row = rowByLabel(result, "productDetail.specsBrief.ram");

    expect(row.direction).toBe("higher");
    expect(row.cells.find((c) => c.productId === higherRam.id).isBest).toBe(true);
    expect(row.cells.find((c) => c.productId === lowerRam.id).isBest).toBe(false);
    expect(row.cells.find((c) => c.productId === higherRam.id).raw).toBe(higherRam.ramGb);
  });

  test("never marks isBest on a row where every column agrees", () => {
    const byRam = new Map();
    LAPTOPS.forEach((p) => {
      const bucket = byRam.get(p.ramGb) ?? [];
      bucket.push(p);
      byRam.set(p.ramGb, bucket);
    });
    const sameRamPair = [...byRam.values()].find((bucket) => bucket.length > 1);
    const result = buildCompareRows(byIds(sameRamPair[0].id, sameRamPair[1].id), t);
    const row = rowByLabel(result, "productDetail.specsBrief.ram");
    expect(row.allSame).toBe(true);
    expect(row.cells.every((cell) => cell.isBest === false)).toBe(true);
  });

  /**
   * A row with no known numeric backing at all (e.g. a purely categorical fact like screen
   * technology) carries no `direction` and never marks a winner — there is no "better" OLED.
   */
  test("a non-numeric spec row carries no direction and marks no cell isBest", () => {
    const result = buildCompareRows(byIds(LAPTOPS[0].id, LAPTOPS[1].id), t);
    const screenTypeRow = allRows(result).find(
      (row) => row.labelKey === "productDetail.specsExtended.screenType",
    );
    if (!screenTypeRow) return;
    expect(screenTypeRow.direction).toBeNull();
    expect(screenTypeRow.cells.every((cell) => cell.isBest === false)).toBe(true);
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

  test("a quoted cell carries a real amount and an unquoted one reads as a gap", () => {
    offers.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        if (cell.hasValue) {
          expect(cell.text).toMatch(/\d/);
        } else {
          expect(cell.text).toBe(PLACEHOLDER);
        }
      });
    });
  });

  /**
   * Shops carry the categories — and, for the Apple premium reseller, the brand — they
   * actually stock, so comparing an Apple laptop against a Windows one puts that reseller in
   * the union with nothing to say about the second column. The union exists precisely so this
   * reads as a gap instead of dropping the shop (or the whole row) from the table.
   */
  test("a shop that carries only one of the two products still gets its own row", () => {
    const apple = LAPTOPS.find((p) => p.brandId === "apple");
    const other = LAPTOPS.find((p) => p.brandId !== "apple");
    expect(apple && other, "the catalog needs both to make this case").toBeTruthy();

    const rows = sectionOf(
      buildCompareRows(byIds(apple.id, other.id), t),
      COMPARE_SECTION_IDS.OFFERS,
    ).rows;

    const partial = rows.filter((row) => row.cells.some((cell) => !cell.hasValue));
    expect(partial.length).toBeGreaterThan(0);
    partial.forEach((row) => {
      expect(row.cells.some((cell) => cell.hasValue), "a row nobody quotes is not emitted").toBe(
        true,
      );
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

  /** Sorting reads this, and re-parsing "735,000 դր." back into a number would be absurd. */
  test("every quoted cell carries the raw price alongside its formatted text", () => {
    offers.rows.forEach((row) => {
      row.cells.forEach((cell) => {
        if (cell.hasValue) {
          expect(typeof cell.raw).toBe("number");
          expect(cell.text).toContain(cell.raw.toLocaleString("en-US"));
        } else {
          expect(cell.raw).toBeNull();
        }
      });
    });
  });
});

describe("sortOfferRowsByPrice", () => {
  const twoLaptops = byIds(LAPTOPS[0].id, LAPTOPS[1].id);
  const rowsFor = (products) =>
    sectionOf(buildCompareRows(products, t), COMPARE_SECTION_IDS.OFFERS).rows;
  const pricesIn = (rows, productId) =>
    rows.map((row) => row.cells.find((cell) => cell.productId === productId).raw);

  test("orders the shops cheapest-first for the chosen column", () => {
    const sorted = sortOfferRowsByPrice(
      rowsFor(twoLaptops),
      LAPTOPS[0].id,
      OFFER_SORT_DIRECTIONS.ASC,
    );
    const prices = pricesIn(sorted, LAPTOPS[0].id);

    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(new Set(prices).size, "the fixture needs prices that actually differ").toBeGreaterThan(1);
  });

  test("orders them dearest-first the other way", () => {
    const sorted = sortOfferRowsByPrice(
      rowsFor(twoLaptops),
      LAPTOPS[0].id,
      OFFER_SORT_DIRECTIONS.DESC,
    );
    const prices = pricesIn(sorted, LAPTOPS[0].id);

    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  /**
   * The other column keeps its own prices — the rows move as units. A sort that reordered one
   * column's numbers independently would be inventing offers no shop ever quoted.
   */
  test("moves whole rows, so every column still quotes what its shop quoted", () => {
    const rows = rowsFor(twoLaptops);
    const before = new Map(
      rows.map((row) => [row.labelKey, row.cells.map((cell) => cell.raw).join("/")]),
    );
    const sorted = sortOfferRowsByPrice(rows, LAPTOPS[1].id, OFFER_SORT_DIRECTIONS.ASC);

    expect(sorted).toHaveLength(rows.length);
    sorted.forEach((row) => {
      expect(row.cells.map((cell) => cell.raw).join("/")).toBe(before.get(row.labelKey));
    });
  });

  /**
   * Unknown is not a price: it must not sort as free, and it must not sort as expensive either.
   * The gap here is the Apple-only reseller, which quotes the MacBook column and has nothing to
   * say about the Windows one — so the *Windows* column is the one with a hole in it.
   */
  test("a shop that does not stock the sorted product sinks to the bottom in both directions", () => {
    const apple = LAPTOPS.find((p) => p.brandId === "apple");
    const other = LAPTOPS.find((p) => p.brandId !== "apple");
    const rows = rowsFor(byIds(apple.id, other.id));
    const gapKeys = rows
      .filter((row) => row.cells.find((cell) => cell.productId === other.id).raw === null)
      .map((row) => row.labelKey);
    expect(gapKeys.length, "the fixture needs a shop with a gap in that column").toBeGreaterThan(0);

    [OFFER_SORT_DIRECTIONS.ASC, OFFER_SORT_DIRECTIONS.DESC].forEach((direction) => {
      const sorted = sortOfferRowsByPrice(rows, other.id, direction);
      const tail = sorted.slice(-gapKeys.length).map((row) => row.labelKey);
      expect(new Set(tail)).toEqual(new Set(gapKeys));
    });
  });

  test("leaves the rows alone when there is nothing to sort by", () => {
    const rows = rowsFor(twoLaptops);

    expect(sortOfferRowsByPrice(rows, null, OFFER_SORT_DIRECTIONS.ASC)).toBe(rows);
    expect(sortOfferRowsByPrice(rows, LAPTOPS[0].id, null)).toBe(rows);
    expect(sortOfferRowsByPrice(rows, LAPTOPS[0].id, "sideways")).toBe(rows);
  });

  test("does not mutate the rows it was given", () => {
    const rows = rowsFor(twoLaptops);
    const originalOrder = rows.map((row) => row.labelKey);

    sortOfferRowsByPrice(rows, LAPTOPS[0].id, OFFER_SORT_DIRECTIONS.DESC);

    expect(rows.map((row) => row.labelKey)).toEqual(originalOrder);
  });

  /**
   * Equal prices keep the popularity order the builder emitted, which is also the order the view
   * returns to when the visitor cycles the control off — so the sort must not shuffle ties.
   */
  test("ties keep their original relative order", () => {
    const rows = rowsFor(twoLaptops);
    const tiedPrice = rows[0].cells[0].raw;
    const flat = rows.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => ({ ...cell, raw: tiedPrice })),
    }));

    const sorted = sortOfferRowsByPrice(flat, LAPTOPS[0].id, OFFER_SORT_DIRECTIONS.DESC);
    expect(sorted.map((row) => row.labelKey)).toEqual(rows.map((row) => row.labelKey));
  });
});
