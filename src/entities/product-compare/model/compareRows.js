/**
 * Turns a selection into the rows of the comparison table.
 *
 * The hard part is that spec rows are **per category and per product**: `buildSpecsForProduct`
 * emits a screen row only for things with a screen, a storage row only for things with
 * storage, and drops anything whose value came out empty. Two smartphones can therefore
 * disagree about which rows exist. A table needs the opposite — one fixed set of rows, every
 * column answering all of them — so this takes the union of the label keys, in the order the
 * first product that has each one emits it, and fills the gaps with a dash.
 *
 * Rows carry `allSame` so the view can offer "show differences only" without re-deriving
 * anything, and offer cells carry `isLowest` so the cheapest shop in each column can be
 * marked. `isLowest` is deliberately **per column, never across columns**: the cheapest shop
 * for a given product is useful information, whereas "the iPhone costs more than the Pixel"
 * is not a verdict this table hands down on its own — a *spec* row never declares a winner
 * from formatted text alone.
 *
 * Spec rows are different: a row backed by a known numeric fact (screen size, storage, RAM,
 * battery, refresh rate, weight, warranty, year — see `compareAttributes.js`) carries
 * `direction` and per-cell `isBest`, computed from each product's own raw catalog number, not
 * from the formatted string. `isBest` is only ever set when *every* cell in the row has a raw
 * number — a missing spec is unknown, not a loss, and never left looking like one — and never
 * when the row is `allSame`.
 *
 * Offer cells carry `raw` (the price in dram) alongside their formatted text so the offers
 * section can be reordered by one column without re-parsing "735,000 դր." back into a number —
 * see `sortOfferRowsByPrice`.
 */
import {
  buildSpecsForProduct,
  getBrandLabel,
  getOffersForProduct,
  getProductDetailForRoute,
  resolveSpecValue,
} from "entities/product";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";
import { COMPARE_ATTRIBUTE_BY_KEY } from "./compareAttributes";
import { COMPARE_SPEC_GROUPS, specGroupIdForLabelKey } from "./compareSpecGroups";

/**
 * Connects a spec row's `labelKey` (from `productSpecs.js`, e.g.
 * `"productDetail.specsBrief.screenSize"`) to the matching `compareAttributes.js` entry.
 * Two labelKeys map to `storage`: laptops state it as `specsExtended.ssd` (a real SSD),
 * everything else as `specsBrief.storage` (flash storage with no drive to name) — both are
 * the same fact for ranking purposes.
 */
const SPEC_LABEL_KEY_TO_ATTRIBUTE_KEY = {
  "productDetail.specsBrief.screenSize": "screen",
  "productDetail.specsBrief.storage": "storage",
  "productDetail.specsExtended.ssd": "storage",
  "productDetail.specsBrief.ram": "ram",
  "productDetail.specsBrief.battery": "battery",
  "productDetail.specsExtended.refreshRate": "refresh",
  "productDetail.specsExtended.weight": "weight",
  "productDetail.specsExtended.warranty": "warranty",
  "productDetail.specsBrief.year": "year",
  "productDetail.specsExtended.antutu": "antutu",
  "productDetail.specsExtended.geekbenchSingle": "geekbenchSingle",
  "productDetail.specsExtended.geekbenchMulti": "geekbenchMulti",
};

/**
 * What a section *is*, as opposed to which one it is. The spec rows are now split across several
 * semantic groups (see `compareSpecGroups.js`), so a consumer that needs "the shop prices" or
 * "anything that is a spec" asks by `kind`; `section.id` stays unique per rendered block, which
 * is what a React key, a jump-link anchor and a collapse toggle each need.
 */
export const COMPARE_SECTION_IDS = {
  OVERVIEW: "overview",
  SPECS: "specs",
  OFFERS: "offers",
};

/**
 * How many cells may carry `isBest` before the mark stops meaning anything.
 *
 * Three of four phones released in 2025 and one in 2024 is a real difference, but painting three
 * "best" ticks says nothing a reader can act on — it just spends the page's strongest signal on
 * the majority. The rule is that a win has to be a *minority* position to be marked: 1 of 2 and
 * 2 of 4 still mark, 3 of 4 does not. The row is untouched otherwise — it still shows every
 * value, and still counts as a difference for "show differences only", so nothing is hidden.
 */
const marksWinners = (cells, winnerCount) => winnerCount > 0 && winnerCount * 2 <= cells.length;

