import { createRef } from "react";
import { vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { LanguageProvider } from "contexts";
import { getTranslator } from "shared/i18n";
import { CompareStickyHeader } from "./CompareStickyHeader";

const t = getTranslator("en");

const PRODUCTS = [
  { id: "a", title: "Product A", image: "", priceValue: 100000, href: "/a" },
  { id: "b", title: "Product B", image: "", priceValue: 200000, href: "/b" },
];

const PIN = 132;

/**
 * jsdom lays nothing out — every rect it returns is zero — so the table block's position is the
 * one thing these tests have to supply. Each case is a scroll position expressed as where the
 * block's top and bottom edges sit relative to the pin line.
 */
const renderSticky = (blockRect) => {
  const blockRef = createRef();
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <LanguageProvider>
          <div
            ref={(node) => {
              blockRef.current = node;
              if (node) node.getBoundingClientRect = () => blockRect;
            }}
          />
          <CompareStickyHeader
            t={t}
            products={PRODUCTS}
            isFixed={false}
            removeProduct={() => {}}
            blockRef={blockRef}
          />
        </LanguageProvider>
      ),
    },
  ]);
  return render(<Stub initialEntries={["/"]} />);
};

const scroll = () => {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
};

describe("CompareStickyHeader", () => {
  beforeEach(() => {
    /** The effect measures through rAF; running it inline keeps each assertion synchronous. */
    vi.stubGlobal("requestAnimationFrame", (callback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("stays hidden while the table's own header is still on screen", () => {
    const { container } = renderSticky({ top: PIN + 200, bottom: PIN + 1800 });
    scroll();
    expect(container.querySelector('[role="region"]')).toBeNull();
  });

  test("appears once the table has scrolled under the pin line, listing every compared product", () => {
    renderSticky({ top: -400, bottom: PIN + 900 });
    scroll();

    expect(
      screen.getByRole("region", { name: t("comparePage.stickyHeaderAria") }),
    ).toBeInTheDocument();
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
  });

  /**
   * The defect this replaces: anchored to a sentinel above the table, the strip stayed pinned
   * for the rest of the page, naming the columns of a table thousands of pixels above.
   */
  test("leaves with its table — hidden once the block's bottom passes the pin line", () => {
    const { container } = renderSticky({ top: -2300, bottom: PIN - 1 });
    scroll();
    expect(container.querySelector('[role="region"]')).toBeNull();
  });

  test("renders nothing on the server, before any measurement has happened", () => {
    const blockRef = createRef();
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: () => (
          <LanguageProvider>
            <CompareStickyHeader
              t={t}
              products={PRODUCTS}
              isFixed={false}
              removeProduct={() => {}}
              blockRef={blockRef}
            />
          </LanguageProvider>
        ),
      },
    ]);
    const { container } = render(<Stub initialEntries={["/"]} />);
    expect(container.querySelector('[role="region"]')).toBeNull();
  });
});
