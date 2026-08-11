import { PRODUCT_CATALOG } from "entities/product";
import {
  COMPARE_REJECTION,
  MAX_COMPARE_ITEMS,
  addToCompare,
  compareCategoryId,
  getCompareProducts,
  normalizeCompareIds,
  parseCompareIds,
  removeFromCompare,
  serializeCompareIds,
  toggleCompare,
} from "./compareSelection";

const inCategory = (categoryId) => PRODUCT_CATALOG.filter((p) => p.categoryId === categoryId);

/** Laptops is the only category with more than `MAX_COMPARE_ITEMS` products to overflow with. */
const LAPTOPS = inCategory("laptops").map((p) => p.id);
const [PHONE] = inCategory("smartphones").map((p) => p.id);

describe("normalizeCompareIds", () => {
  test("keeps a legal selection exactly as given", () => {
    const ids = LAPTOPS.slice(0, 3);
    expect(normalizeCompareIds(ids)).toEqual(ids);
  });

  test("drops ids that match no product", () => {
    expect(normalizeCompareIds([LAPTOPS[0], "fp-9999", "", "  "])).toEqual([LAPTOPS[0]]);
  });

  test("drops duplicates, keeping the first position", () => {
    expect(normalizeCompareIds([LAPTOPS[0], LAPTOPS[1], LAPTOPS[0]])).toEqual([
      LAPTOPS[0],
      LAPTOPS[1],
    ]);
  });

  /** The whole reason the constraint exists: spec rows differ per category. */
  test("drops anything from a category other than the first survivor's", () => {
    expect(normalizeCompareIds([LAPTOPS[0], PHONE, LAPTOPS[1]])).toEqual([LAPTOPS[0], LAPTOPS[1]]);
  });

  test("truncates to the maximum column count", () => {
    expect(normalizeCompareIds(LAPTOPS)).toHaveLength(MAX_COMPARE_ITEMS);
  });

  test("survives a non-array", () => {
    expect(normalizeCompareIds(null)).toEqual([]);
    expect(normalizeCompareIds("fp-1")).toEqual([]);
  });
});

describe("parseCompareIds / serializeCompareIds", () => {
  test("round-trips a selection through the string form the URL and storage share", () => {
    const ids = LAPTOPS.slice(0, 3);
    expect(parseCompareIds(serializeCompareIds(ids))).toEqual(ids);
  });

  test("an empty selection serializes to an empty string, not to a stray comma", () => {
    expect(serializeCompareIds([])).toBe("");
    expect(parseCompareIds("")).toEqual([]);
    expect(parseCompareIds(null)).toEqual([]);
  });

  /** A hand-typed or stale URL must not be able to produce an illegal table. */
  test("a hostile query string is filtered down to what is legal", () => {
    const raw = `${LAPTOPS[0]},${PHONE},fp-9999,${LAPTOPS[0]},${LAPTOPS.join(",")}`;
    const parsed = parseCompareIds(raw);

    expect(parsed).toHaveLength(MAX_COMPARE_ITEMS);
    expect(parsed).not.toContain(PHONE);
    expect(new Set(parsed).size).toBe(parsed.length);
  });
});

describe("addToCompare", () => {
  test("appends to the end, so the columns stay in the order they were built", () => {
    const { ids, rejected } = addToCompare([LAPTOPS[0]], LAPTOPS[1]);
    expect(ids).toEqual([LAPTOPS[0], LAPTOPS[1]]);
    expect(rejected).toBeNull();
  });

  test("adding something already present changes nothing and is not a rejection", () => {
    const { ids, rejected } = addToCompare([LAPTOPS[0]], LAPTOPS[0]);
    expect(ids).toEqual([LAPTOPS[0]]);
    expect(rejected).toBeNull();
  });

  test("a product from another category is refused with a reason", () => {
    const { ids, rejected } = addToCompare([LAPTOPS[0]], PHONE);
    expect(ids).toEqual([LAPTOPS[0]]);
    expect(rejected).toBe(COMPARE_REJECTION.CATEGORY);
  });

  test("a full selection refuses with the limit reason", () => {
    const full = LAPTOPS.slice(0, MAX_COMPARE_ITEMS);
    const { ids, rejected } = addToCompare(full, LAPTOPS[MAX_COMPARE_ITEMS]);
    expect(ids).toEqual(full);
    expect(rejected).toBe(COMPARE_REJECTION.LIMIT);
  });

  /**
   * Told "the list is full" a visitor removes a column and tries again — and is refused a
   * second time, because the real problem was the category. The category answer comes first.
   */
  test("a full selection plus a foreign category reports the category, not the limit", () => {
    const full = LAPTOPS.slice(0, MAX_COMPARE_ITEMS);
    expect(addToCompare(full, PHONE).rejected).toBe(COMPARE_REJECTION.CATEGORY);
  });

  test("an unknown id is a no-op with nothing to explain", () => {
    expect(addToCompare([LAPTOPS[0]], "fp-9999")).toEqual({ ids: [LAPTOPS[0]], rejected: null });
  });
});

describe("removeFromCompare / toggleCompare", () => {
  test("removing the only item empties the selection and frees the category", () => {
    const ids = removeFromCompare([LAPTOPS[0]], LAPTOPS[0]);
    expect(ids).toEqual([]);
    expect(compareCategoryId(ids)).toBeNull();
    expect(addToCompare(ids, PHONE).rejected).toBeNull();
  });

  test("toggle adds what is absent and removes what is present", () => {
    const added = toggleCompare([], LAPTOPS[0]);
    expect(added).toEqual({ ids: [LAPTOPS[0]], rejected: null });
    expect(toggleCompare(added.ids, LAPTOPS[0])).toEqual({ ids: [], rejected: null });
  });

  test("toggling a foreign category off a non-empty list still reports the rejection", () => {
    expect(toggleCompare([LAPTOPS[0]], PHONE).rejected).toBe(COMPARE_REJECTION.CATEGORY);
  });
});

describe("compareCategoryId / getCompareProducts", () => {
  test("the category is the first survivor's, not the first argument's", () => {
    expect(compareCategoryId(["fp-9999", LAPTOPS[0]])).toBe("laptops");
    expect(compareCategoryId([])).toBeNull();
  });

  test("products come back in selection order, never as holes", () => {
    const products = getCompareProducts([LAPTOPS[1], "fp-9999", LAPTOPS[0]]);
    expect(products.map((p) => p.id)).toEqual([LAPTOPS[1], LAPTOPS[0]]);
    products.forEach((product) => expect(product).toBeTruthy());
  });
});
