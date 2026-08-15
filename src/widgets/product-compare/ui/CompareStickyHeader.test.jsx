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
    /**
     * The effect measures through rAF; running it inline keeps each assertion synchronous.
     *
     * Returns 0, not a live handle. The component holds the handle in `frame` and skips
     * scheduling while it is set, clearing it as the measurement starts — which works in a
     * browser, where the assignment happens before the callback ever runs. Inline, the order
     * inverts: the callback clears `frame` and the return value is written *after*, so a
     * non-zero handle would stick and every event after the first would be swallowed.
     */
    vi.stubGlobal("requestAnimationFrame", (callback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    vi.unstubAllGlobals();
    /** The short-viewport case redefines this; leaving it set would unpin every later test. */
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: originalInnerHeight,
    });
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

  /**
   * A landscape phone, where the strip costs more than it is worth: on a 667x375 viewport the
   * site header holds 180px and the mobile bottom nav 92px, so pinning a ~50px label bar left a
   * single table row on screen — the strip was naming columns the visitor could no longer read.
   */
  test("does not pin on a viewport too short for the table it would label", () => {
    const { container } = renderSticky({ top: -400, bottom: PIN + 900 });
    scroll();
    expect(container.querySelector('[role="region"]')).toBeInTheDocument();

    /** jsdom exposes `innerHeight` as a getter, so a plain assignment would be ignored. */
    const setViewportHeight = (height) => {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        writable: true,
        value: height,
      });
    };

    act(() => {
      setViewportHeight(375);
      window.dispatchEvent(new Event("resize"));
    });
    expect(container.querySelector('[role="region"]')).toBeNull();

    /** And comes back when the phone is turned upright again. */
    act(() => {
      setViewportHeight(740);
      window.dispatchEvent(new Event("resize"));
    });
    expect(container.querySelector('[role="region"]')).toBeInTheDocument();
  });

  /**
   * jsdom cannot answer "does this row overflow" — it lays nothing out — so this locks the
   * layout contract that decides it instead, on the three declarations the browser measurement
   * turned on.
   *
   * The defect: every entry was `shrink-0` at every width, so four titles at a fixed `14rem` cap
   * overflowed a 1440px window and the pinned strip grew a full-width horizontal scrollbar on a
   * desktop. Measured after the fix, in all three locales: no overflow from 768px up, overflow
   * (and the scrollbar it is there for) at 767px and below, and no price clipped at any width.
   */
  describe("sharing the row above md instead of scrolling", () => {
    const entriesOf = (container) => [
      ...container.querySelector('[role="region"]').firstElementChild.children,
    ];

    test("entries hold their own width below md and share it above", () => {
      const { container } = renderSticky({ top: -400, bottom: PIN + 900 });
      scroll();

      entriesOf(container).forEach((entry) => {
        /** Intrinsic width on a phone, where four of these genuinely cannot fit. */
        expect(entry.className).toMatch(/\bshrink-0\b/);
        /** An equal share of the row from md up — and able to take less than its content. */
        expect(entry.className).toMatch(/\bmd:flex-1\b/);
        expect(entry.className).toMatch(/\bmd:min-w-0\b/);
        expect(entry.className).toMatch(/\bmd:shrink\b/);
      });
    });

    test("a title absorbs the squeeze; a price is never allowed to be cut", () => {
      const { container } = renderSticky({ top: -400, bottom: PIN + 900 });
      scroll();

      entriesOf(container).forEach((entry) => {
        const title = entry.querySelector("a:not([aria-hidden])");
        /** Truncation, not wrapping — and no fixed cap, so the share it is given is the cap. */
        expect(title.className).toMatch(/\btruncate\b/);
        expect(title.className).toMatch(/\bmd:max-w-none\b/);

        /**
         * The floor under the text block. Without it, 768px squeezed entries to 161px and the
         * price rendered as "135,00…" — a number with its last digits eaten reads as a smaller
         * number, which is the one thing this strip must never do.
         */
        const price = entry.querySelector("p");
        expect(price.className).toMatch(/\bwhitespace-nowrap\b/);
        expect(price.className).not.toMatch(/\btruncate\b/);
        /** No trailing `\b`: `]` is not a word character, so there is no boundary after it. */
        expect(price.parentElement.className).toMatch(/\bmd:min-w-\[6\.5rem\]/);
      });
    });
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
