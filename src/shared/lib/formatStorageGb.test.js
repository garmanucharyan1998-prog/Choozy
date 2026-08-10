import { formatStorageGb } from "./formatStorageGb";

describe("formatStorageGb", () => {
  test.each([
    [64, "64 GB"],
    [128, "128 GB"],
    [256, "256 GB"],
    [512, "512 GB"],
    [999, "999 GB"],
  ])("%i -> %s", (gb, expected) => {
    expect(formatStorageGb(gb)).toBe(expected);
  });

  /**
   * The bug this module exists to prevent: one copy of this logic switched to TB at 128, so
   * a 128 GB tablet read "0.128 TB" in its spec table and "128 GB" in its storage picker.
   */
  test("does not switch to TB below a terabyte", () => {
    expect(formatStorageGb(128)).toBe("128 GB");
    expect(formatStorageGb(128)).not.toContain("TB");
  });

  test.each([
    [1000, "1 TB"],
    [2000, "2 TB"],
    [1500, "1.5 TB"],
  ])("%i -> %s", (gb, expected) => {
    expect(formatStorageGb(gb)).toBe(expected);
  });

  test.each([undefined, null, 0, -256, NaN, Infinity, "512"])(
    "returns an empty string for %s so callers can drop the row",
    (value) => {
      expect(formatStorageGb(value)).toBe("");
    },
  );
});