/**
 * Builds one row from a per-product lookup, marking it `allSame` when every column agrees.
 * A row where nobody has a value would be pure noise, so it is dropped by returning `null`.
 *
 * @param {"higher" | "lower" | null} direction - when set, and every cell resolves a raw
 *   number, the best cell(s) get `isBest: true`.
 */
const buildRow = (labelKey, products, valueFor, placeholder, direction = null) => {
  const cells = products.map((product, index) => {
    const resolved = valueFor(product, index);
    const text = resolved && resolved.text ? resolved.text : "";
    return {
      productId: product.id,
      text: text || placeholder,
      hasValue: Boolean(text),
      isLowest: Boolean(resolved && resolved.isLowest),
      raw: resolved && typeof resolved.raw === "number" ? resolved.raw : null,
      isBest: false,
    };
  });

  if (!cells.some((cell) => cell.hasValue)) return null;

  const [first] = cells;
  const allSame = cells.every((cell) => cell.text === first.text);

  if (direction && !allSame && cells.every((cell) => typeof cell.raw === "number")) {
    const best =
      direction === "lower"
        ? Math.min(...cells.map((cell) => cell.raw))
        : Math.max(...cells.map((cell) => cell.raw));
    const winnerCount = cells.filter((cell) => cell.raw === best).length;
    if (marksWinners(cells, winnerCount)) {
      cells.forEach((cell) => {
        cell.isBest = cell.raw === best;
      });
    }
  }

  return { labelKey, cells, allSame, direction };
};

/**
 * @param {{ id: string, title: string, brandId: string, categoryId: string }[]} products
 * @param {(key: string, fallback?: string) => string} t
 */
export const buildCompareRows = (products, t) => {
  const placeholder = t("comparePage.noValue");
  const currencySuffix = t("productDetail.currencySuffix");

  /**
   * `priceMinAmd` is read from the detail payload rather than recomputed here: it is
   * `Math.min(priceValue, ...offerPrices)`, and a second copy of that formula is exactly how
   * the price shown on a card once came to disagree with the offers listed under it.
   */
  const details = products.map((product) => getProductDetailForRoute(product.id));
  const offersByProductId = new Map(
    products.map((product) => [product.id, getOffersForProduct(product)]),
  );

  const lowestPriceMin = Math.min(...details.map((detail) => detail.priceMinAmd));

  const overview = [
    buildRow("comparePage.rows.price", products, (product, index) => ({
      text: formatPriceAmd(details[index].priceMinAmd, currencySuffix),
      isLowest: details[index].priceMinAmd === lowestPriceMin,
    }), placeholder),
    buildRow(
      "comparePage.rows.brand",
      products,
      (product) => ({ text: getBrandLabel(product.brandId) }),
      placeholder,
    ),
    buildRow(
      "comparePage.rows.category",
      products,
      (product) => ({
        text: t(`filterPage.categories.${product.categoryId}`, product.categoryId),
      }),
      placeholder,
    ),
  ].filter(Boolean);

  /** Label keys in first-seen order: brief rows before extended, first product before second. */
  const specRowsByProductId = new Map(
    products.map((product) => {
      const { brief, extended } = buildSpecsForProduct(product);
      return [product.id, new Map([...brief, ...extended].map((row) => [row.labelKey, row]))];
    }),
  );
  const specLabelKeys = [];
  products.forEach((product) => {
    specRowsByProductId.get(product.id).forEach((_row, labelKey) => {
      if (!specLabelKeys.includes(labelKey)) specLabelKeys.push(labelKey);
    });
  });

  const specs = specLabelKeys
    .map((labelKey) => {
      const attr = COMPARE_ATTRIBUTE_BY_KEY.get(SPEC_LABEL_KEY_TO_ATTRIBUTE_KEY[labelKey]);
      return buildRow(
        labelKey,
        products,
        (product) => ({
          text: resolveSpecValue(specRowsByProductId.get(product.id).get(labelKey), t),
          raw: attr ? attr.getValue(product) : null,
        }),
        placeholder,
        attr ? attr.direction : null,
      );
    })
    .filter(Boolean);

  /**
   * The union of the shops quoting *any* of the compared products, in first-seen order. Shops
   * carry only the categories they stock (and the Apple reseller only Apple), so two products
   * genuinely differ in which shops list them — a shop with nothing to say about one column
   * still gets its row, with the placeholder in that cell.
   */
  const shopKeys = [];
  products.forEach((product) => {
    offersByProductId.get(product.id).forEach((offer) => {
      if (!shopKeys.includes(offer.shopNameKey)) shopKeys.push(offer.shopNameKey);
    });
  });

  const cheapestOfferByProductId = new Map(
    products.map((product) => {
      const prices = offersByProductId.get(product.id).map((offer) => offer.priceAmd);
      return [product.id, prices.length ? Math.min(...prices) : null];
    }),
  );

  const offers = shopKeys
    .map((shopNameKey) =>
      buildRow(
        shopNameKey,
        products,
        (product) => {
          const offer = offersByProductId
            .get(product.id)
            .find((entry) => entry.shopNameKey === shopNameKey);
          if (!offer) return { text: "" };
          return {
            text: formatPriceAmd(offer.priceAmd, currencySuffix),
            isLowest: offer.priceAmd === cheapestOfferByProductId.get(product.id),
            raw: offer.priceAmd,
          };
        },
        placeholder,
      ),
    )
    .filter(Boolean);

  /**
   * The spec rows, filed under semantic headings instead of one flat run. Rows keep the
   * first-seen order `specLabelKeys` established *within* each group, and a group that the
   * selection produced no rows for never appears — a "Camera" heading over an empty body is
   * worse than no heading at all.
   */
  const rowsByGroupId = new Map();
  specs.forEach((row) => {
    const groupId = specGroupIdForLabelKey(row.labelKey);
    if (!rowsByGroupId.has(groupId)) rowsByGroupId.set(groupId, []);
    rowsByGroupId.get(groupId).push(row);
  });
  const specSections = COMPARE_SPEC_GROUPS.filter((group) => rowsByGroupId.has(group.id)).map(
    (group) => ({
      id: `specs-${group.id}`,
      kind: COMPARE_SECTION_IDS.SPECS,
      labelKey: group.labelKey,
      rows: rowsByGroupId.get(group.id),
    }),
  );

  return {
    sections: [
      {
        id: COMPARE_SECTION_IDS.OVERVIEW,
        kind: COMPARE_SECTION_IDS.OVERVIEW,
        labelKey: "comparePage.sections.overview",
        rows: overview,
      },
      ...specSections,
      {
        id: COMPARE_SECTION_IDS.OFFERS,
        kind: COMPARE_SECTION_IDS.OFFERS,
        labelKey: "comparePage.sections.offers",
        rows: offers,
      },
    ].filter((section) => section.rows.length > 0),
  };
};

