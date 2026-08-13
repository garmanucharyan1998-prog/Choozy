import { render, screen, within } from "@testing-library/react";
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

  /**
   * A margin has to name what it was measured against. "(+300%)" on a card about one product
   * states a number whose other half is nowhere on screen — the reader cannot tell whether it
   * beats the next product, the average, or the catalog.
   */
  test("prints every winning margin next to the value it was measured against", () => {
    const products = [PRODUCT_A, PRODUCT_B];
    const advantages = buildCompareAdvantages(products, t);
    const seriesColors = assignSeriesColors(products, {});

    render(<CompareAdvantages t={t} products={products} advantages={advantages} seriesColors={seriesColors} />);

    // B wins storage by the widest margin of all — 512 GB against A's 128 GB.
    expect(screen.getByText(/300% better than 128 GB/)).toBeInTheDocument();
    // A wins price (150,000 against 400,000), and the baseline carries its currency.
    expect(screen.getByText(/63% better than 400,000 AMD/)).toBeInTheDocument();
  });

  /** The price fallback is a plain fact about one product, so there is no margin to explain. */
  test("states no margin for a product that won nothing", () => {
    const dominant = { ...PRODUCT_B, id: "dominant", title: "Dominant" };
    const dominated = {
      ...PRODUCT_A,
      id: "dominated",
      title: "Dominated",
      /** Worse than `dominant` on every attribute, including the two where lower wins. */
      priceValue: 900000,
      weightGrams: 300,
    };
    const products = [dominant, dominated];
    const advantages = buildCompareAdvantages(products, t);

    render(
      <CompareAdvantages
        t={t}
        products={products}
        advantages={advantages}
        seriesColors={assignSeriesColors(products, {})}
      />,
    );

    const card = screen.getByRole("heading", { name: /Dominated/ }).closest("article");
    expect(within(card).getAllByRole("listitem")).toHaveLength(1);
    expect(within(card).queryByText(/better than/)).not.toBeInTheDocument();
  });
});
