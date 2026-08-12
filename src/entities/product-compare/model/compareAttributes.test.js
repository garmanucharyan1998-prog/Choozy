import { COMPARE_ATTRIBUTES, COMPARE_ATTRIBUTE_BY_KEY, pickRadarAxes } from "./compareAttributes";

const phone = (overrides) => ({
  categoryId: "smartphones",
  screenInch: 6.9,
  refreshHz: 120,
  storageGb: 256,
  ramGb: 12,
  batteryMah: 4832,
  priceValue: 739000,
  weightGrams: 233,
  releaseYear: 2025,
  warrantyMonths: 12,
  ...overrides,
});

const laptop = (overrides) => ({
  categoryId: "laptops",
  screenInch: 14.2,
  refreshHz: 120,
  storageGb: 512,
  ramGb: 16,
  priceValue: 1290000,
  weightGrams: 1600,
  releaseYear: 2025,
  warrantyMonths: 12,
  // laptops carry no batteryMah/batteryHours in this catalog
  ...overrides,
});

describe("COMPARE_ATTRIBUTES", () => {
  test("every attribute is reachable by key", () => {
    COMPARE_ATTRIBUTES.forEach((attr) => {
      expect(COMPARE_ATTRIBUTE_BY_KEY.get(attr.key)).toBe(attr);
    });
  });

  test("battery reads batteryMah for a phone and formats it as mAh", () => {
    const attr = COMPARE_ATTRIBUTE_BY_KEY.get("battery");
    const p = phone();
    expect(attr.getValue(p)).toBe(4832);
    expect(attr.formatValue(attr.getValue(p), p)).toBe("4832 mAh");
  });

  test("battery reads batteryHours for headphones and formats it as hours", () => {
    const attr = COMPARE_ATTRIBUTE_BY_KEY.get("battery");
    const headphones = { categoryId: "headphones", batteryHours: 30 };
    expect(attr.getValue(headphones)).toBe(30);
    expect(attr.formatValue(attr.getValue(headphones), headphones)).toBe("30 h");
  });

  test("a field the category never carries resolves to null, not 0 or undefined", () => {
    const attr = COMPARE_ATTRIBUTE_BY_KEY.get("ram");
    expect(attr.getValue({ categoryId: "cameras" })).toBeNull();
  });

  test("price and weight are the only 'lower is better' attributes", () => {
    const lowerKeys = COMPARE_ATTRIBUTES.filter((attr) => attr.direction === "lower").map(
      (attr) => attr.key,
    );
    expect(lowerKeys.sort()).toEqual(["price", "weight"]);
  });
});

describe("pickRadarAxes", () => {
  test("returns [] for fewer than 2 products", () => {
    expect(pickRadarAxes([phone()])).toEqual([]);
    expect(pickRadarAxes([])).toEqual([]);
  });

  test("picks the first 5 attributes every product has a value for, in COMPARE_ATTRIBUTES order", () => {
    const axes = pickRadarAxes([phone(), phone({ priceValue: 600000 })]);
    expect(axes.map((attr) => attr.key)).toEqual(["screen", "refresh", "storage", "ram", "battery"]);
  });

  test("drops an attribute at least one product has no value for — laptops have no battery", () => {
    const axes = pickRadarAxes([laptop(), laptop({ priceValue: 900000 })]);
    expect(axes.map((attr) => attr.key)).not.toContain("battery");
    // screen, refresh, storage, ram, price, weight, year, warranty are all present —
    // still exactly the first 5 in COMPARE_ATTRIBUTES order.
    expect(axes.map((attr) => attr.key)).toEqual(["screen", "refresh", "storage", "ram", "price"]);
  });

  test("mixing a phone and a laptop leaves only what both categories share", () => {
    const axes = pickRadarAxes([phone(), laptop()]);
    expect(axes.map((attr) => attr.key)).not.toContain("battery");
    expect(axes.length).toBeGreaterThanOrEqual(3);
  });

  test("hides the radar (returns fewer than 3) when too few shared numeric fields exist", () => {
    const bareA = { categoryId: "accessories", priceValue: 10000 };
    const bareB = { categoryId: "accessories", priceValue: 15000 };
    expect(pickRadarAxes([bareA, bareB]).length).toBeLessThan(3);
  });
});
