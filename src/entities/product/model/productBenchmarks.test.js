import { PRODUCT_CATALOG } from "./productCatalog";
import { benchmarksForProduct, hasBenchmarks } from "./productBenchmarks";

const byCategory = (categoryId) => PRODUCT_CATALOG.filter((p) => p.categoryId === categoryId);

describe("productBenchmarks", () => {
  /**
   * The point of deriving rather than hand-authoring: the same product always reports the same
   * numbers, so a screenshot, a test and a rendered page cannot disagree.
   */
  test("scores are stable for a given product", () => {
    const phone = byCategory("smartphones")[0];
    expect(benchmarksForProduct(phone)).toEqual(benchmarksForProduct(phone));
  });

  test("two different products do not tie", () => {
    const [a, b] = byCategory("smartphones");
    expect(benchmarksForProduct(a).antutu).not.toBe(benchmarksForProduct(b).antutu);
  });

  /**
   * A benchmark that does not run on a device must report nothing rather than a number. A
   * fabricated AnTuTu score for a monitor would be worse than a missing row, and the compare
   * table already renders a placeholder for a value a product does not have.
   */
  test("only categories the benchmark runs on get a score", () => {
    const phone = byCategory("smartphones")[0];
    expect(benchmarksForProduct(phone).antutu).toBeGreaterThan(0);
    expect(benchmarksForProduct(phone).geekbenchSingle).toBeGreaterThan(0);

    /** AnTuTu is mobile; a laptop carries Geekbench alone. */
    const laptop = byCategory("laptops")[0];
    expect(benchmarksForProduct(laptop).antutu).toBeNull();
    expect(benchmarksForProduct(laptop).geekbenchMulti).toBeGreaterThan(0);

    ["monitors", "headphones", "cameras", "speakers", "accessories", "tv"].forEach((categoryId) => {
      byCategory(categoryId).forEach((product) => {
        expect(benchmarksForProduct(product)).toEqual({
          antutu: null,
          geekbenchSingle: null,
          geekbenchMulti: null,
        });
        expect(hasBenchmarks(product)).toBe(false);
      });
    });
  });

  test("multi-core always outscores single-core", () => {
    PRODUCT_CATALOG.filter(hasBenchmarks).forEach((product) => {
      const { geekbenchSingle, geekbenchMulti } = benchmarksForProduct(product);
      expect(geekbenchMulti).toBeGreaterThan(geekbenchSingle);
    });
  });

  /**
   * The scores have to stay inside bands a reader would recognise, or they stop reading as
   * benchmark numbers at all — which is the only thing that makes a derived figure defensible.
   */
  test("every score lands in a believable range", () => {
    PRODUCT_CATALOG.filter(hasBenchmarks).forEach((product) => {
      const { antutu, geekbenchSingle, geekbenchMulti } = benchmarksForProduct(product);
      if (antutu !== null) {
        expect(antutu).toBeGreaterThan(400_000);
        expect(antutu).toBeLessThan(3_000_000);
      }
      expect(geekbenchSingle).toBeGreaterThan(800);
      expect(geekbenchSingle).toBeLessThan(4_000);
      expect(geekbenchMulti).toBeGreaterThan(2_000);
      expect(geekbenchMulti).toBeLessThan(30_000);
    });
  });

  /** Derived from the facts the catalog states, so the ordering is at least self-consistent. */
  test("a newer generation of the same brand and RAM scores higher", () => {
    const older = { id: "x", categoryId: "smartphones", brandId: "samsung", ramGb: 8, releaseYear: 2021 };
    const newer = { ...older, releaseYear: 2025 };
    expect(benchmarksForProduct(newer).antutu).toBeGreaterThan(benchmarksForProduct(older).antutu);
  });

  test("more RAM scores higher, all else equal", () => {
    const small = { id: "y", categoryId: "laptops", brandId: "asus", ramGb: 8, releaseYear: 2024 };
    const large = { ...small, ramGb: 32 };
    expect(benchmarksForProduct(large).geekbenchMulti).toBeGreaterThan(
      benchmarksForProduct(small).geekbenchMulti,
    );
  });

  test("a missing or malformed product is not a crash", () => {
    expect(benchmarksForProduct(null)).toEqual({
      antutu: null,
      geekbenchSingle: null,
      geekbenchMulti: null,
    });
    expect(hasBenchmarks(undefined)).toBe(false);
  });
});
