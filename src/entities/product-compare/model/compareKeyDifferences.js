/**
 * The handful of differences worth reading before the table — "what actually separates these
 * products", answered in four lines instead of thirty rows.
 *
 * Built from `buildCompareBars`, and that is the point rather than an implementation detail: the
 * bars model only covers `COMPARE_ATTRIBUTES`, every one of which carries an explicit
 * `direction`. So a claim made here is only ever made about a fact whose better end the catalog
 * has committed to — more storage, more RAM, more battery, less weight, lower price. A row like
 * "Screen type: OLED vs LCD" or "Bluetooth 5.3 vs 5.2" genuinely differs and genuinely has no
 * better end, so it is never ranked here; it is left to the table, and the count the view prints
 * beside this list is what points at it.
 *
 * Two guards keep the list honest:
 *  - a difference is only listed when **one** product wins it. Two products tied at the top is
 *    not a reason to pick either, and naming one of them would be arbitrary.
 *  - `baselineFormatted` always rides along. "256 GB" on its own is a spec; "256 GB against
 *    128 GB" is a difference, and only the second is what this section claims to show.
 */
import { buildCompareBars } from "./compareBarsModel";

/**
 * The same 10% floor `buildCompareAdvantages` uses, and deliberately the same number: a margin
 * that is worth a bullet on a recommendation card is worth a line here, and two different
 * thresholds would let the page call something a key difference in one section and not in the
 * other.
 */
const KEY_DIFFERENCE_THRESHOLD_PERCENT = 10;

/** Four is what fits above the fold on a phone without becoming a second spec table. */
const MAX_KEY_DIFFERENCES = 4;

/**
 * @param {import("entities/product").CatalogProduct[]} products - 2–4 items
 * @param {(key: string, fallback?: string) => string} [t] - threaded into the bars model so a
 *   value printed here carries the same units as the same value printed in the table.
 * @returns {{
 *   key: string,
 *   labelKey: string,
 *   direction: "higher" | "lower",
 *   winnerId: string,
 *   winnerFormatted: string,
 *   baselineFormatted: string,
 *   deltaPercent: number,
 * }[]}
 */
export const buildCompareKeyDifferences = (products, t) => {
  if (!Array.isArray(products) || products.length < 2) return [];

  return buildCompareBars(products, t)
    .map((row) => {
      const winners = row.bars.filter((bar) => bar.isWinner);
      if (winners.length !== 1) return null;

      const [winner] = winners;
      if ((winner.deltaPercent ?? 0) < KEY_DIFFERENCE_THRESHOLD_PERCENT) return null;
      if (!row.baselineFormatted) return null;

      return {
        key: row.key,
        labelKey: row.labelKey,
        direction: row.direction,
        winnerId: winner.productId,
        winnerFormatted: winner.formatted,
        baselineFormatted: row.baselineFormatted,
        deltaPercent: winner.deltaPercent,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.deltaPercent - a.deltaPercent)
    .slice(0, MAX_KEY_DIFFERENCES);
};

export default buildCompareKeyDifferences;
