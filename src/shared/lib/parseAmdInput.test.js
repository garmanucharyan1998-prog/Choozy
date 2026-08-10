import { parseAmdInput } from "./parseAmdInput";

describe("parseAmdInput", () => {
  test.each([
    ["89000", 89000],
    ["89,000", 89000],
    ["89 000", 89000],
    ["1,290,000", 1290000],
    ["  550,000  ", 550000],
  ])("reads a grouped amount: %s -> %i", (raw, expected) => {
    expect(parseAmdInput(raw)).toBe(expected);
  });

  /**
   * The bug this replaces: every caller stripped non-digits, which glues the digits either
   * side of a decimal point together — a hundredfold overcharge on a price a seller typed.
   */
  test.each([
    ["89,000.50", 89000],
    ["89000.99", 89000],
    ["550 000,75", 550000],
  ])("drops a fractional part instead of multiplying it in: %s -> %i", (raw, expected) => {
    expect(parseAmdInput(raw)).toBe(expected);
  });

  test("strips a currency word or symbol", () => {
    expect(parseAmdInput("739,000 AMD")).toBe(739000);
    expect(parseAmdInput("739,000 դր.")).toBe(739000);
    expect(parseAmdInput("739 000 драм")).toBe(739000);
    expect(parseAmdInput("֏739,000")).toBe(739000);
  });

  test("reads amounts grouped with a no-break space, as formatted output uses", () => {
    expect(parseAmdInput("739 000")).toBe(739000);
    expect(parseAmdInput("739 000")).toBe(739000);
  });

  /** A negative price is a typo, not a discount — it used to come back positive. */
  test.each(["-5000", "−5000"])("rejects the negative amount %s", (raw) => {
    expect(parseAmdInput(raw)).toBeNull();
  });

  test.each(["", "   ", null, undefined, "abc", "AMD", "."])(
    "returns null when there is no number: %s",
    (raw) => {
      expect(parseAmdInput(raw)).toBeNull();
    },
  );

  test("caps an implausibly long paste instead of returning a nonsense amount", () => {
    expect(parseAmdInput("123456789012345")).toBe(9_999_999_999);
  });

  test("accepts a number as well as a string", () => {
    expect(parseAmdInput(89000)).toBe(89000);
  });

  /** Zero is not a price; the add-product form used to accept it because "0" is truthy. */
  test.each(["0", "0.00", "0 AMD", 0])("treats %s as no amount", (raw) => {
    expect(parseAmdInput(raw)).toBeNull();
  });
});
