import { Outlet } from "react-router-dom";
import { FooterWidget } from "widgets/footer";
import { HeaderWidget } from "widgets/header";
import { NavPanelWidget } from "widgets/nav-panel";
import { useSiteShellPresenter } from "widgets/site-shell/presenter/useSiteShellPresenter";

const MAIN_BACKGROUND_CLASSES = {
  white: "bg-white",
  subtle: "bg-subtle-bg",
};

/**
 * Sticky header/nav chrome + footer shared by every page — mounted once as a router
 * layout route (matched child routes render into the `<Outlet/>`) rather than
 * copy-pasted into every page file (~40 lines each, with drifting `<main>` padding).
 * Because it's a layout route, the header/nav/footer instance — and its scroll and
 * open/closed state — persists across page navigations instead of remounting.
 *
 * @param {{ mainBackground?: "white" | "subtle" }} props
 */
const SiteShell = ({ mainBackground = "white" }) => {
  const {
    isCompactHeader,
    isMobileMenuOpen,
    isMobileCatalogOpen,
    isAnyMobilePanelOpen,
    toggleMobileMenu,
    closeMobileMenu,
    toggleMobileCatalog,
    closeMobileCatalog,
    closeAllMobilePanels,
    headerShellRef,
  } = useSiteShellPresenter();

  return (
    <div className="flex min-h-screen min-w-[320px] flex-col bg-white">
      <div
        className={`fixed inset-x-0 top-[var(--header-height,72px)] bottom-0 z-[65] bg-black/45 transition-opacity duration-[400ms] ease-in-out md:hidden ${
          isAnyMobilePanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMobilePanels}
        aria-hidden="true"
      />

      <div className="header-shell-spacer sticky top-0 z-[70] shrink-0">
        <div
          ref={headerShellRef}
          className={`absolute inset-x-0 top-0 bg-white transition-all duration-300 ${
            isCompactHeader ? "shadow-[0_6px_18px_rgba(0,0,0,0.08)]" : ""
          }`}
        >
          <HeaderWidget
            isCompact={isCompactHeader}
            isMobileMenuOpen={isMobileMenuOpen}
            onToggleMobileMenu={toggleMobileMenu}
            onCloseMobileMenu={closeMobileMenu}
          />
          <div
            className={`absolute inset-x-0 top-[var(--header-height,72px)] bottom-0 z-[5] bg-black/35 transition-opacity duration-[400ms] ease-in-out pointer-events-none md:hidden ${
              isAnyMobilePanelOpen ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
          <NavPanelWidget
            isCompact={isCompactHeader}
            isMobileCatalogOpen={isMobileCatalogOpen}
            onToggleMobileCatalog={toggleMobileCatalog}
            onCloseMobileCatalog={closeMobileCatalog}
          />
        </div>
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className={`flex flex-1 flex-col ${MAIN_BACKGROUND_CLASSES[mainBackground]} px-2.5 py-6 pb-[calc(var(--mobile-bottom-nav-height,0px)+24px)] text-start sm:px-[15px] md:px-[30px] md:py-10 lg:px-[50px] lg:pb-10 2xl:px-[100px]`}
      >
        <Outlet />
      </main>

      <div className="mt-auto shrink-0">
        <FooterWidget />
      </div>
    </div>
  );
};

export default SiteShell;
