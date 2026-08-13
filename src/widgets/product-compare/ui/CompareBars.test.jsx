import { render, screen, within } from "@testing-library/react";
import { buildCompareBars } from "entities/product-compare";
import { assignSeriesColors } from "features/product-compare";
import { getTranslator } from "shared/i18n";
import { CompareBars } from "./CompareBars";

const t = getTranslator("en");

/** B wins every numeric attribute except price and weight, where A wins — a realistic mixed split. */
const PRODUCT_A = {
  id: "a",
  title: "Product A",
  screenInch: 6.1,
  refreshHz: 60,
  storageGb: 128,
  ramGb: 6,
  batteryMah: 3500,
  priceValue: 150000,
  weightGrams: 170,
  releaseYear: 2023,
  warrantyMonths: 12,
};
const PRODUCT_B = {
  id: "b",
  title: "Product B",
  screenInch: 6.9,
  refreshHz: 120,
  storageGb: 512,
  ramGb: 12,
  batteryMah: 5000,
  priceValue: 400000,
  weightGrams: 220,
  releaseYear: 2025,
  warrantyMonths: 24,
};

const renderBars = (products) => {
  const bars = buildCompareBars(products, t);
  const seriesColors = assignSeriesColors(products, {});
  const view = render(
    <CompareBars t={t} bars={bars} products={products} seriesColors={seriesColors} />,
  );
  return { ...view, bars };
};

const panel = (labelKey) => screen.getByRole("group", { name: t(labelKey) });

/**
 * A lane's value cell, reached through the screen-reader name that is the only thing naming it
 * — which is exactly the fact these tests are here to keep true.
 */
const lane = (labelKey, title) =>
  within(panel(labelKey)).getByText(new RegExp(`^${title}:`)).parentElement;

describe("CompareBars", () => {
  test("renders nothing when there is no bar data", () => {
    const { container } = render(
      <CompareBars t={t} bars={[]} products={[PRODUCT_A, PRODUCT_B]} seriesColors={{}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders one panel per numeric attribute, each labelled by its own attribute", () => {
    const { bars } = renderBars([PRODUCT_A, PRODUCT_B]);
    bars.forEach((row) => {
      expect(panel(row.labelKey)).toBeInTheDocument();
    });
  });

  test("states the leader's margin once per panel, on the panel and not on a lane", () => {
    renderBars([PRODUCT_A, PRODUCT_B]);
    // storage: B (512 GB) leads A (128 GB) by 300%.
    expect(within(panel("comparePage.attr.storage")).getByText("300%")).toBeInTheDocument();
    // price: A (150,000) leads B (400,000) by 63% — a different panel, a different leader.
    expect(within(panel("comparePage.attr.price")).getByText("63%")).toBeInTheDocument();
  });

  /**
   * The defect the old layout shipped: a truncated copy of every product's name inside every
   * attribute. The names belong to the legend now, and a lane carries the number instead.
   */
  test("prints each full product name once, in the legend", () => {
    renderBars([PRODUCT_A, PRODUCT_B]);
    const legend = screen.getByRole("list", { name: t("comparePage.bars.legendAria") });

    expect(within(legend).getByText("Product A")).toBeInTheDocument();
    expect(within(legend).getByText("Product B")).toBeInTheDocument();
    expect(within(legend).getAllByRole("listitem")).toHaveLength(2);
  });

  /** Colour identifies a lane on screen; this is what carries the same fact to a screen reader. */
  test("every lane names its product and prints its raw value", () => {
    renderBars([PRODUCT_A, PRODUCT_B]);

    expect(lane("comparePage.attr.ram", "Product A")).toHaveTextContent("Product A: 6 GB");
    expect(lane("comparePage.attr.ram", "Product B")).toHaveTextContent("Product B: 12 GB");
  });

  test("marks the winning lane for a reader who cannot see which bar is longest", () => {
    renderBars([PRODUCT_A, PRODUCT_B]);

    expect(lane("comparePage.attr.storage", "Product B")).toHaveTextContent(
      t("comparePage.bestValue"),
    );
    expect(lane("comparePage.attr.storage", "Product A")).not.toHaveTextContent(
      t("comparePage.bestValue"),
    );
  });

  /**
   * A panel where every product carries the same number has no leader and no loser, and the
   * old layout drew four identical full-width bars with nothing to say why.
   */
  test("says so when an attribute is identical across the comparison", () => {
    renderBars([PRODUCT_A, { ...PRODUCT_B, id: "b", ramGb: 6 }]);
    expect(
      within(panel("comparePage.attr.ram")).getByText(t("comparePage.bars.tie")),
    ).toBeInTheDocument();
    expect(lane("comparePage.attr.ram", "Product A")).not.toHaveTextContent(
      t("comparePage.bestValue"),
    );
  });

  /**
   * The bar and the number beside it come from the same raw value and must never disagree —
   * and the lanes stay in the products' own order, which is what makes the legend's numbers
   * readable as a key rather than as decoration.
   */
  test("draws the leader at full width and everyone else in proportion to their own value", () => {
    renderBars([PRODUCT_A, PRODUCT_B]);
    const fills = panel("comparePage.attr.storage").querySelectorAll(".compare-bars__fill");

    expect(fills).toHaveLength(2);
    // A holds 128 GB against B's 512 — a quarter of the leader's bar, and the leader is full.
    expect(fills[0].style.width).toBe("25%");
    expect(fills[1].style.width).toBe("100%");
  });
});
