import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { LanguageProvider } from "contexts";
import ProductCompareWidget from "./ProductCompareWidget";

/** Two real smartphones from `entities/product/model/catalog/smartphones.js` — same category, so the widget's own scope check doesn't reject the pair. */
const FIXED_IDS = ["fp-1", "fp-4"];

const renderWidget = (fixedIds = FIXED_IDS) => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <LanguageProvider>
          <ProductCompareWidget fixedIds={fixedIds} />
        </LanguageProvider>
      ),
    },
  ]);
  return render(<Stub initialEntries={["/"]} />);
};

describe("ProductCompareWidget", () => {
  test("renders each product's photo through the 1:1 compare image variant, never a raw crop", () => {
    const { container } = renderWidget();

    const frames = container.querySelectorAll(".product-card-image--compare");
    expect(frames.length).toBe(FIXED_IDS.length);
    expect(container.querySelectorAll('img[class*="object-cover"]').length).toBe(0);
  });

  test("section headers render as written in the dictionary, not forced to uppercase", () => {
    renderWidget();

    const sectionHeaders = screen.getAllByRole("columnheader").filter((th) => th.scope === "colgroup");
    expect(sectionHeaders.length).toBeGreaterThan(0);
    sectionHeaders.forEach((th) => {
      expect(th.className).not.toMatch(/\buppercase\b/);
    });
  });

  /** `/compare/<a>-vs-<b>` is one indexable address for one specific pair — editing it in place would leave the URL lying, so it hands off to `/compare?ids=…` instead (see useComparePresenter). */
  test("a fixed pair offers no per-column remove control", () => {
    renderWidget();

    expect(screen.queryAllByRole("button", { name: /remove|հեռացնել|удалить/i })).toHaveLength(0);
  });

  /**
   * fp-4 (Samsung Galaxy S25 Ultra) has more storage than fp-1 (iPhone 17 Pro Max, 256 GB vs
   * 512 GB) — a row with a real numeric winner, unlike screen size or RAM, which tie between
   * these two and must show no winner at all.
   */
  test("marks the higher-storage column's cell as best, with a visible and an accessible cue", () => {
    const { container } = renderWidget();
    const cells = [...container.querySelectorAll("td")];

    const bestCell = cells.find((cell) => cell.textContent.includes("512"));
    const otherCell = cells.find((cell) => cell.textContent.includes("256"));
    expect(bestCell).toBeTruthy();
    expect(otherCell).toBeTruthy();

    expect(bestCell.className).toMatch(/bg-emerald-50/);
    expect(otherCell.className).not.toMatch(/bg-emerald-50/);
    // an accessible cue beyond colour: the checkmark icon and the sr-only "best value" text
    expect(bestCell.querySelector("svg")).toBeTruthy();
    expect(bestCell.querySelector(".sr-only")?.textContent).toBeTruthy();
  });

  /**
   * `sr-only` is `position: absolute`, and an absolutely positioned element anchors to its
   * nearest *positioned* ancestor — `overflow-x: auto` clips but does not position. Without
   * `relative` here the winner cells' sr-only text escaped the scroller, anchored to the document
   * at the column's scrolled-out x, and gave the whole page 55px of horizontal scroll at 360px.
   * jsdom does no layout, so the class contract is what can be asserted; the measurement that
   * caught it lives in the responsive audit.
   */
  test("the horizontal scroller is positioned, so sr-only text cannot escape it", () => {
    const { container } = renderWidget();
    const scroller = container.querySelector('[class*="overflow-x-auto"]');

    expect(scroller).toBeTruthy();
    expect(scroller.className).toMatch(/\brelative\b/);
    expect(container.querySelectorAll(".sr-only").length).toBeGreaterThan(0);
  });

  /**
   * A `min-width` larger than the declared column widths is redistributed across them under
   * `table-fixed`, which on a two-product pair page inflated every column until only one product
   * fitted on a 360px screen.
   */
  test("the table declares no min-width that could inflate its columns", () => {
    const { container } = renderWidget();
    const table = container.querySelector("table");

    expect(table.className).toMatch(/\btable-fixed\b/);
    expect(table.className).not.toMatch(/min-w-\[/);
  });

  test("a tied spec (screen size, identical on both phones) marks no cell as best", () => {
    const { container } = renderWidget();
    const screenCells = [...container.querySelectorAll("td")].filter((cell) =>
      cell.textContent.includes("6.9"),
    );
    expect(screenCells.length).toBeGreaterThan(0);
    screenCells.forEach((cell) => expect(cell.className).not.toMatch(/bg-emerald-50/));
  });
});
