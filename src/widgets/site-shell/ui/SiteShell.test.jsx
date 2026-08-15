import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { vi } from "vitest";
import { LanguageProvider } from "contexts";
import { translations } from "shared/i18n";
import { DEFAULT_LANGUAGE_CODE } from "shared/i18n/languageConfig";
import SiteShell from "./SiteShell";

vi.mock("shared/ui/carousel", () => ({
  Carousel: () => <div data-testid="carousel-mock" />,
}));

/**
 * `SiteShell` is a router layout route — rendering it needs an actual matched child
 * route to fill the `<Outlet/>`, so this wraps it in real (still fully supported)
 * declarative `<Routes>` rather than trying to boot the app's own file-based
 * `routes.ts`, which is a build-time config `@react-router/dev` resolves, not a
 * runtime router a unit test can construct directly.
 */
test("renders the header's search input", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <LanguageProvider>
        <Routes>
          <Route element={<SiteShell />}>
            <Route index element={<div>page content</div>} />
          </Route>
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  );

  /**
   * The accessible name comes from the dictionary rather than a hard-coded string —
   * it is localized, so a literal would break on every copy change.
   * `combobox`, not `searchbox`: the field carries an explicit role for its suggestions.
   */
  const searchInput = await screen.findByRole("combobox", {
    name: translations[DEFAULT_LANGUAGE_CODE].header.search.inputAriaLabel,
  });
  expect(searchInput).toBeInTheDocument();
});

/**
 * jsdom applies no stylesheet, so the media query itself cannot be exercised here — what this
 * pins is the declaration that decides it, on the two points that were got wrong or nearly so.
 *
 * The defect: the header pinned at every viewport height. Measured on a 667x375 landscape phone,
 * it held 180px and the fixed bottom nav another 92px, leaving 103px of the 375 for the page —
 * verified in a browser after the fix: the header's bottom edge goes to -720px on scroll below
 * `short`, and stays at 151px on a 390x740 portrait phone.
 */
test("the header un-pins on a viewport too short to spend on chrome", async () => {
  const { container } = render(
    <MemoryRouter initialEntries={["/"]}>
      <LanguageProvider>
        <Routes>
          <Route element={<SiteShell />}>
            <Route index element={<div>page content</div>} />
          </Route>
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  );

  await screen.findByText("page content");
  const spacer = container.querySelector(".header-shell-spacer");
  expect(spacer).not.toBeNull();

  /** Pinned by default — every portrait phone, tablet and desktop window. */
  expect(spacer.className).toMatch(/\bsticky\b/);

  /**
   * `relative`, never `static`. The painted header inside is `absolute inset-x-0`, so this
   * element must keep establishing its containing block; making it static would re-anchor the
   * header to some ancestor further up and tear the layout apart.
   */
  expect(spacer.className).toMatch(/\bshort:relative\b/);
  expect(spacer.className).not.toMatch(/\bshort:static\b/);
  expect(container.querySelector("[data-header-shell]").className).toMatch(/\babsolute\b/);
});
