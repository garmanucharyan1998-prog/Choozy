import { getTranslator } from "shared/i18n";
import { buildCompareBars } from "./compareBarsModel";

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
  releaseYear: 2025,
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
  releaseYear: 2024,
  warrantyMonths: 12,
};

describe("buildCompareBars", () => {
  test("returns [] for fewer than 2 products", () => {
    expect(buildCompareBars([productA])).toEqual([]);
  });

  test("winner always draws at ratio 1, regardless of direction", () => {
    const bars = buildCompareBars([productA, productB]);
    const storage = bars.find((row) => row.key === "storage");
    const price = bars.find((row) => row.key === "price");

    // storage: higher is better, A (256) beats B (128)
    expect(storage.bars.find((b) => b.productId === "a").ratio).toBe(1);
    expect(storage.bars.find((b) => b.productId === "a").isWinner).toBe(true);
    expect(storage.bars.find((b) => b.productId === "b").ratio).toBeCloseTo(128 / 256);

    // price: lower is better, B (445000) beats A (739000)
    expect(price.bars.find((b) => b.productId === "b").ratio).toBe(1);
    expect(price.bars.find((b) => b.productId === "b").isWinner).toBe(true);
    expect(price.bars.find((b) => b.productId === "a").ratio).toBeCloseTo(445000 / 739000);
  });

  test("the raw value is always printed as text, independent of the bar width", () => {
    const bars = buildCompareBars([productA, productB]);
    const ram = bars.find((row) => row.key === "ram");
    expect(ram.bars.find((b) => b.productId === "a").formatted).toBe("12 GB");
    expect(ram.bars.find((b) => b.productId === "b").formatted).toBe("8 GB");
  });

  test("deltaPercent is set only on the winning cell", () => {
    const bars = buildCompareBars([productA, productB]);
    const battery = bars.find((row) => row.key === "battery");
    const winnerCell = battery.bars.find((b) => b.isWinner);
    const loserCell = battery.bars.find((b) => !b.isWinner);
    expect(winnerCell.deltaPercent).toBeGreaterThan(0);
    expect(loserCell.deltaPercent).toBeNull();
  });

  test("a tie has no deltaPercent, but nobody's bar looks shorter either", () => {
    const tiedA = { ...productA, ramGb: 12 };
    const tiedB = { ...productB, ramGb: 12 };
    const bars = buildCompareBars([tiedA, tiedB]);
    const ram = bars.find((row) => row.key === "ram");
    // both sides "win" a tie — the highlight is symmetric, not withheld
    expect(ram.bars.every((b) => b.isWinner)).toBe(true);
    expect(ram.bars.every((b) => b.deltaPercent === null)).toBe(true);
    // every cell draws full width when tied — nobody looks like they lost
    expect(ram.bars.every((b) => b.ratio === 1)).toBe(true);
  });

  test("an attribute missing from at least one product is dropped, not shown with a gap", () => {
    const laptopA = { ...productA, categoryId: "laptops", batteryMah: undefined };
    const laptopB = { ...productB, categoryId: "laptops", batteryMah: undefined };
    const bars = buildCompareBars([laptopA, laptopB]);
    expect(bars.find((row) => row.key === "battery")).toBeUndefined();
  });

  test("year is excluded — showBar is false for it", () => {
    const bars = buildCompareBars([productA, productB]);
    expect(bars.find((row) => row.key === "year")).toBeUndefined();
  });

  /**
   * `deltaPercent` is measured against the worst value in the row, and a percentage printed
   * without its base is unreadable — "+300%" more than what? The row carries the answer.
   */
  test("a row's margin comes with the value it was measured against", () => {
    const t = getTranslator("en");
    const bars = buildCompareBars([productA, productB], t);

    const storage = bars.find((row) => row.key === "storage");
    expect(storage.bars.find((bar) => bar.isWinner).deltaPercent).toBe(100);
    expect(storage.baselineFormatted).toBe("128 GB");

    /** On a "lower is better" row the baseline is the worst — here the *highest* price. */
    const price = bars.find((row) => row.key === "price");
    expect(price.baselineFormatted).toBe("739,000 AMD");
  });

  test("a tied row has no margin and so states no baseline", () => {
    const tiedA = { ...productA, ramGb: 12 };
    const tiedB = { ...productB, ramGb: 12 };
    const bars = buildCompareBars([tiedA, tiedB], getTranslator("en"));
    expect(bars.find((row) => row.key === "ram").baselineFormatted).toBeNull();
  });

  /** The UI draws an arrow from this: on a price row the longest bar is the smallest number. */
  test("every row states which end of its range wins", () => {
    const bars = buildCompareBars([productA, productB]);
    expect(bars.find((row) => row.key === "price").direction).toBe("lower");
    expect(bars.find((row) => row.key === "weight").direction).toBe("lower");
    expect(bars.find((row) => row.key === "storage").direction).toBe("higher");
  });
});

/**
 * The three attributes whose unit is a word rather than a symbol. Each shipped in English to
 * every reader — "739,000" with no currency at all beside a table row reading "739,000 դր.",
 * "12 mo", "30 h" — because `formatValue` had no translator to ask.
 */
describe("buildCompareBars unit words follow the locale", () => {
  const headphonesA = { id: "a", categoryId: "headphones", priceValue: 90000, batteryHours: 30 };
  const headphonesB = { id: "b", categoryId: "headphones", priceValue: 60000, batteryHours: 20 };

  test.each([
    ["am", "739,000 դր.", "12 ամիս", "30 ժամ"],
    ["en", "739,000 AMD", "12 months", "30 hours"],
    ["ru", "739,000 драм", "12 мес.", "30 ч"],
  ])("%s prints its own currency, months and hours", (language, price, warranty, hours) => {
    const t = getTranslator(language);

    const phoneBars = buildCompareBars([productA, productB], t);
    expect(phoneBars.find((row) => row.key === "price").bars[0].formatted).toBe(price);
    expect(phoneBars.find((row) => row.key === "warranty").bars[0].formatted).toBe(warranty);

    const headphoneBars = buildCompareBars([headphonesA, headphonesB], t);
    expect(headphoneBars.find((row) => row.key === "battery").bars[0].formatted).toBe(hours);
  });

  /** Unit *symbols* are the same glyphs everywhere and stay out of the dictionary. */
  test("symbols are not translated in any locale", () => {
    const bars = buildCompareBars([productA, productB], getTranslator("ru"));
    expect(bars.find((row) => row.key === "ram").bars[0].formatted).toBe("12 GB");
    expect(bars.find((row) => row.key === "battery").bars[0].formatted).toBe("4832 mAh");
    expect(bars.find((row) => row.key === "screen").bars[0].formatted).toBe("6.9″");
  });
});
