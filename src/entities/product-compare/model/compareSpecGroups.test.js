import { PRODUCT_CATALOG, buildSpecsForProduct } from "entities/product";
import { COMPARE_SPEC_GROUPS, specGroupIdForLabelKey } from "./compareSpecGroups";

const GROUP_IDS = COMPARE_SPEC_GROUPS.map((group) => group.id);
const FALLBACK_ID = GROUP_IDS[GROUP_IDS.length - 1];

describe("compareSpecGroups", () => {
  test("every group has a unique id and a heading key", () => {
    expect(new Set(GROUP_IDS).size).toBe(GROUP_IDS.length);
    COMPARE_SPEC_GROUPS.forEach((group) => {
      expect(group.labelKey).toMatch(/^comparePage\.sections\./);
      expect(group.labelKeys.length).toBeGreaterThan(0);
    });
  });

  /** A spec filed under two headings would appear twice in the table, or in neither. */
  test("no spec label key belongs to two groups", () => {
    const all = COMPARE_SPEC_GROUPS.flatMap((group) => group.labelKeys);
    expect(new Set(all).size).toBe(all.length);
  });

  /**
   * The contract that matters: grouping may decide *where* a row goes, never whether it exists.
   * A spec key added to `productSpecs.js` tomorrow has to land somewhere rather than being
   * dropped by a lookup that has not heard of it.
   */
  test("every spec the catalog can emit resolves to a real group", () => {
    const emitted = new Set(
      PRODUCT_CATALOG.flatMap((product) => {
        const { brief, extended } = buildSpecsForProduct(product);
        return [...brief, ...extended].map((row) => row.labelKey);
      }),
    );

    expect(emitted.size).toBeGreaterThan(5);
    emitted.forEach((labelKey) => {
      expect(GROUP_IDS, `unmapped: ${labelKey}`).toContain(specGroupIdForLabelKey(labelKey));
    });
  });

  test("an unknown key falls into the trailing group rather than disappearing", () => {
    expect(specGroupIdForLabelKey("productDetail.specsExtended.somethingNew")).toBe(FALLBACK_ID);
    expect(specGroupIdForLabelKey("")).toBe(FALLBACK_ID);
  });

  /**
   * `specsExtended.technology` is the one label whose meaning changes with the category — a
   * laptop reports "14.2″ Retina/OLED", a camera "f/1.4 aperture". Filing it under "Display"
   * would be right for one category and a lie for the other, so it stays in the catch-all.
   */
  test("the category-dependent 'technology' label is not filed under a specific group", () => {
    expect(specGroupIdForLabelKey("productDetail.specsExtended.technology")).toBe(FALLBACK_ID);
  });
});
