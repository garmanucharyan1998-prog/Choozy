import { useEffect, useRef } from "react";
import { FaChevronRight, FaTimes } from "react-icons/fa";
import { useNavPanelPresenter } from "features/nav-panel";
import { useLanguage } from "contexts";
import { LocalizedLink } from "shared/ui/link";
import "./NavPanel.css";

function NavPanel({
  isCompact = false,
  isMobileCatalogOpen = false,
  onToggleMobileCatalog,
  onCloseMobileCatalog,
}) {
  const { t } = useLanguage();
  const { navItems, activeCategoryId } = useNavPanelPresenter();
  const stripRef = useRef(null);
  const activeLinkRef = useRef(null);

  /**
   * Bring the current category into the strip's own viewport. On a category page the marked link
   * is often past the right edge — "Խաղային կոնսոլներ" sits ~1170px into a 963px scrollport — so
   * the page announces a selection the visitor cannot see.
   *
   * `scrollIntoView` is deliberately not used: it walks every scrollable ancestor, and this strip
   * lives inside a sticky header, so it would move the page as well. Only the strip's own
   * scrollLeft is touched, and only when the link really is out of sight. Running it in an effect
   * rather than during render also keeps the server and first client paint identical — reading
   * layout while rendering is how React #418 has repeatedly entered this codebase.
   */
  useEffect(() => {
    const strip = stripRef.current;
    const link = activeLinkRef.current;
    if (!strip || !link) {
      return;
    }
    const stripBox = strip.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    /** A margin, so the link lands inside the strip rather than flush against its edge. */
    const gutter = 16;
    if (linkBox.right > stripBox.right) {
      strip.scrollLeft += linkBox.right - stripBox.right + gutter;
    } else if (linkBox.left < stripBox.left) {
      strip.scrollLeft -= stripBox.left - linkBox.left + gutter;
    }
  }, [activeCategoryId]);

  const handleCatalogToggle = () => {
    if (typeof onToggleMobileCatalog === "function") {
      onToggleMobileCatalog();
    }
  };

  const handleCatalogClose = () => {
    if (typeof onCloseMobileCatalog === "function") {
      onCloseMobileCatalog();
    }
  };

  return (
    <div
      className={`relative flex bg-transparent text-[#171717] px-3 sm:px-5 lg:px-[50px] 2xl:px-[100px] transition-all duration-300 ${
        isCompact
          ? "pt-2 pb-3 sm:pt-2.5 sm:pb-5 mb-2 border-b-[3px] border-navy"
          : "py-3 sm:py-5 mb-3 border-b-0"
      }`}
    >
      <nav
        className="flex items-center w-full cont-width-default"
        aria-label={t("navPanel.navAriaLabel")}
      >
        <div className="shrink-0">
          {/*
            Below md this button opens the slide-in catalog panel; from md up the
            categories are already visible next to it, so it links to the full catalog
            instead of being a dead control.
          */}
          {/*
            No vertical padding: every variant below sets an explicit height and centres its
            content, so padding-block only shrinks the content box under the 24px icon — at
            `h-7` it left 20px for it, and the icon spilled into the padding.
          */}
          <button
            type="button"
            className={`flex md:hidden items-center justify-around bg-navy hover:bg-navy text-white rounded min-w-fit border-none cursor-pointer transition-all duration-300 ${
              isCompact
                ? "mr-2 min-[425px]:mr-3 h-7 w-[90px] px-1.5 py-0 text-xs min-[425px]:w-[96px] sm:mr-4 sm:h-8 sm:w-[110px] sm:px-2 sm:text-sm"
                : "mr-3 min-[425px]:mr-4 w-[105px] h-8 px-2 py-0 text-sm min-[425px]:w-[112px] sm:mr-[26px] sm:w-[130px] sm:h-9 sm:px-2.5 sm:text-base"
            }`}
            aria-label={t("navPanel.openCatalogAriaLabel")}
            aria-expanded={isMobileCatalogOpen}
            aria-controls="mobile-catalog-panel"
            onClick={handleCatalogToggle}
          >
            <img src="/assets/Icons/catalog.svg" alt="" width="24" height="24" aria-hidden="true" />
            {t("navPanel.catalogLabel")}
          </button>

          <LocalizedLink
            to="/filter"
            className={`hidden md:flex items-center justify-around bg-navy hover:bg-navy text-white rounded min-w-fit no-underline transition-all duration-300 ${
              isCompact
                ? "sm:mr-4 sm:h-8 sm:w-[110px] sm:px-2 sm:text-sm lg:h-[42px] lg:w-[145px] lg:px-4 lg:py-0 lg:text-[11px]"
                : "sm:mr-[26px] sm:w-[130px] sm:h-9 sm:px-2.5 sm:text-base lg:h-[54px] lg:w-[160px] lg:px-5 lg:py-0 lg:text-xs"
            }`}
            title={t("navPanel.catalogLabel")}
          >
            <img src="/assets/Icons/catalog.svg" alt="" width="24" height="24" aria-hidden="true" />
            {t("navPanel.catalogLabel")}
          </LocalizedLink>
        </div>

        {/* A list of navigation destinations is a list — it was a row of bare divs. */}
        <ul
          ref={stripRef}
          className="nav-items-container m-0 flex min-w-0 flex-1 list-none items-center justify-start gap-2 overflow-x-auto p-0 min-[425px]:gap-3 sm:gap-4 lg:justify-between lg:gap-0"
        >
          {navItems.map((item) => {
            const isActive = item.id === activeCategoryId;
            return (
              <li key={item.id} className="shrink-0">
                {/*
                  One line per category, and the strip scrolls when they stop fitting — which is
                  what the scrollbar below is for. The previous `max-w-*` clamps tried to make
                  every label fit without scrolling and broke on the labels that would not:
                  "Խաղային կոնսոլներ" needs 163px against a 160px clamp, so it wrapped for the
                  sake of three pixels, into a box whose fixed `h-[54px]` minus `py-[18px]` left
                  18px of content area for 36px of text. "Շարժական բարձրախոսներ" (215px) wrapped
                  everywhere, and at 360px "Ականջակալներ" is one unbreakable 87px word inside a
                  73px content box. A clamp cannot solve an unbreakable word; scrolling can.
                */}
                <LocalizedLink
                  ref={isActive ? activeLinkRef : undefined}
                  to={item.href}
                  className={`nav-link flex items-center justify-center whitespace-nowrap font-medium leading-normal text-text-dark no-underline w-fit h-auto hover:text-blue-600 transition-all duration-300 ${
                    isCompact
                      ? "min-h-6 px-1.5 py-0.5 text-[10px] min-[425px]:px-2.5 sm:min-h-7 sm:px-2 sm:py-1 sm:text-[11px] lg:h-[42px] lg:min-h-0 lg:px-3 lg:py-0 lg:text-xs"
                      : "min-h-7 px-1.5 py-0.5 text-[11px] min-[425px]:px-2.5 sm:min-h-9 sm:px-2 sm:py-1 sm:text-xs lg:h-[54px] lg:min-h-0 lg:px-3.5 lg:py-0"
                  } ${isActive ? "!bg-subtle-bg/65 !rounded-xl !text-navy" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </LocalizedLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <aside
        id="mobile-catalog-panel"
        className={`fixed top-[var(--header-height,72px)] left-0 z-40 w-[85vw] max-w-[360px] h-[calc(100vh-var(--header-height,72px))] bg-white border-r border-[#e6e9f2] px-4 py-5 sm:px-6 sm:py-6 shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform duration-[400ms] ease-in-out md:hidden ${
          isMobileCatalogOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label={t("navPanel.mobileCatalogAriaLabel")}
        inert={!isMobileCatalogOpen}
      >
        <div className="flex items-center justify-between mb-7">
          <h2 className="m-0 text-[26px] sm:text-[34px] leading-none font-semibold text-navy">
            {t("navPanel.catalogLabel")}
          </h2>
          <button
            type="button"
            onClick={handleCatalogClose}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-none bg-[#eceff3] text-navy flex items-center justify-center cursor-pointer"
            aria-label={t("navPanel.closeCatalogAriaLabel")}
          >
            <FaTimes size={22} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label={t("navPanel.catalogLinksAriaLabel")}>
          <ul className="m-0 flex list-none flex-col gap-5 p-0">
            {navItems.map((item) => (
              <li key={item.id}>
                <LocalizedLink
                  to={item.href}
                  className="flex w-full items-center justify-between no-underline text-navy text-sm font-medium leading-normal"
                  onClick={handleCatalogClose}
                >
                  <span>{item.label}</span>
                  <FaChevronRight size={14} aria-hidden="true" />
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default NavPanel;
