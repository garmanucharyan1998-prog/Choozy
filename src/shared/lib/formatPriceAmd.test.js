import { formatPriceAmd, formatPriceRangeAmd } from "./formatPriceAmd";
import { parseAmdInput } from "./parseAmdInput";

/** The three real suffixes, from `productDetail.currencySuffix` in each locale. */
const SUFFIX = { am: "դր.", en: "AMD", ru: "драм" };

describe("formatPriceAmd", () => {
  test("uses the language's own currency word", () => {
    expect(formatPriceAmd(739000, SUFFIX.am)).toBe("739,000 դր.");
    expect(formatPriceAmd(739000, SUFFIX.en)).toBe("739,000 AMD");
    expect(formatPriceAmd(739000, SUFFIX.ru)).toBe("739,000 драм");
  });

  test("returns an empty string when there is no amount, so callers can fall back", () => {
    expect(formatPriceAmd(null, SUFFIX.am)).toBe("");
    expect(formatPriceAmd(undefined, SUFFIX.am)).toBe("");
    expect(formatPriceAmd(NaN, SUFFIX.am)).toBe("");
  });

  test("omits the suffix rather than printing 'undefined' when none is given", () => {
    expect(formatPriceAmd(739000, "")).toBe("739,000");
    expect(formatPriceAmd(739000, undefined)).toBe("739,000");
  });

  /** What the wishlist round-trip depends on: format, store, read back, same number. */
  test("round-trips through parseAmdInput in every locale", () => {
    Object.values(SUFFIX).forEach((suffix) => {
      expect(parseAmdInput(formatPriceAmd(1290000, suffix))).toBe(1290000);
    });
  });
});

describe("formatPriceRangeAmd", () => {
  test("shares one currency word across both ends", () => {
    expect(formatPriceRangeAmd(717000, 798000, SUFFIX.am)).toBe("717,000 – 798,000 դր.");
  });

  test("collapses to a single price when both ends match", () => {
    expect(formatPriceRangeAmd(739000, 739000, SUFFIX.en)).toBe("739,000 AMD");
  });

  test("falls back to whichever end exists", () => {
    expect(formatPriceRangeAmd(739000, null, SUFFIX.en)).toBe("739,000 AMD");
    expect(formatPriceRangeAmd(null, 739000, SUFFIX.en)).toBe("739,000 AMD");
    expect(formatPriceRangeAmd(null, null, SUFFIX.en)).toBe("");
  });
});
