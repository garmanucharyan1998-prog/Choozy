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
 * anything, and cells carry `isLowest` so the cheapest shop in each column can be marked.
 * `isLowest` is deliberately **per column, never across columns**: the cheapest shop for a
 * given product is useful information, whereas "the iPhone costs more than the Pixel" is not
 * a verdict this table is entitled to hand down.
 */
import {
  buildSpecsForProduct,
  getBrandLabel,
  getOffersForProduct,
  getProductDetailForRoute,
  resolveSpecValue,
} from "entities/product";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";

export const COMPARE_SECTION_IDS = {
  OVERVIEW: "overview",
  SPECS: "specs",
  OFFERS: "offers",
};

/**
 * Builds one row from a per-product lookup, marking it `allSame` when every column agrees.
 * A row where nobody has a value would be pure noise, so it is dropped by returning `null`.
 */
const buildRow = (labelKey, products, valueFor, placeholder) => {
  const cells = products.map((product, index) => {
    const resolved = valueFor(product, index);
    const text = resolved && resolved.text ? resolved.text : "";
    return {
      productId: product.id,
      text: text || placeholder,
      hasValue: Boolean(text),
      isLowest: Boolean(resolved && resolved.isLowest),
    };
  });

  if (!cells.some((cell) => cell.hasValue)) return null;

  const [first] = cells;
  return {
    labelKey,
    cells,
    allSame: cells.every((cell) => cell.text === first.text),
  };
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
    .map((labelKey) =>
      buildRow(
        labelKey,
        products,
        (product) => ({
          text: resolveSpecValue(specRowsByProductId.get(product.id).get(labelKey), t),
        }),
        placeholder,
      ),
    )
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
