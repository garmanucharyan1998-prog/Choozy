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
};

export const COMPARE_SECTION_IDS = {
  OVERVIEW: "overview",
  SPECS: "specs",
  OFFERS: "offers",
};

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
    cells.forEach((cell) => {
      cell.isBest = cell.raw === best;
    });
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
   * Every product is offered by the same three shops, but that is a property of the current
   * data, not a guarantee — the union keeps the table correct if one product ever carries a
   * shop the others do not.
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
          };
        },
        placeholder,
      ),
    )
    .filter(Boolean);

  return {
    sections: [
      { id: COMPARE_SECTION_IDS.OVERVIEW, labelKey: "comparePage.sections.overview", rows: overview },
      { id: COMPARE_SECTION_IDS.SPECS, labelKey: "comparePage.sections.specs", rows: specs },
      { id: COMPARE_SECTION_IDS.OFFERS, labelKey: "comparePage.sections.offers", rows: offers },
    ].filter((section) => section.rows.length > 0),
  };
};

export default buildCompareRows;
