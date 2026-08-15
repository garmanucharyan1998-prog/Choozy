import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { vi } from "vitest";
import { LanguageProvider, SessionProvider } from "contexts";
import { ROLES } from "entities/session";
import { translations } from "shared/i18n";
import { DEFAULT_LANGUAGE_CODE } from "shared/i18n/languageConfig";
import Header from "./Header";

vi.mock("entities/search", () => ({
  searchModel: { MIN_QUERY_LENGTH: 2, fetchSuggestions: async () => ({ success: true, data: [] }) },
  default: { MIN_QUERY_LENGTH: 2, fetchSuggestions: async () => ({ success: true, data: [] }) },
}));

const dict = translations[DEFAULT_LANGUAGE_CODE];

const SIGNED_OUT = { isAuthenticated: false, role: null, email: null };
const BUYER_SESSION = { isAuthenticated: true, role: ROLES.BUYER, email: "buyer@test.com" };
const SELLER_SESSION = { isAuthenticated: true, role: ROLES.SELLER, email: "seller@test.com" };

/**
 * `Header` (via `LogoutButton`, only mounted when signed in) calls `useSubmit()`, which
 * needs a real data router — a plain `MemoryRouter` throws. `createRoutesStub` gives every
 * state a working in-memory data router without booting the app's own file-based routes.ts.
 */
const renderHeaderAs = (session) => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <SessionProvider session={session}>
          <LanguageProvider>
            <Header />
          </LanguageProvider>
        </SessionProvider>
      ),
    },
  ]);
  return render(<Stub initialEntries={["/"]} />);
};

/**
 * The desktop user-nav and the always-mounted mobile bottom nav intentionally reuse the
 * same accessible names for the same destination (favorites, account) — jsdom has no
 * layout engine, so the `md:hidden`/`md:flex` Tailwind classes that keep only one visible
 * per viewport in a real browser don't hide anything here, and an unscoped query would
 * match both. Scoping to the desktop nav's own `aria-label` disambiguates.
 */
const getDesktopNav = () =>
  screen.getByRole("navigation", { name: dict.header.userNavigationAriaLabel });

describe("Header — signed out", () => {
  test("shows the login button and the (session-agnostic) favorites link, no logout control", async () => {
    renderHeaderAs(SIGNED_OUT);
    const desktopNav = within(await screen.findByRole("navigation", { name: dict.header.userNavigationAriaLabel }));

    expect(desktopNav.getByRole("button", { name: dict.header.loginAriaLabel })).toBeInTheDocument();
    expect(desktopNav.getByRole("link", { name: dict.header.favoritesAriaLabel })).toBeInTheDocument();
    expect(
      desktopNav.queryByRole("button", { name: dict.auth.logoutAria }),
    ).not.toBeInTheDocument();
  });
});

describe("Header — signed in as buyer", () => {
  test("shows the buyer account link, favorites, and a logout control", async () => {
    renderHeaderAs(BUYER_SESSION);
    await screen.findByRole("navigation", { name: dict.header.userNavigationAriaLabel });
    const desktopNav = within(getDesktopNav());

    expect(
      desktopNav.getByRole("link", { name: dict.header.buyerAccountAriaLabel }),
    ).toBeInTheDocument();
    expect(desktopNav.getByRole("link", { name: dict.header.favoritesAriaLabel })).toBeInTheDocument();
    expect(desktopNav.getByRole("button", { name: dict.auth.logoutAria })).toBeInTheDocument();
    expect(
      desktopNav.queryByRole("button", { name: dict.header.loginAriaLabel }),
    ).not.toBeInTheDocument();
  });
});

describe("Header — signed in as seller", () => {
  test("shows the shop account link and logout, but not the buyer favorites link", async () => {
    renderHeaderAs(SELLER_SESSION);
    await screen.findByRole("navigation", { name: dict.header.userNavigationAriaLabel });
    const desktopNav = within(getDesktopNav());

    expect(
      desktopNav.getByRole("link", { name: dict.header.sellerAccountAriaLabel }),
    ).toBeInTheDocument();
    expect(desktopNav.getByRole("button", { name: dict.auth.logoutAria })).toBeInTheDocument();
    expect(
      desktopNav.queryByRole("link", { name: dict.header.favoritesAriaLabel }),
    ).not.toBeInTheDocument();
  });
});

describe("Header — the mobile navigation panel", () => {
  /**
   * jsdom lays nothing out, so the overflow itself cannot be reproduced here — this pins the
   * declaration that decides it.
   *
   * The defect: the panel is a fixed box exactly one viewport tall with `overflow-y: visible`.
   * Measured on a 667x375 landscape phone, 288px of links sat in a 235px box and the last entry
   * ("Privacy policy") painted at y=388, off the bottom of the screen — the panel would not
   * scroll, and `body` is locked while the menu is open, so the page would not either. It was
   * unreachable, and signing in adds another entry to the same list.
   */
  test("scrolls its own contents rather than hiding the entries that overflow", async () => {
    const { container } = renderHeaderAs(SIGNED_OUT);
    await screen.findByRole("navigation", { name: dict.header.userNavigationAriaLabel });

    const panel = container.querySelector("aside");
    expect(panel).not.toBeNull();
    expect(panel.className).toMatch(/\boverflow-y-auto\b/);
    /** And that scroll must not chain to the locked page behind it once the panel bottoms out. */
    expect(panel.className).toMatch(/\boverscroll-contain\b/);
  });
});
