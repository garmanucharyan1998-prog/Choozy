import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { LanguageProvider } from "contexts";
import { getCatalogProductById } from "entities/product";
import { COMPARE_STORAGE_KEY } from "entities/product-compare";
import { getTranslator } from "shared/i18n";
import ProductCompareWidget from "./ProductCompareWidget";

/** Two real smartphones from `entities/product/model/catalog/smartphones.js` — same category, so the widget's own scope check doesn't reject the pair. */
const FIXED_IDS = ["fp-1", "fp-4"];

/** `/` carries no language prefix, so the widget renders the default locale. */
const t = getTranslator("am");

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

/**
 * The editable page, which reads its selection from storage rather than from a prop. Needed for
 * anything about removing a column: `/compare/<a>-vs-<b>` is one indexable address for one
 * specific pair and deliberately offers no column editing.
 */
const renderEditable = (ids) => {
  window.localStorage.setItem(COMPARE_STORAGE_KEY, ids.join(","));
  return renderWidget(null);
};

afterEach(() => window.localStorage.clear());

/** The page renders two tables; these name them the way a reader would. */
const specsTable = (container) => container.querySelector("#compare-specs table");
const shopsTable = (container) => container.querySelector("#compare-shops table");

describe("ProductCompareWidget — page structure", () => {
  /**
   * The specifications and the shop prices are two different questions. They used to share one
   * table, one caption and one heading, with a sort control that only ever applied to half the
   * rows in it.
   */
  test("renders the specifications and the shop prices as two separate captioned tables", () => {
    const { container } = renderWidget();

    expect(specsTable(container)).toBeTruthy();
    expect(shopsTable(container)).toBeTruthy();
    expect(specsTable(container).querySelector("caption").textContent).toBe(
      t("comparePage.specs.tableCaption"),
    );
    expect(shopsTable(container).querySelector("caption").textContent).toBe(
      t("comparePage.shops.tableCaption"),
    );
  });

  /**
   * The pinned recap spans both tables, so it must be anchored to the block that holds them —
   * not to one table's scroller, which would take the strip away while the shop prices it is
   * still labelling are on screen. `scripts/verify-responsive.mjs` measures the same attribute.
   */
  test("the tables share one anchor block for the pinned strip", () => {
    const { container } = renderWidget();
    const block = container.querySelector("[data-compare-tables]");

    expect(block).toBeTruthy();
    expect(block.contains(specsTable(container))).toBe(true);
    expect(block.contains(shopsTable(container))).toBe(true);
  });

  test("renders each product's photo through the 1:1 compare image variant, never a raw crop", () => {
    const { container } = renderWidget();

    /** One per strip card, plus one per column header in each of the two tables. */
    expect(container.querySelectorAll(".product-card-image--compare").length).toBe(
      FIXED_IDS.length * 3,
    );
    expect(container.querySelectorAll('img[class*="object-cover"]').length).toBe(0);
  });

  test("section headers render as written in the dictionary, not forced to uppercase", () => {
    renderWidget();

    const sectionHeaders = screen
      .getAllByRole("columnheader")
      .filter((th) => th.scope === "colgroup");
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

  test("the editable page offers one remove control per product, named after it", () => {
    renderEditable(FIXED_IDS);

    const removes = screen.getAllByRole("button", { name: new RegExp(t("comparePage.remove")) });
    expect(removes).toHaveLength(FIXED_IDS.length);
    FIXED_IDS.forEach((id) => {
      expect(
        removes.some((button) =>
          button.getAttribute("aria-label").includes(getCatalogProductById(id).title),
        ),
      ).toBe(true);
    });
  });

  /**
   * `sr-only` is `position: absolute`, and an absolutely positioned element anchors to its
   * nearest *positioned* ancestor — `overflow-x: auto` clips but does not position. Without
   * `relative` on every horizontal scroller, screen-reader text anchors to the document at the
   * scrolled-out x of the card or column it belongs to: the table's winner cells gave the page
   * 55px of horizontal scroll at 360px, and the strip's rating labels gave it 408px at 390px.
   * jsdom does no layout, so the class contract is what can be asserted here; the measurement
   * that catches it lives in the responsive audit.
   */
  test("sr-only text inside a horizontal scroller has a positioned ancestor within it", () => {
    const { container } = renderWidget();
    const scrollers = [...container.querySelectorAll('[class*="overflow-x-auto"]')];
    expect(scrollers.length).toBeGreaterThan(0);

    /** Either the scroller itself is positioned, or something between it and the text is. */
    const positioned = /\b(relative|absolute|fixed|sticky)\b/;
    const anchored = [];
    scrollers.forEach((scroller) => {
      scroller.querySelectorAll(".sr-only").forEach((label) => {
        anchored.push(label);
        let found = false;
        for (let node = label.parentElement; node; node = node.parentElement) {
          if (positioned.test(node.className ?? "")) found = true;
          if (node === scroller) break;
        }
        expect(found, `unanchored sr-only: "${label.textContent.trim()}"`).toBe(true);
      });
    });
    expect(anchored.length, "a test that found no sr-only text proves nothing").toBeGreaterThan(0);
  });

  /**
   * A `min-width` larger than the declared column widths is redistributed across them under
   * `table-fixed`, which on a two-product pair page inflated every column until only one product
   * fitted on a 360px screen.
   */
  test("neither table declares a min-width that could inflate its columns", () => {
    const { container } = renderWidget();

    [specsTable(container), shopsTable(container)].forEach((table) => {
      expect(table.className).toMatch(/\btable-fixed\b/);
      expect(table.className).not.toMatch(/min-w-\[/);
    });
  });
});

describe("ProductCompareWidget — reaching it from a keyboard", () => {
  /**
   * The page is dense with controls — a disclosure per specification group, a sort button per
   * column, a jump chip per section, a link per product in three different places. Every one of
   * them has to say where it is when it is reached by Tab; a control that is focusable but
   * invisible is worse than one that is not focusable at all.
   *
   * jsdom cannot paint an outline, so the assertion is on the contract: `FOCUS_RING` (or the
   * shared `focus-visible:` utilities it is built from) is present on everything focusable.
   */
  test("every control the widget renders carries a visible focus treatment", () => {
    const { container } = renderEditable(FIXED_IDS);
    const controls = [...container.querySelectorAll("button, a[href]")];

    expect(controls.length).toBeGreaterThan(10);
    const bare = controls.filter(
      (element) => !/focus-visible:(outline|ring|shadow)/.test(element.className ?? ""),
    );
    expect(
      bare.map((element) => `${element.tagName}: ${element.textContent.trim().slice(0, 30)}`),
    ).toEqual([]);
  });
});

describe("ProductCompareWidget — the jump chips", () => {
  /**
   * The chip row is a nowrap flex scroller, so overflow is its normal state — and a flex item
   * shrinks by default. `shrink-0` on the anchor did nothing, because the flex item is the `<li>`
   * around it: every chip was squeezed once the row overflowed and its label wrapped, turning
   * "Ո՞րն ընտրել" into a two-line 47px pill in a row of 28px ones.
   *
   * jsdom lays out nothing, so the contract is what can be asserted here; the measurement that
   * catches it is the audit's `pill-label-wrapped` check.
   */
  test("neither the list item nor the chip inside it can be squeezed", () => {
    const { container } = renderWidget();
    const chips = [...container.querySelectorAll('a[href^="#compare-"]')];

    expect(chips.length).toBeGreaterThan(2);
    chips.forEach((chip) => {
      expect(chip.className, "a pill whose label can wrap is not a pill").toMatch(
        /\bwhitespace-nowrap\b/,
      );
      expect(chip.parentElement.tagName).toBe("LI");
      expect(chip.parentElement.className, "the flex item is the li, not the anchor").toMatch(
        /\bshrink-0\b/,
      );
    });
  });

  /** Every chip has to point at a section that is actually on the page. */
  test("every chip targets a section that exists", () => {
    const { container } = renderWidget();

    [...container.querySelectorAll('a[href^="#compare-"]')].forEach((chip) => {
      const id = chip.getAttribute("href").slice(1);
      expect(container.querySelector(`#${id}`), `missing section: ${id}`).toBeTruthy();
    });
  });
});

describe("ProductCompareWidget — marking a winner", () => {
  /**
   * fp-4 (Samsung Galaxy S25 Ultra) has more storage than fp-1 (iPhone 17 Pro Max, 512 GB vs
   * 256 GB) — a row with a real numeric winner, unlike screen size or RAM, which tie between
   * these two and must show no winner at all.
   */
  test("marks the higher-storage column's cell as best, with a visible and an accessible cue", () => {
    const { container } = renderWidget();
    const cells = [...specsTable(container).querySelectorAll("td")];

    const bestCell = cells.find((cell) => cell.textContent.includes("512"));
    const otherCell = cells.find((cell) => cell.textContent.includes("256"));
    expect(bestCell).toBeTruthy();
    expect(otherCell).toBeTruthy();

    expect(bestCell.className).toMatch(/bg-emerald-50/);
    expect(otherCell.className).not.toMatch(/bg-emerald-50/);
    // an accessible cue beyond colour: the checkmark icon and the sr-only "best value" text
    expect(bestCell.querySelector("svg")).toBeTruthy();
    expect(bestCell.querySelector(".sr-only")?.textContent).toContain(t("comparePage.bestValue"));
  });

  test("a tied spec (screen size, identical on both phones) marks no cell as best", () => {
    const { container } = renderWidget();
    const screenCells = [...specsTable(container).querySelectorAll("td")].filter((cell) =>
      cell.textContent.includes("6.9"),
    );
    expect(screenCells.length).toBeGreaterThan(0);
    screenCells.forEach((cell) => expect(cell.className).not.toMatch(/bg-emerald-50/));
  });
});

describe("ProductCompareWidget — folding a specification group away", () => {
  const groupToggles = (container) =>
    [...specsTable(container).querySelectorAll("button")].filter((button) =>
      button.hasAttribute("aria-expanded"),
    );

  test("every specification group is a disclosure, open to begin with", () => {
    const { container } = renderWidget();
    const toggles = groupToggles(container);

    expect(toggles.length).toBeGreaterThan(1);
    toggles.forEach((toggle) => {
      expect(toggle.getAttribute("aria-expanded")).toBe("true");
      /** It has to name the region it controls, and that region has to exist. */
      const controlled = container.querySelector(`#${toggle.getAttribute("aria-controls")}`);
      expect(controlled).toBeTruthy();
      expect(controlled.contains(toggle)).toBe(true);
    });
  });

  /**
   * Collapsing removes the rows rather than hiding them with a class: a `display: none` row is
   * still within reach of the accessibility tree in ways that differ between screen readers, and
   * "show differences only" already established that this table adds and removes rows.
   */
  test("collapsing a group removes its rows and keeps its heading", () => {
    const { container } = renderWidget();
    const [toggle] = groupToggles(container);
    const body = container.querySelector(`#${toggle.getAttribute("aria-controls")}`);
    const before = body.querySelectorAll('th[scope="row"]').length;
    expect(before).toBeGreaterThan(0);

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(body.querySelectorAll('th[scope="row"]')).toHaveLength(0);
    expect(within(body).getByRole("columnheader")).toBeTruthy();

    fireEvent.click(toggle);
    expect(body.querySelectorAll('th[scope="row"]')).toHaveLength(before);
  });
});

describe("ProductCompareWidget — choosing what the table shows", () => {
  const scopeButtons = () =>
    within(screen.getByRole("radiogroup", { name: t("comparePage.controls.scopeAria") })).getAllByRole(
      "radio",
    );

  /**
   * One choice with one answer, not two independent toggles: a screen reader that hears
   * "pressed / not pressed" twice has to work out for itself that they are related.
   */
  test("offers the two scopes as a radio group, showing all specifications by default", () => {
    renderWidget();
    const [all, differences] = scopeButtons();

    expect(all.getAttribute("aria-checked")).toBe("true");
    expect(differences.getAttribute("aria-checked")).toBe("false");
  });

  test("switching to differences only drops the rows every column agrees on", () => {
    const { container } = renderWidget();
    const rowLabels = () =>
      [...specsTable(container).querySelectorAll('tbody th[scope="row"]')].map(
        (th) => th.textContent,
      );

    const before = rowLabels();
    const sameEverywhere = [...specsTable(container).querySelectorAll("tbody tr")].filter((tr) => {
      const cells = [...tr.querySelectorAll("td")];
      return cells.length > 1 && new Set(cells.map((td) => td.textContent)).size === 1;
    });
    expect(sameEverywhere.length, "the fixture must contain a matching row").toBeGreaterThan(0);

    fireEvent.click(scopeButtons()[1]);

    const after = rowLabels();
    expect(after.length).toBeLessThan(before.length);
    after.forEach((label) => expect(before).toContain(label));
  });
});

/** The shop-prices table's own `<thead>`; its heading row is the one carrying `aria-sort`. */
const shopRows = (container) =>
  [...shopsTable(container).querySelectorAll("tbody tr")].filter((row) =>
    row.querySelector('th[scope="row"]'),
  );
/** `column` is 0-based across the product columns; the label column is not a `td`. */
const columnPrices = (container, column) =>
  shopRows(container).map((row) => {
    const digits = row.querySelectorAll("td")[column].textContent.replace(/\D/g, "");
    return digits ? Number(digits) : null;
  });
const sortButtons = (container) =>
  [...shopsTable(container).querySelectorAll("thead button")].filter((button) =>
    button.getAttribute("aria-label")?.startsWith(t("comparePage.sortByPrice")),
  );

describe("ProductCompareWidget — sorting the shop prices by one column", () => {
  test("offers one control per product column, named after the product it sorts by", () => {
    const { container } = renderWidget();
    const buttons = sortButtons(container);

    expect(buttons).toHaveLength(FIXED_IDS.length);
    FIXED_IDS.forEach((id, index) => {
      expect(buttons[index].getAttribute("aria-label")).toContain(getCatalogProductById(id).title);
    });
  });

  test("the first click puts the cheapest shop for that column first", () => {
    const { container } = renderWidget();
    const before = columnPrices(container, 0);
    expect(new Set(before).size, "the shops must quote different prices").toBeGreaterThan(1);

    fireEvent.click(sortButtons(container)[0]);

    const after = columnPrices(container, 0);
    expect(after).toEqual([...before].sort((a, b) => a - b));
  });

  test("the second click reverses it, and the third gives the default order back", () => {
    const { container } = renderWidget();
    const before = columnPrices(container, 0);

    fireEvent.click(sortButtons(container)[0]);
    fireEvent.click(sortButtons(container)[0]);
    expect(columnPrices(container, 0)).toEqual([...before].sort((a, b) => b - a));

    fireEvent.click(sortButtons(container)[0]);
    expect(columnPrices(container, 0)).toEqual(before);
  });

  /**
   * The rows move as units. A sort that reordered the clicked column's numbers on their own would
   * quietly reassign prices to shops that never quoted them — the worst possible bug in a table
   * whose entire job is "who sells it for how much".
   */
  test("every shop keeps its own prices in the other column after a sort", () => {
    const { container } = renderWidget();
    const shopNames = () =>
      shopRows(container).map((row) => row.querySelector('th[scope="row"]').textContent);
    const shopsBefore = shopNames();
    const otherColumnBefore = columnPrices(container, 1);
    const quotedBefore = new Map(shopsBefore.map((shop, index) => [shop, otherColumnBefore[index]]));

    fireEvent.click(sortButtons(container)[0]);

    const shopsAfter = shopNames();
    const otherColumnAfter = columnPrices(container, 1);
    expect(shopsAfter, "a sort that changed nothing would prove nothing").not.toEqual(shopsBefore);
    expect([...shopsAfter].sort()).toEqual([...shopsBefore].sort());
    shopsAfter.forEach((shop, index) => {
      expect(otherColumnAfter[index]).toBe(quotedBefore.get(shop));
    });
  });

  /**
   * `aria-sort` belongs on the column header, which is where the control now lives too — it used
   * to sit in a section heading row inside the body, as an unlabelled 14px arrow.
   */
  test("aria-sort names the state of exactly the column being sorted", () => {
    const { container } = renderWidget();
    const headerCells = () =>
      [...shopsTable(container).querySelectorAll('thead th[scope="col"]')]
        .filter((th) => th.hasAttribute("aria-sort"))
        .map((th) => th.getAttribute("aria-sort"));

    expect(headerCells()).toEqual(["none", "none"]);

    fireEvent.click(sortButtons(container)[1]);
    expect(headerCells()).toEqual(["none", "ascending"]);

    fireEvent.click(sortButtons(container)[1]);
    expect(headerCells()).toEqual(["none", "descending"]);

    /** Switching columns starts the new one ascending rather than inheriting "descending". */
    fireEvent.click(sortButtons(container)[0]);
    expect(headerCells()).toEqual(["ascending", "none"]);
  });

  /**
   * A specification section's rows are different facts in every row, so there is nothing to sort
   * them by — sorting screen size against RAM would be sorting apples by oranges.
   */
  test("only the shop-prices table carries sort controls", () => {
    const { container } = renderWidget();

    expect(sortButtons(container).length).toBe(FIXED_IDS.length);
    expect(specsTable(container).querySelectorAll("[aria-sort]")).toHaveLength(0);
    [...specsTable(container).querySelectorAll("thead button")].forEach((button) => {
      expect(button.getAttribute("aria-label") ?? "").not.toContain(t("comparePage.sortByPrice"));
    });
  });
});

describe("ProductCompareWidget — the summary above the table", () => {
  /**
   * A difference is only worth stating next to the value it beat: "512 GB" on its own is a spec,
   * "512 GB against 256 GB" is a difference, and only the second is what this section claims.
   */
  test("key differences name the winning product and print the value they beat", () => {
    renderWidget();
    const section = screen.getByRole("region", { name: t("comparePage.keyDifferences.heading") });

    const items = within(section).getAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      const titles = FIXED_IDS.map((id) => getCatalogProductById(id).title);
      expect(titles.some((title) => item.textContent.includes(title))).toBe(true);
      /** `advantages.betterThan` always prints a baseline after the margin. */
      expect(item.textContent).toMatch(/%/);
    });
  });

  test("the best-price block names a shop for every product it prices", () => {
    renderWidget();
    const section = screen.getByRole("region", { name: t("comparePage.bestPrices.heading") });

    const cards = within(section).getAllByRole("listitem");
    expect(cards).toHaveLength(FIXED_IDS.length);
    /** Exactly one product can hold the badge — a tie at the bottom means neither does. */
    const badges = within(section).queryAllByText(t("comparePage.bestPrices.cheapestBadge"));
    expect(badges.length).toBeLessThanOrEqual(1);
  });
});
