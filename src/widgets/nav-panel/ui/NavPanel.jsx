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
          <button
            type="button"
            className={`flex md:hidden items-center justify-around bg-navy hover:bg-navy text-white rounded min-w-fit border-none cursor-pointer transition-all duration-300 ${
              isCompact
                ? "mr-2 min-[425px]:mr-3 h-7 w-[90px] px-1.5 py-1 text-xs min-[425px]:w-[96px] sm:mr-4 sm:h-8 sm:w-[110px] sm:px-2 sm:text-sm"
                : "mr-3 min-[425px]:mr-4 w-[105px] h-8 px-2 py-1 text-sm min-[425px]:w-[112px] sm:mr-[26px] sm:w-[130px] sm:h-9 sm:px-2.5 sm:py-1.5 sm:text-base"
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
                ? "sm:mr-4 sm:h-8 sm:w-[110px] sm:px-2 sm:text-sm lg:h-[42px] lg:w-[145px] lg:px-4 lg:py-2.5 lg:text-[11px]"
                : "sm:mr-[26px] sm:w-[130px] sm:h-9 sm:px-2.5 sm:py-1.5 sm:text-base lg:h-[54px] lg:w-[160px] lg:px-5 lg:py-[18px] lg:text-xs"
            }`}
            title={t("navPanel.catalogLabel")}
          >
            <img src="/assets/Icons/catalog.svg" alt="" width="24" height="24" aria-hidden="true" />
            {t("navPanel.catalogLabel")}
          </LocalizedLink>
        </div>

        <div className="nav-items-container flex min-w-0 flex-1 items-center justify-start gap-2 overflow-x-auto min-[425px]:gap-3 sm:gap-4 lg:justify-between lg:gap-0">
          {navItems.map((item) => {
            const isActive = item.id === activeCategoryId;
            return (
              <div key={item.id} className="shrink-0">
                <LocalizedLink
                  to={item.href}
                  className={`nav-link flex items-center justify-center font-medium text-text-dark no-underline text-start w-fit h-auto hover:text-blue-600 transition-all duration-300 ${
                    isCompact
                      ? "min-h-6 max-w-[80px] px-1.5 py-0.5 text-[10px] leading-[1.2] tracking-[-0.5px] min-[425px]:max-w-[88px] min-[425px]:px-2.5 min-[425px]:tracking-normal sm:min-h-7 sm:max-w-[96px] sm:px-2 sm:py-1 sm:text-[11px] sm:leading-[1.25] lg:h-[42px] lg:min-h-0 lg:max-w-[150px] lg:px-3 lg:py-2.5 lg:text-xs"
                      : "min-h-7 max-w-[85px] px-1.5 py-0.5 text-[11px] leading-[1.2] tracking-[-0.7px] min-[425px]:max-w-[92px] min-[425px]:px-2.5 min-[425px]:tracking-normal sm:min-h-9 sm:max-w-[100px] sm:px-2 sm:py-1 sm:text-xs sm:leading-[1.3] lg:h-[54px] lg:min-h-0 lg:max-w-[160px] lg:px-3.5 lg:py-[18px] lg:leading-normal lg:tracking-normal"
                  } ${isActive ? "!bg-subtle-bg/65 !rounded-xl !text-navy" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </LocalizedLink>
              </div>
            );
          })}
        </div>
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

        <nav className="flex flex-col gap-5" aria-label={t("navPanel.catalogLinksAriaLabel")}>
          {navItems.map((item) => (
            <LocalizedLink
              key={item.id}
              to={item.href}
              className="flex w-full items-center justify-between no-underline text-navy text-sm font-medium leading-normal"
              onClick={handleCatalogClose}
            >
              <span>{item.label}</span>
              <FaChevronRight size={14} aria-hidden="true" />
            </LocalizedLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export default NavPanel;
