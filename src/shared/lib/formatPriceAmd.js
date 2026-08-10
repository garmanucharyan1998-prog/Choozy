import { formatAmd } from "./formatAmd";

/**
 * A price with its currency word, in the visitor's language. The one place that decides
 * what an AMD amount looks like on screen.
 *
 * Catalog cards used to bake `"739,000 AMD"` into the data at module scope while the product
 * page those cards link to rendered the translated suffix — so in Armenian a card said
 * "739,000 AMD" and the page said "739,000 դր.", and in Russian "739,000 AMD" versus
 * "739,000 драм".
 *
 * @param {number | null | undefined} value
 * @param {string} currencySuffix — from `t("productDetail.currencySuffix")`
 * @returns {string} e.g. "739,000 դր."; empty when there's no amount to show
 */
export const formatPriceAmd = (value, currencySuffix) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const amount = formatAmd(value);
  return currencySuffix ? `${amount} ${currencySuffix}` : amount;
};

/**
 * A price range, sharing one currency word: "717,000 – 798,000 դր." Collapses to a single
 * price when both ends match, so an offer with one price doesn't read as a range.
 */
export const formatPriceRangeAmd = (minValue, maxValue, currencySuffix) => {
  const min = formatAmd(minValue);
  const max = formatAmd(maxValue);
  if (!min && !max) return "";
  if (!min || !max || min === max) return formatPriceAmd(minValue ?? maxValue, currencySuffix);
  return currencySuffix ? `${min} – ${max} ${currencySuffix}` : `${min} – ${max}`;
};

export default formatPriceAmd;
