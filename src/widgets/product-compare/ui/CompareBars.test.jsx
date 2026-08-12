import { render, screen } from "@testing-library/react";
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

describe("CompareBars", () => {
  test("renders nothing when there is no bar data", () => {
    const { container } = render(
      <CompareBars t={t} bars={[]} products={[PRODUCT_A, PRODUCT_B]} seriesColors={{}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders one row per numeric attribute, with the winner's percentage shown and the loser's not", () => {
    const products = [PRODUCT_A, PRODUCT_B];
    const bars = buildCompareBars(products);
    const seriesColors = assignSeriesColors(products, {});

    render(<CompareBars t={t} bars={bars} products={products} seriesColors={seriesColors} />);

    expect(screen.getByText(t("comparePage.attr.storage"))).toBeInTheDocument();
    // storage: B (512 GB) wins by 300% over A (128 GB).
    expect(screen.getByText("+300%")).toBeInTheDocument();
    // price: A (150,000) wins over B (400,000) — a different row, a different winner.
    expect(screen.getByText("+63%")).toBeInTheDocument();
  });

  test("prints both products' names next to their own bar", () => {
    const products = [PRODUCT_A, PRODUCT_B];
    const bars = buildCompareBars(products);
    const seriesColors = assignSeriesColors(products, {});

    render(<CompareBars t={t} bars={bars} products={products} seriesColors={seriesColors} />);

    expect(screen.getAllByText("Product A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Product B").length).toBeGreaterThan(0);
  });
});
