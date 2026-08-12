import { assignSeriesColors, COMPARE_SERIES_COLORS } from "./compareSeriesColors";

const p = (id) => ({ id });

describe("assignSeriesColors", () => {
  test("assigns distinct palette colours in product order on the first call", () => {
    const result = assignSeriesColors([p("a"), p("b"), p("c"), p("d")], {});
    expect(result).toEqual({
      a: COMPARE_SERIES_COLORS[0],
      b: COMPARE_SERIES_COLORS[1],
      c: COMPARE_SERIES_COLORS[2],
      d: COMPARE_SERIES_COLORS[3],
    });
  });

  test("a survivor keeps its colour after another product is removed", () => {
    const first = assignSeriesColors([p("a"), p("b"), p("c"), p("d")], {});
    const second = assignSeriesColors([p("a"), p("c"), p("d")], first);
    expect(second.a).toBe(first.a);
    expect(second.c).toBe(first.c);
    expect(second.d).toBe(first.d);
  });

  test("a new entrant reuses the colour freed by whoever was removed", () => {
    const first = assignSeriesColors([p("a"), p("b"), p("c"), p("d")], {});
    const second = assignSeriesColors([p("a"), p("c"), p("d")], first);
    const third = assignSeriesColors([p("a"), p("c"), p("d"), p("e")], second);
    expect(third.e).toBe(first.b);
    expect(third.a).toBe(first.a);
    expect(third.c).toBe(first.c);
    expect(third.d).toBe(first.d);
  });

  test("is a pure function: the same inputs produce the same output", () => {
    const products = [p("a"), p("b")];
    expect(assignSeriesColors(products, {})).toEqual(assignSeriesColors(products, {}));
  });
});