export const OFFER_SORT_DIRECTIONS = { ASC: "asc", DESC: "desc" };

/**
 * Reorders the offers section by the price in **one** column, leaving every other column's
 * numbers exactly where they were — the cells are read, never rewritten, so a shop's row still
 * carries the same prices after the sort as before it. Returns the rows untouched (same array)
 * when there is nothing to sort by, so a presenter can call it unconditionally.
 *
 * A shop that does not stock the sorted product sinks to the bottom in **both** directions
 * rather than counting as free or as expensive — the same rule `isBest` follows for a missing
 * spec: unknown is not a value, and must not be made to look like one.
 *
 * The pre-sort index breaks ties, which does two things: equal prices keep the shop order
 * `buildCompareRows` emitted (most popular first), and the result does not depend on the
 * engine's sort stability. That default order is also what the view returns to when the visitor
 * cycles the control off, which is why sorting happens here rather than inside the builder.
 *
 * @param {{ labelKey: string, cells: { productId: string, raw: number | null }[] }[]} rows
 * @param {string | null} productId - the column to sort by
 * @param {"asc" | "desc" | null} direction
 */
export const sortOfferRowsByPrice = (rows, productId, direction) => {
  const isKnownDirection =
    direction === OFFER_SORT_DIRECTIONS.ASC || direction === OFFER_SORT_DIRECTIONS.DESC;
  if (!productId || !isKnownDirection) return rows;

  const priceFor = (row) => {
    const cell = row.cells.find((entry) => entry.productId === productId);
    return cell && typeof cell.raw === "number" ? cell.raw : null;
  };

  return rows
    .map((row, index) => ({ row, index, price: priceFor(row) }))
    .sort((a, b) => {
      if (a.price === null || b.price === null) {
        if (a.price === b.price) return a.index - b.index;
        return a.price === null ? 1 : -1;
      }
      const delta =
        direction === OFFER_SORT_DIRECTIONS.ASC ? a.price - b.price : b.price - a.price;
      return delta || a.index - b.index;
    })
    .map((entry) => entry.row);
};

export default buildCompareRows;
