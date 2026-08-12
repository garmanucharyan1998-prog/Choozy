import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { LanguageProvider } from "contexts";
import { getTranslator } from "shared/i18n";
import { CompareStickyHeader } from "./CompareStickyHeader";

const t = getTranslator("en");

const PRODUCTS = [
  { id: "a", title: "Product A", image: "", priceValue: 100000, href: "/a" },
  { id: "b", title: "Product B", image: "", priceValue: 200000, href: "/b" },
];

const renderSticky = (sentinelRef) => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <LanguageProvider>
          <div ref={sentinelRef} />
          <CompareStickyHeader
            t={t}
            products={PRODUCTS}
            isFixed={false}
            removeProduct={() => {}}
            sentinelRef={sentinelRef}
          />
        </LanguageProvider>
      ),
    },
  ]);
  return render(<Stub initialEntries={["/"]} />);
};

describe("CompareStickyHeader", () => {
  test("renders nothing before the sentinel has ever left the viewport (SSR-safe default)", () => {
    // No IntersectionObserver at all — mirrors an environment (or SSR) where it's unavailable.
    const original = global.IntersectionObserver;
    delete global.IntersectionObserver;

    const sentinelRef = createRef();
    const { container } = renderSticky(sentinelRef);
    expect(container.querySelector('[role="region"]')).toBeNull();

    global.IntersectionObserver = original;
  });

  test("appears once the sentinel scrolls out of view, listing every compared product", () => {
    let observedCallback = null;
    global.IntersectionObserver = class {
      constructor(callback) {
        observedCallback = callback;
      }
      observe() {
        // Simulate the sentinel having scrolled above the viewport.
        observedCallback([{ isIntersecting: false }]);
      }
      disconnect() {}
    };

    const sentinelRef = createRef();
    renderSticky(sentinelRef);

    const region = screen.getByRole("region", { name: t("comparePage.stickyHeaderAria") });
    expect(region).toBeInTheDocument();
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
  });

  test("hides again once the sentinel scrolls back into view", () => {
    let observedCallback = null;
    global.IntersectionObserver = class {
      constructor(callback) {
        observedCallback = callback;
      }
      observe() {
        observedCallback([{ isIntersecting: false }]);
        observedCallback([{ isIntersecting: true }]);
      }
      disconnect() {}
    };

    const sentinelRef = createRef();
    const { container } = renderSticky(sentinelRef);
    expect(container.querySelector('[role="region"]')).toBeNull();
  });
});
