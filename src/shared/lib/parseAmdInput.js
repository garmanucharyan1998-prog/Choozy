/** No shop is plausibly listing above this, and it stops a paste of junk digits. */
const MAX_AMD = 9_999_999_999;

/**
 * Reads an amount out of whatever a seller typed into a price field.
 *
 * Every caller used to do `String(raw).replace(/[^\d]/g, "")`, which keeps the digits either
 * side of a decimal separator and glues them together: "89,000.50" became 8,900,050 — a
 * hundredfold overcharge — and "-5000" became 5000. There is no subunit in circulation for
 * AMD, so a fractional part is dropped rather than multiplied in.
 *
 * @param {unknown} raw
 * @returns {number | null} a whole, non-negative amount, or `null` when there is no number.
 */
export const parseAmdInput = (raw) => {
  const text = String(raw ?? "").trim();
  if (!text) return null;

  /** A price is never negative; a leading minus is a typo, not a discount. */
  if (/^[-−]/.test(text)) return null;

  /**
   * Keep digits and the separators people group or point with; drop currency words.
   * U+00A0 and U+202F are the no-break and narrow no-break spaces that grouped output
   * and pasted text use in place of a plain space.
   */
  const cleaned = text.replace(/[^\d.,\s\u00a0\u202f]/g, "");
  if (!/\d/.test(cleaned)) return null;

  /**
   * A trailing group of one or two digits after a `.` or `,` is a fraction, not grouping —
   * thousands always come in threes.
   */
  const withoutFraction = cleaned.replace(/[.,](\d{1,2})\s*$/, "");
  const digits = (withoutFraction || cleaned).replace(/\D/g, "");
  if (!digits) return null;

  const amount = Number(digits);
  /**
   * Zero is not a price. Treated as "no amount" so callers get one answer to check rather
   * than each having to reject 0 on its own — the add-product form used to accept it,
   * because `formatAmd(0)` is the non-empty string "0" and passed its truthiness check.
   */
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.min(amount, MAX_AMD);
};

export default parseAmdInput;
