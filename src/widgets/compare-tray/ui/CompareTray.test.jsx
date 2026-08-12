import { fireEvent, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { LanguageProvider } from "contexts";
import { clearCompareIds, writeCompareIds } from "entities/product-compare";
import { getTranslator } from "shared/i18n";
import { CompareTray } from "./CompareTray";

/** Two real smartphones from the catalog, so the selection survives the same-category rule. */
const TWO = ["fp-1", "fp-4"];

/**
 * `/` carries no language prefix, so it renders the default locale. Asserting through the
 * translator rather than against literal strings keeps this test about the tray's behaviour
 * instead of about the current wording of four dictionary entries.
 */
const t = getTranslator("am");

const TrayHost = () => (
  <LanguageProvider>
    <CompareTray />
  </LanguageProvider>
);

const renderTray = (initialPath = "/") => {
  const Stub = createRoutesStub([
    { path: "/", Component: TrayHost },
    { path: "/compare", Component: TrayHost },
    { path: "/compare/:pairSlug", Component: TrayHost },
    { path: "/en", Component: TrayHost },
    { path: "/en/compare", Component: TrayHost },
  ]);
  return render(<Stub initialEntries={[initialPath]} />);
};

describe("CompareTray", () => {
  beforeEach(() => {
    clearCompareIds();
  });

  test("stays out of the way until something is selected", () => {
    const { container } = renderTray();
    expect(container).toBeEmptyDOMElement();
  });

  test("shows one thumbnail per selected product, with the count beside them", () => {
    writeCompareIds(TWO);
    const { container } = renderTray();

    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByText("2/4")).toBeInTheDocument();
  });

  /** The bare digits are hidden from assistive tech; a sentence carries the same count instead. */
  test("states the count in words for a screen reader", () => {
    writeCompareIds(TWO);
    renderTray();

    const spelledOut = t("comparePage.tray.count")
      .replace("{{count}}", "2")
      .replace("{{max}}", "4");
    expect(screen.getByText(spelledOut)).toBeInTheDocument();
  });

  test("uses the 1:1 compare image frame, like the comparison table's own columns", () => {
    writeCompareIds(TWO);
    const { container } = renderTray();

    expect(container.querySelectorAll(".product-card-image--compare")).toHaveLength(2);
    expect(container.querySelectorAll('img[class*="object-cover"]')).toHaveLength(0);
  });

  /** On `/compare` the table already is the tray; a floating copy would cover it. */
  test("hides itself on the compare page and its pair pages", () => {
    writeCompareIds(TWO);
    expect(renderTray("/compare").container).toBeEmptyDOMElement();
    expect(renderTray("/compare/a-vs-b").container).toBeEmptyDOMElement();
  });

  /** The locale lives in the URL prefix, so the check has to survive it. */
  test("hides itself on a language-prefixed compare page too", () => {
    writeCompareIds(TWO);
    expect(renderTray("/en/compare").container).toBeEmptyDOMElement();
    expect(renderTray("/en").container).not.toBeEmptyDOMElement();
  });

  test("waits for a second product before offering to compare", () => {
    writeCompareIds(["fp-1"]);
    renderTray();

    expect(
      screen.queryByRole("link", { name: t("comparePage.tray.compareCta") }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(t("comparePage.tray.needMore"))).toBeInTheDocument();
  });

  test("offers the comparison once two products are in", () => {
    writeCompareIds(TWO);
    renderTray();

    const cta = screen.getByRole("link", { name: t("comparePage.tray.compareCta") });
    expect(cta).toHaveAttribute("href", "/compare");
  });

  test("removing a product drops it from the bar", () => {
    writeCompareIds(TWO);
    const { container } = renderTray();

    const removeButtons = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-label")?.startsWith(t("comparePage.remove")));
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);

    expect(container.querySelectorAll("li")).toHaveLength(1);
    expect(screen.getByText("1/4")).toBeInTheDocument();
  });

  test("clearing empties the bar entirely", () => {
    writeCompareIds(TWO);
    const { container } = renderTray();

    fireEvent.click(screen.getByRole("button", { name: t("comparePage.clearAll") }));

    expect(container).toBeEmptyDOMElement();
  });

  /**
   * Three other fixed elements share this corner — the page's bottom padding, the compare toast
   * and the scroll-to-top button — and all three read this variable to move out of the way.
   */
  test("publishes its own height for the rest of the bottom corner to react to", () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get: () => 72,
    });

    try {
      writeCompareIds(TWO);
      renderTray();
      expect(document.documentElement.style.getPropertyValue("--compare-tray-height")).toBe("72px");
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, "offsetHeight", original);
      else delete HTMLElement.prototype.offsetHeight;
    }
  });

  test("reports zero height while it is not on screen, rather than leaving a stale value", () => {
    renderTray();
    expect(document.documentElement.style.getPropertyValue("--compare-tray-height")).toBe("0px");
  });
});
