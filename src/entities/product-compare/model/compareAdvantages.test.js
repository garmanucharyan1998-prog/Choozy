import { buildCompareAdvantages } from "./compareAdvantages";

const productA = {
  id: "a",
  categoryId: "smartphones",
  screenInch: 6.9,
  refreshHz: 120,
  storageGb: 256,
  ramGb: 12,
  batteryMah: 4832,
  priceValue: 739000,
  weightGrams: 233,
  warrantyMonths: 12,
};

const productB = {
  id: "b",
  categoryId: "smartphones",
  screenInch: 6.1,
  refreshHz: 60,
  storageGb: 128,
  ramGb: 8,
  batteryMah: 3561,
  priceValue: 445000,
  weightGrams: 170,
  warrantyMonths: 12,
};

/** Wins every showBar attribute, decisively. */
const dominantProduct = {
  id: "dominant",
  categoryId: "smartphones",
  screenInch: 7,
  refreshHz: 144,
  storageGb: 512,
  ramGb: 16,
  batteryMah: 6000,
  priceValue: 100000,
  weightGrams: 100,
  warrantyMonths: 36,
};

/** Loses every showBar attribute, including price. */
const dominatedProduct = {
  id: "dominated",
  categoryId: "smartphones",
  screenInch: 6,
  refreshHz: 60,
  storageGb: 128,
  ramGb: 4,
  batteryMah: 3000,
  priceValue: 500000,
  weightGrams: 300,
  warrantyMonths: 12,
};

describe("buildCompareAdvantages", () => {
  test("returns {} for fewer than 2 products", () => {
    expect(buildCompareAdvantages([productA])).toEqual({});
    expect(buildCompareAdvantages(null)).toEqual({});
  });

  test("only lists attributes a product actually wins, never the other product's wins", () => {
    const result = buildCompareAdvantages([productA, productB]);
    // A wins screen/refresh/storage/ram/battery (all comfortably over 10%)
    expect(result.a.map((entry) => entry.labelKey)).toEqual(
      expect.arrayContaining([
        "comparePage.attr.screen",
        "comparePage.attr.refresh",
        "comparePage.attr.storage",
        "comparePage.attr.ram",
        "comparePage.attr.battery",
      ]),
    );
    // B wins price and weight
    expect(result.b.map((entry) => entry.labelKey)).toEqual(
      expect.arrayContaining(["comparePage.attr.price", "comparePage.attr.weight"]),
    );
    // Neither list contains the other's wins
    expect(result.a.some((entry) => entry.labelKey === "comparePage.attr.price")).toBe(false);
    expect(result.b.some((entry) => entry.labelKey === "comparePage.attr.screen")).toBe(false);
  });

  test("every listed advantage clears the 10% threshold", () => {
    const result = buildCompareAdvantages([productA, productB]);
    [...result.a, ...result.b].forEach((entry) => {
      if (entry.deltaPercent !== null) expect(entry.deltaPercent).toBeGreaterThanOrEqual(10);
    });
  });

  test("caps at 6 advantages even when a product wins every attribute", () => {
    const result = buildCompareAdvantages([dominantProduct, dominatedProduct]);
    expect(result.dominant.length).toBe(6);
    expect(result.dominant.every((entry) => entry.deltaPercent >= 10)).toBe(true);
  });

  test("a product that loses everything still gets one bullet: its own price, as a fact, not a claim", () => {
    const result = buildCompareAdvantages([dominantProduct, dominatedProduct]);
    expect(result.dominated.length).toBe(1);
    expect(result.dominated[0].labelKey).toBe("comparePage.attr.price");
    expect(result.dominated[0].deltaPercent).toBeNull();
  });

  test("a tie on every attribute still gives both products the price fallback", () => {
    const tiedA = { ...productA, id: "tiedA" };
    const tiedB = { ...productA, id: "tiedB" };
    const result = buildCompareAdvantages([tiedA, tiedB]);
    expect(result.tiedA).toHaveLength(1);
    expect(result.tiedB).toHaveLength(1);
    expect(result.tiedA[0].deltaPercent).toBeNull();
  });
});
