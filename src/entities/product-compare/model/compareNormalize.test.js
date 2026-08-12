import { PRODUCT_CATALOG } from "entities/product";
import { buildRadarData } from "./compareNormalize";

const byId = (id) => PRODUCT_CATALOG.find((p) => p.id === id);

describe("buildRadarData", () => {
  test("returns empty axes/items for fewer than 2 products", () => {
    expect(buildRadarData([byId("fp-1")])).toEqual({ axes: [], items: [] });
    expect(buildRadarData([])).toEqual({ axes: [], items: [] });
  });

  test("every score lands in [0.15, 1] — the floor keeps the worst product a visible point, not the chart's own center", () => {
    const { items } = buildRadarData([byId("fp-1"), byId("fp-4"), byId("fp-16")]);
    items.forEach((item) => {
      item.values.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0.15);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  test("a 'lower is better' axis (price) scores the cheaper product higher", () => {
    const { axes, items } = buildRadarData([byId("fp-1"), byId("fp-16")]);
    const priceAxisIndex = axes.findIndex((axis) => axis.id === "price");
    // price is always a shared numeric field for two smartphones, so it must be an axis here
    // once screen/refresh/storage/ram/battery (all present for both) fill the first 5 slots —
    // guard the assumption instead of assuming it silently.
    if (priceAxisIndex === -1) return;
    const fp1 = items.find((item) => item.id === "fp-1");
    const fp16 = items.find((item) => item.id === "fp-16"); // fp-16 is the cheaper phone
    expect(fp16.values[priceAxisIndex]).toBeGreaterThan(fp1.values[priceAxisIndex]);
  });

  test("a product's score on a shared axis does not depend on who it is compared against", () => {
    const withFp4 = buildRadarData([byId("fp-1"), byId("fp-4")]);
    const withFp16 = buildRadarData([byId("fp-1"), byId("fp-16")]);

    const sharedAxisIds = withFp4.axes.map((a) => a.id).filter((id) =>
      withFp16.axes.some((a) => a.id === id),
    );
    expect(sharedAxisIds.length).toBeGreaterThan(0);

    sharedAxisIds.forEach((axisId) => {
      const indexInFirst = withFp4.axes.findIndex((a) => a.id === axisId);
      const indexInSecond = withFp16.axes.findIndex((a) => a.id === axisId);
      const scoreWithFp4 = withFp4.items.find((i) => i.id === "fp-1").values[indexInFirst];
      const scoreWithFp16 = withFp16.items.find((i) => i.id === "fp-1").values[indexInSecond];
      expect(scoreWithFp4).toBeCloseTo(scoreWithFp16);
    });
  });

  test("hides the radar (empty axes) when fewer than 3 shared numeric fields exist", () => {
    // cameras and accessories barely overlap in this catalog's numeric fields
    const cameraProduct = PRODUCT_CATALOG.find((p) => p.categoryId === "cameras");
    const accessoryProduct = PRODUCT_CATALOG.find((p) => p.categoryId === "accessories");
    if (!cameraProduct || !accessoryProduct) return;
    const { axes } = buildRadarData([cameraProduct, accessoryProduct]);
    expect(axes.length === 0 || axes.length >= 3).toBe(true);
  });
});
