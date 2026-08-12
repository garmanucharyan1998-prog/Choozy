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
});
