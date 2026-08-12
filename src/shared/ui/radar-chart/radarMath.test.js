import {
  axisAngle,
  clampUnit,
  labelLayout,
  polarToCartesian,
  polygonPoints,
  ringPoints,
  wrapLabel,
} from "./radarMath";

const CX = 180;
const CY = 126;
const R = 88;

describe("clampUnit", () => {
  test("keeps a normalized score untouched", () => {
    expect(clampUnit(0.42)).toBe(0.42);
  });

  test("pulls a value outside 0–1 back onto the grid", () => {
    expect(clampUnit(1.8)).toBe(1);
    expect(clampUnit(-0.5)).toBe(0);
  });

  test("treats a missing or non-finite score as the centre rather than throwing", () => {
    expect(clampUnit(undefined)).toBe(0);
    expect(clampUnit(Number.NaN)).toBe(0);
    expect(clampUnit(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("axisAngle", () => {
  test("puts the first axis straight up", () => {
    expect(axisAngle(0, 5)).toBeCloseTo(-Math.PI / 2, 10);
  });

  test("spaces the axes evenly and clockwise", () => {
    const step = axisAngle(1, 5) - axisAngle(0, 5);
    expect(step).toBeCloseTo((2 * Math.PI) / 5, 10);
    expect(axisAngle(3, 4) - axisAngle(2, 4)).toBeCloseTo(Math.PI / 2, 10);
  });
});

describe("polarToCartesian", () => {
  test("the first axis sits directly above the centre", () => {
    expect(polarToCartesian(CX, CY, R, 0, 5)).toEqual({ x: CX, y: CY - R });
  });

  test("a zero radius collapses onto the centre for every axis", () => {
    [0, 1, 2, 3, 4].forEach((index) => {
      expect(polarToCartesian(CX, CY, 0, index, 5)).toEqual({ x: CX, y: CY });
    });
  });

  test("four axes land on the compass points", () => {
    expect(polarToCartesian(CX, CY, R, 1, 4)).toEqual({ x: CX + R, y: CY });
    expect(polarToCartesian(CX, CY, R, 2, 4)).toEqual({ x: CX, y: CY + R });
    expect(polarToCartesian(CX, CY, R, 3, 4)).toEqual({ x: CX - R, y: CY });
  });
});

describe("polygonPoints", () => {
  test("emits one point per axis", () => {
    const points = polygonPoints([0.5, 0.5, 0.5, 0.5, 0.5], CX, CY, R, 5);
    expect(points.split(" ")).toHaveLength(5);
  });

  test("a full score reaches the outer ring and a zero score the centre", () => {
    expect(polygonPoints([1], CX, CY, R, 1)).toBe(`${CX},${CY - R}`);
    expect(polygonPoints([0], CX, CY, R, 1)).toBe(`${CX},${CY}`);
  });

  test("a score above 1 is clamped instead of drawing outside the grid", () => {
    expect(polygonPoints([4], CX, CY, R, 1)).toBe(polygonPoints([1], CX, CY, R, 1));
  });

  /** A short `values` array would otherwise emit "NaN,NaN" straight into the markup. */
  test("a missing score falls back to the centre rather than to NaN", () => {
    const points = polygonPoints([1, 1], CX, CY, R, 5);
    expect(points).not.toMatch(/NaN/);
    expect(points.split(" ")).toHaveLength(5);
  });

  test("ignores extra values beyond the axis count", () => {
    expect(polygonPoints([1, 1, 1], CX, CY, R, 1)).toBe(polygonPoints([1], CX, CY, R, 1));
  });
});

describe("ringPoints", () => {
  test("the outermost ring matches a full-score polygon", () => {
    expect(ringPoints(4, 4, CX, CY, R, 5)).toBe(polygonPoints([1, 1, 1, 1, 1], CX, CY, R, 5));
  });

  test("rings grow outward with their level", () => {
    const inner = ringPoints(1, 4, CX, CY, R, 5);
    const outer = ringPoints(4, 4, CX, CY, R, 5);
    const innerTopY = Number(inner.split(" ")[0].split(",")[1]);
    const outerTopY = Number(outer.split(" ")[0].split(",")[1]);
    expect(innerTopY).toBeGreaterThan(outerTopY);
  });
});

describe("labelLayout", () => {
  test("the top axis label is centred on its spoke", () => {
    const { anchor, vertical } = labelLayout(0, 5, CX, CY, R);
    expect(anchor).toBe("middle");
    expect(vertical).toBe("above");
  });

  /**
   * The pentagon's two upper-side spokes point only slightly upward; their labels have to sit
   * beside the spoke, not above it, or they lift off the axis they belong to.
   */
  test("side labels grow away from the chart and keep a centred baseline", () => {
    const right = labelLayout(1, 5, CX, CY, R);
    const left = labelLayout(4, 5, CX, CY, R);
    expect(right.anchor).toBe("start");
    expect(right.x).toBeGreaterThan(CX);
    expect(right.vertical).toBe("middle");
    expect(left.anchor).toBe("end");
    expect(left.x).toBeLessThan(CX);
    expect(left.vertical).toBe("middle");
  });

  test("the lower axes hang below their spokes", () => {
    expect(labelLayout(2, 5, CX, CY, R).vertical).toBe("below");
    expect(labelLayout(3, 5, CX, CY, R).vertical).toBe("below");
  });
});

describe("wrapLabel", () => {
  test("keeps a short label on one line", () => {
    expect(wrapLabel("Storage")).toEqual(["Storage"]);
  });

  test("splits a long two-word label", () => {
    expect(wrapLabel("Refresh rate")).toEqual(["Refresh", "rate"]);
  });

  /** Armenian attribute labels are single words; breaking one mid-word would be worse than overflow. */
  test("never breaks a single long word", () => {
    expect(wrapLabel("Aaaaaaaaaaaaaaaaaa")).toEqual(["Aaaaaaaaaaaaaaaaaa"]);
  });

  test("balances three words across two lines", () => {
    expect(wrapLabel("one two three")).toEqual(["one two", "three"]);
  });

  test("ignores an empty or non-string label", () => {
    expect(wrapLabel("")).toEqual([]);
    expect(wrapLabel("   ")).toEqual([]);
    expect(wrapLabel(undefined)).toEqual([]);
  });
});
