import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { RadarChart } from "./RadarChart";

const AXES = [
  { id: "screen", label: "Screen" },
  { id: "refresh", label: "Refresh rate" },
  { id: "storage", label: "Storage" },
  { id: "ram", label: "RAM" },
  { id: "battery", label: "Battery" },
];

const ITEMS = [
  { id: "a", label: "Product A", color: "#2f4eb4", values: [0.2, 0.15, 0.3, 0.5, 0.4] },
  { id: "b", label: "Product B", color: "#d97706", values: [1, 1, 1, 0.6, 0.9] },
];

const svgOf = (container) => container.querySelector("svg");

describe("RadarChart", () => {
  test("draws one filled outline per item and one label per axis", () => {
    const { container } = render(<RadarChart axes={AXES} items={ITEMS} ariaLabel="chart" />);

    /** Grid rings are polygons too — the item outlines are the ones carrying a fill colour. */
    const outlines = [...container.querySelectorAll("polygon")].filter(
      (node) => node.getAttribute("fill") !== "none",
    );
    expect(outlines).toHaveLength(2);
    expect(outlines[0]).toHaveAttribute("fill", "#2f4eb4");
    expect(outlines[1]).toHaveAttribute("fill", "#d97706");

    expect(screen.getByText("Screen")).toBeInTheDocument();
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("Battery")).toBeInTheDocument();
  });

  test("exposes itself as a single labelled image rather than a pile of shapes", () => {
    render(<RadarChart axes={AXES} items={ITEMS} ariaLabel="Comparison chart" />);
    expect(screen.getByRole("img", { name: "Comparison chart" })).toBeInTheDocument();
  });

  /**
   * The whole reason this chart is hand-drawn instead of recharts: it has to be identical in the
   * server's HTML and on the client, or the compare pages ship a layout shift and the crawler
   * sees an empty box.
   */
  test("renders identically on the server twice over, with the data in the markup", () => {
    const first = renderToString(<RadarChart axes={AXES} items={ITEMS} ariaLabel="chart" />);
    const second = renderToString(<RadarChart axes={AXES} items={ITEMS} ariaLabel="chart" />);

    expect(first).toBe(second);
    expect(first).toContain("<svg");
    expect(first).toContain("#2f4eb4");
    expect(first).toContain("Screen");
    expect(first).not.toMatch(/NaN/);
  });

  test("scales with its container instead of a measured pixel size", () => {
    const { container } = render(<RadarChart axes={AXES} items={ITEMS} ariaLabel="chart" />);
    const svg = svgOf(container);

    expect(svg).toHaveAttribute("viewBox", "0 0 360 268");
    expect(svg.getAttribute("class")).toContain("w-full");
    expect(svg).not.toHaveAttribute("width");
  });

  test("wraps a long axis label onto a second line", () => {
    const { container } = render(<RadarChart axes={AXES} items={ITEMS} ariaLabel="chart" />);
    const refreshLabel = [...container.querySelectorAll("text")].find((node) =>
      node.textContent.startsWith("Refresh"),
    );

    expect(refreshLabel.querySelectorAll("tspan")).toHaveLength(2);
  });

  test("handles a three-axis comparison as well as a five-axis one", () => {
    const axes = AXES.slice(0, 3);
    const items = ITEMS.map((item) => ({ ...item, values: item.values.slice(0, 3) }));
    const { container } = render(<RadarChart axes={axes} items={items} ariaLabel="chart" />);

    const outlines = [...container.querySelectorAll("polygon")].filter(
      (node) => node.getAttribute("fill") !== "none",
    );
    expect(outlines[0].getAttribute("points").split(" ")).toHaveLength(3);
  });

  test("draws nothing when the shape would degenerate", () => {
    const twoAxes = render(
      <RadarChart axes={AXES.slice(0, 2)} items={ITEMS} ariaLabel="chart" />,
    );
    expect(twoAxes.container).toBeEmptyDOMElement();

    const noItems = render(<RadarChart axes={AXES} items={[]} ariaLabel="chart" />);
    expect(noItems.container).toBeEmptyDOMElement();
  });

  test("survives a caller that omits both props", () => {
    const { container } = render(<RadarChart ariaLabel="chart" />);
    expect(container).toBeEmptyDOMElement();
  });
});
