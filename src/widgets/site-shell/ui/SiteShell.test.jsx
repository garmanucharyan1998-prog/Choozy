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
