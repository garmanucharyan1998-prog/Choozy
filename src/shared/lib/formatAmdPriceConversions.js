import { parseAmdInput } from "./parseAmdInput";


/** Demo AMD cross-rates for shop manager price tooltips (replace with live rates when API exists). */
const AMD_PER_USD = 390;
const AMD_PER_RUB = 4.35;

/**
 * @param {unknown} product
 * @returns {number | null}
 */
export const parseProductAmdAmount = (product) => {
  if (!product || typeof product !== "object") return null;
  if (typeof product.priceAmd === "number" && Number.isFinite(product.priceAmd)) {
    return product.priceAmd;
  }
  return parseAmdInput(product.price);
};

/**
 * @param {number | null | undefined} amdAmount
 * @returns {{ usd: number; rub: number } | null}
 */
export const convertAmdToUsdRub = (amdAmount) => {
  if (amdAmount == null || !Number.isFinite(amdAmount) || amdAmount <= 0) return null;
  return {
    usd: amdAmount / AMD_PER_USD,
    rub: amdAmount / AMD_PER_RUB,
  };
};

/**
 * Compact USD / RUB labels for the shop price hover popup.
 * @param {number | null | undefined} amdAmount
 * @returns {{ usdLabel: string; rubLabel: string } | null}
 */
export const formatAmdPriceConversionParts = (amdAmount) => {
  const converted = convertAmdToUsdRub(amdAmount);
  if (!converted) return null;
  const usd = Math.round(converted.usd);
  const rub = Math.round(converted.rub);
  return {
    usdLabel: `$${usd.toLocaleString("en-US")}`,
    rubLabel: `${rub.toLocaleString("en-US")} ₽`,
  };
};
