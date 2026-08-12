import { render, screen } from "@testing-library/react";
import { buildCompareAdvantages } from "entities/product-compare";
import { assignSeriesColors } from "features/product-compare";
import { getTranslator } from "shared/i18n";
import { CompareAdvantages } from "./CompareAdvantages";

const t = getTranslator("en");

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

describe("CompareAdvantages", () => {
  test("renders nothing when no product has any advantage", () => {
    const { container } = render(
      <CompareAdvantages t={t} products={[PRODUCT_A, PRODUCT_B]} advantages={{}} seriesColors={{}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("gives every compared product its own card, titled with its own name", () => {
    const products = [PRODUCT_A, PRODUCT_B];
    const advantages = buildCompareAdvantages(products);
    const seriesColors = assignSeriesColors(products, {});

    render(<CompareAdvantages t={t} products={products} advantages={advantages} seriesColors={seriesColors} />);

    expect(screen.getByRole("heading", { name: /Product A/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Product B/ })).toBeInTheDocument();
  });

  test("lists a product's real wins as bullets, each with its winning margin", () => {
    const products = [PRODUCT_A, PRODUCT_B];
    const advantages = buildCompareAdvantages(products);
    const seriesColors = assignSeriesColors(products, {});

    render(<CompareAdvantages t={t} products={products} advantages={advantages} seriesColors={seriesColors} />);

    // A wins price by a wide margin (150,000 vs 400,000) — its own strongest, most-relevant bullet.
    expect(screen.getByText(/\+63%/)).toBeInTheDocument();
    // B wins storage by the widest margin of all (512 GB vs 128 GB).
    expect(screen.getByText(/\+300%/)).toBeInTheDocument();
  });
});
