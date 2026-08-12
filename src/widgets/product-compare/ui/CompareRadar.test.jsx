import { fireEvent, render, screen, within } from "@testing-library/react";
import { assignSeriesColors } from "features/product-compare";
import { getTranslator } from "shared/i18n";
import { CompareRadar, MAX_RADAR_OVERLAYS } from "./CompareRadar";

const t = getTranslator("en");

const AXES = [
  { id: "screen", labelKey: "comparePage.attr.screen" },
  { id: "refresh", labelKey: "comparePage.attr.refresh" },
  { id: "storage", labelKey: "comparePage.attr.storage" },
  { id: "ram", labelKey: "comparePage.attr.ram" },
  { id: "battery", labelKey: "comparePage.attr.battery" },
];

const productsOf = (count) =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    title: `Product ${index + 1}`,
  }));

const radarOf = (count, axes = AXES) => ({
  axes,
  items: productsOf(count).map((product, index) => ({
    id: product.id,
    values: axes.map((_, axisIndex) => 0.2 + ((index + axisIndex) % 4) * 0.2),
  })),
});

const renderRadar = (count, axes = AXES) => {
  const products = productsOf(count);
  return {
    products,
    ...render(
      <CompareRadar
        t={t}
        radar={radarOf(count, axes)}
        products={products}
        seriesColors={assignSeriesColors(products, {})}
      />,
    ),
  };
};

/** Grid rings are polygons too; the outlines are the ones carrying a fill colour. */
const outlinesIn = (container) =>
  [...container.querySelectorAll("polygon")].filter((node) => node.getAttribute("fill") !== "none");

describe("CompareRadar", () => {
  test("draws one outline per product when the selection fits under the cap", () => {
    const { container } = renderRadar(2);
    expect(outlinesIn(container)).toHaveLength(2);
    expect(screen.getByText(t("comparePage.radar.heading"))).toBeInTheDocument();
  });

  /** Normalized scores are meaningless without saying what they are relative to. */
  test("always states what the scores are relative to", () => {
    renderRadar(2);
    expect(screen.getByText(t("comparePage.radar.scaleNote"))).toBeInTheDocument();
  });

  test("caps the outlines at three even with four products selected", () => {
    const { container } = renderRadar(4);
    expect(outlinesIn(container)).toHaveLength(MAX_RADAR_OVERLAYS);
    expect(screen.getByText(t("comparePage.radar.capNote"))).toBeInTheDocument();
  });

  test("does not explain a cap that is not in force", () => {
    renderRadar(3);
    expect(screen.queryByText(t("comparePage.radar.capNote"))).not.toBeInTheDocument();
  });

  /** With two products the floor and the ceiling meet, so a toggle could never do anything. */
  test("offers no toggles when toggling could not change anything, but still names both", () => {
    renderRadar(2);
    const legend = within(screen.getByRole("group", { name: t("comparePage.radar.legendAria") }));

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(legend.getByText("Product 1")).toBeInTheDocument();
    expect(legend.getByText("Product 2")).toBeInTheDocument();
  });

  test("a chip reports whether its outline is currently drawn", () => {
    renderRadar(4);
    expect(screen.getByRole("button", { name: /Product 1/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Product 4/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("turning a chip off removes its outline", () => {
    const { container } = renderRadar(3);
    expect(outlinesIn(container)).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: /Product 2/ }));

    expect(outlinesIn(container)).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Product 2/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  /** One outline is a profile, not a comparison — the second-to-last chip has to hold. */
  test("refuses to drop below two outlines", () => {
    const { container } = renderRadar(3);
    fireEvent.click(screen.getByRole("button", { name: /Product 2/ }));
    fireEvent.click(screen.getByRole("button", { name: /Product 3/ }));

    expect(outlinesIn(container)).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Product 3/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  /** At the cap a click has to do something — a chip that silently ignores you reads as broken. */
  test("choosing a fourth product retires the longest-shown one", () => {
    const { container } = renderRadar(4);

    fireEvent.click(screen.getByRole("button", { name: /Product 4/ }));

    expect(outlinesIn(container)).toHaveLength(MAX_RADAR_OVERLAYS);
    expect(screen.getByRole("button", { name: /Product 4/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Product 1/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: /Product 2/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("hides the whole section when too few attributes are shared to make a shape", () => {
    const { container } = renderRadar(2, AXES.slice(0, 2));
    expect(container).toBeEmptyDOMElement();
  });

  test("hides the whole section when there is nothing to compare against", () => {
    const { container } = renderRadar(1);
    expect(container).toBeEmptyDOMElement();
  });

  test("survives a presenter that has no radar data yet", () => {
    const { container } = render(
      <CompareRadar t={t} radar={undefined} products={[]} seriesColors={{}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
