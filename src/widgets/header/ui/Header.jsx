import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  FaSearch,
  FaHome,
  FaBalanceScale,
  FaUser,
  FaTimes,
  FaBars,
  FaChevronDown,
} from "react-icons/fa";
import { useHeaderPresenter } from "features/header";
import choozyMainLogo from "shared/assets/logos/choozyMainLogo.svg";
import "./Header.css";

const Header = ({
  isCompact = false,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onCloseMobileMenu,
}) => {
  const headerRef = useRef(null);
  const mobileBottomNavRef = useRef(null);

  const {
    languages,
    mobileMenuItems,
    language,
    currentLanguage,
    isLanguageDropdownOpen,
    handleLanguageChange,
    toggleLanguageDropdown,
    searchQuery,
    searchSuggestions,
    showSuggestions,
    showNoResults,
    handleSearchInputChange,
    handleSearchSubmit,
    handleSuggestionClick,
    handleClearSearch,
    handleSearchFocus,
  } = useHeaderPresenter();

  const handleMobileMenuToggle = useCallback(() => {
    if (isLanguageDropdownOpen) {
      toggleLanguageDropdown();
    }
    if (typeof onToggleMobileMenu === "function") {
      onToggleMobileMenu();
    }
  }, [isLanguageDropdownOpen, toggleLanguageDropdown, onToggleMobileMenu]);

  const handleMobileMenuClose = useCallback(() => {
    if (typeof onCloseMobileMenu === "function") {
      onCloseMobileMenu();
    }
  }, [onCloseMobileMenu]);

  useEffect(() => {
    const isTouchLikeDevice = () =>
      window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      window.matchMedia("(any-hover: none) and (any-pointer: coarse)").matches;

    const updateHeaderHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
    };

    const updateMobileBottomNavHeight = () => {
      const mobileBottomNavHeight = mobileBottomNavRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--mobile-bottom-nav-height", `${mobileBottomNavHeight}px`);
    };

    /**
     * Keeps fixed bottom elements stable on mobile browsers while
     * browser chrome appears/disappears during scroll.
     */
    const updateMobileViewportBottomOffset = () => {
      const shouldApplyMobileViewportOffset =
        window.innerWidth < 768 &&
        typeof window.visualViewport !== "undefined" &&
        isTouchLikeDevice();

      if (!shouldApplyMobileViewportOffset) {
        document.documentElement.style.setProperty("--mobile-viewport-offset-bottom", "0px");
        return;
      }

      const layoutViewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
      const viewportBottom = window.visualViewport.offsetTop + window.visualViewport.height;
      const viewportBottomOffset = Math.max(0, layoutViewportHeight - viewportBottom);

      document.documentElement.style.setProperty(
        "--mobile-viewport-offset-bottom",
        `${viewportBottomOffset}px`,
      );
    };

    const updateLayoutMetrics = () => {
      updateHeaderHeight();
      updateMobileBottomNavHeight();
      updateMobileViewportBottomOffset();
    };

    updateLayoutMetrics();

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateLayoutMetrics);
      if (headerRef.current) {
        resizeObserver.observe(headerRef.current);
      }
      if (mobileBottomNavRef.current) {
        resizeObserver.observe(mobileBottomNavRef.current);
      }
    }

    const visualViewport = window.visualViewport;

    window.addEventListener("resize", updateLayoutMetrics);
    window.addEventListener("orientationchange", updateLayoutMetrics);
    window.addEventListener("scroll", updateMobileViewportBottomOffset, { passive: true });

    if (visualViewport) {
      visualViewport.addEventListener("resize", updateMobileViewportBottomOffset);
      visualViewport.addEventListener("scroll", updateMobileViewportBottomOffset);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", updateLayoutMetrics);
      window.removeEventListener("orientationchange", updateLayoutMetrics);
      window.removeEventListener("scroll", updateMobileViewportBottomOffset);
      if (visualViewport) {
        visualViewport.removeEventListener("resize", updateMobileViewportBottomOffset);
        visualViewport.removeEventListener("scroll", updateMobileViewportBottomOffset);
      }
      document.documentElement.style.removeProperty("--header-height");
      document.documentElement.style.removeProperty("--mobile-bottom-nav-height");
      document.documentElement.style.removeProperty("--mobile-viewport-offset-bottom");
    };
  }, []);

  const LogoSection = useMemo(
    () => (
      <a
        href="/"
        className="no-underline flex justify-start"
        aria-label="Choozy - Main page"
        title="Choozy - Electronics online store"
      >
        <img
          src={choozyMainLogo}
          alt="Choozy - Electronics online store logo"
          className={`${isCompact ? "w-[38px] sm:w-[78px]" : "w-[44px] sm:w-[100px]"} h-auto transition-all duration-300`}
          loading="eager"
        />
      </a>
    ),
    [isCompact],
  );

  const NavigationSection = useMemo(
    () => (
      <nav
        aria-label="Main navigation"
        className="hidden md:flex items-center gap-4 text-xs px-[10px] lg:px-[70px] 2xl:px-0"
      >
        <a
          href="/about"
          className={`no-underline text-[#333] flex items-center rounded-pill gap-1 min-w-0 mx-[5px] justify-center scale-[1.1] hover:scale-[1.15] hover:duration-150 hover:bg-accent-blue lg:scale-100 lg:hover:scale-105 2xl:mx-0 transition-all duration-300 ${
            isCompact ? "px-3 py-2 text-[11px] 2xl:px-4 2xl:py-2.5" : "p-3.5 2xl:px-5 2xl:py-3.5"
          }`}
          title="Learn more about Choozy company"
        >
          {"Մեր մասին"}
        </a>
      </nav>
    ),
    [isCompact],
  );

  const SearchSection = useMemo(
    () => (
      <form
        className={`search-bar relative flex bg-input-bg rounded-pill grow border-[1.5px] border-accent-blue order-3 w-full md:order-none md:w-auto md:mt-0 md:ml-5 2xl:max-w-[400px] 2xl:ml-0 transition-all duration-300 ${
          isCompact ? "mt-1.5 sm:mt-2" : "mt-2 sm:mt-3"
        }`}
        role="search"
        onSubmit={handleSearchSubmit}
        aria-label="Product search"
      >
        <FaSearch
          className={`text-[#888] self-center text-xs sm:text-sm transition-all duration-300 ${isCompact ? "mr-1 ml-2 sm:mr-1.5 sm:ml-3" : "mr-1.5 ml-2.5 sm:mr-2 sm:ml-[18px]"}`}
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          placeholder={"Որոնել"}
          aria-label="Search for products and services"
          aria-describedby="search-help"
          className={`search-input border-none bg-transparent grow text-xs sm:text-sm outline-none transition-all duration-300 ${
            isCompact ? "p-1.5 sm:p-2 2xl:p-2.5" : "p-2 sm:p-3 2xl:p-4"
          }`}
          value={searchQuery}
          onChange={handleSearchInputChange}
          onFocus={handleSearchFocus}
          autoComplete="off"
          style={{ WebkitAppearance: "none" }}
          maxLength="100"
        />
        <div id="search-help" className="sr-only">
          Enter at least 2 characters to search
        </div>

        {searchQuery && (
          <button
            type="button"
            className={`bg-transparent border-none text-[#888] cursor-pointer flex items-center justify-center rounded-full transition-all duration-200 hover:bg-input-bg hover:text-[#666] lg:mr-0 ${
              isCompact ? "p-1.5 mr-2" : "p-2 mr-5"
            }`}
            onClick={handleClearSearch}
            aria-label="Clear search"
            title="Clear search field"
          >
            <FaTimes aria-hidden="true" />
          </button>
        )}

        <button
          type="submit"
          className={`bg-accent-blue border-none rounded-pill text-active-blue font-semibold cursor-pointer transition-all duration-200 hover:enabled:bg-[#c8d4ff] hover:enabled:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed 2xl:ml-0 ${
            isCompact
              ? "px-2.5 py-1.5 text-[11px] -ml-[76px] sm:px-3 sm:py-2 sm:text-xs sm:-ml-[86px] lg:-ml-4 2xl:px-4 2xl:py-2.5 2xl:text-[13px]"
              : "px-3 py-2 text-xs -ml-[86px] sm:px-4 sm:py-3 sm:text-[13px] sm:-ml-[100px] lg:-ml-5 2xl:px-5 2xl:py-3.5 2xl:text-sm"
          }`}
          aria-label="Execute search"
          disabled={!searchQuery.trim()}
        >
          {"Որոնել"}
        </button>

        {showSuggestions && (
          <div
            className="absolute top-full left-0 right-0 bg-subtle-bg border border-accent-blue rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-[1000] max-h-[280px] overflow-y-auto mt-2 py-2"
            role="listbox"
            aria-label="Search results"
          >
            {searchSuggestions.length > 0 ? (
              searchSuggestions.map((suggestion, index) => (
                <div
                  key={`suggestion-${index}`}
                  className="px-5 py-3 cursor-pointer text-sm text-[#333] transition-colors duration-200 hover:bg-[#f8f9ff] hover:text-active-blue"
                  role="option"
                  aria-selected={false}
                  tabIndex={0}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSuggestionClick(suggestion);
                    }
                  }}
                  aria-label={`Select: ${suggestion}`}
                >
                  {suggestion}
                </div>
              ))
            ) : showNoResults ? (
              <div className="px-5 py-4 text-sm text-[#666] text-center" role="status" aria-live="polite">
                {"Արդյունքներ չեն գտնվել"}
              </div>
            ) : null}
          </div>
        )}
      </form>
    ),
    [
      searchQuery,
      searchSuggestions,
      showSuggestions,
      showNoResults,
      handleSearchInputChange,
      handleSearchSubmit,
      handleClearSearch,
      handleSuggestionClick,
      handleSearchFocus,
      isCompact,
    ],
  );

  const mobileBottomNavItems = useMemo(
    () => [
      {
        href: "/",
        label: "Գլխավոր",
        ariaLabel: "Go to home page",
        iconType: "home",
      },
      {
        href: "/compare",
        label: "Համեմատել",
        ariaLabel: "Go to compare products",
        iconType: "compare",
      },
      {
        href: "/favorites",
        label: "Նախընտրելի",
        ariaLabel: "Go to favorite products",
        iconType: "favorites",
      },
      {
        href: "/login",
        label: "Մուտք",
        ariaLabel: "Open personal account",
        iconType: "profile",
      },
    ],
    [],
  );

  /** Renders mobile bottom panel icon according to item type and active state. */
  const renderMobileBottomIcon = useCallback((iconType, isActive) => {
    const commonIconClassName = isActive ? "text-[#fbfbfb]" : "text-[#6B738C]";
    const commonIconSize = 18;

    switch (iconType) {
      case "home":
        return <FaHome size={commonIconSize} className={commonIconClassName} aria-hidden="true" />;
      case "compare":
        return <FaBalanceScale size={commonIconSize} className={commonIconClassName} aria-hidden="true" />;
      case "favorites":
        return (
          <img
            src="/assets/icons/heart.svg"
            alt=""
            width="18"
            height="18"
            className={`${isActive ? "brightness-0 invert" : "opacity-60"} transition-all duration-200`}
            aria-hidden="true"
          />
        );
      case "profile":
        return <FaUser size={commonIconSize} className={commonIconClassName} aria-hidden="true" />;
      default:
        return null;
    }
  }, []);

  const UserNavigationSection = useMemo(
    () => (
      <nav
        className={`flex items-center transition-all duration-300 ${isCompact ? "gap-1 sm:gap-1.5 md:gap-1.5 2xl:gap-3" : "gap-1.5 sm:gap-2 md:gap-[5px] 2xl:gap-4"}`}
        aria-label="User navigation"
      >
        <a
          href="/compare"
          className={`tooltip-container relative no-underline text-[#333] hidden md:flex items-center rounded-pill gap-1 min-w-0 mx-[5px] justify-center scale-[1.1] hover:scale-[1.15] hover:duration-150 hover:bg-accent-blue lg:scale-100 lg:hover:scale-105 2xl:mx-0 transition-all duration-300 ${
            isCompact ? "p-2.5 2xl:px-4 2xl:py-2.5" : "p-3.5 2xl:px-5 2xl:py-3.5"
          }`}
          title="Compare products"
          aria-label="Compare selected products"
        >
          <FaBalanceScale size={20} aria-hidden="true" />
          <span className="hidden 2xl:inline 2xl:ml-[5px]">
            {"Համեմատել"}
          </span>
        </a>

        <a
          href="/favorites"
          className={`tooltip-container relative no-underline text-[#333] hidden md:flex items-center rounded-pill gap-1 min-w-0 mx-[5px] justify-center scale-[1.1] hover:scale-[1.15] hover:duration-150 hover:bg-accent-blue lg:scale-100 lg:hover:scale-105 2xl:mx-0 transition-all duration-300 ${
            isCompact ? "p-2.5 2xl:px-4 2xl:py-2.5" : "p-3.5 2xl:px-5 2xl:py-3.5"
          }`}
          title="Favorite products"
          aria-label="Go to favorite products"
        >
          <img
            src="/assets/icons/heart.svg"
            alt="Favorites icon"
            width="24"
            height="24"
            aria-hidden="true"
          />
          <span className="hidden 2xl:inline 2xl:ml-[5px]">
            {"Նախընտրելի"}
          </span>
        </a>

        <div className="hidden md:block">
          <a
            href="/login"
            className={`tooltip-container relative flex items-center gap-1.5 bg-white border-[1.5px] border-navy rounded-[40px] text-active-blue no-underline min-w-0 mx-[5px] justify-center 2xl:mx-0 transition-all duration-300 ${
              isCompact ? "p-2.5 2xl:px-4 2xl:py-2.5" : "p-3.5 2xl:px-5 2xl:py-3.5"
            }`}
            title="Login to account"
            aria-label="Login to personal cabinet"
          >
            <FaUser color="#152147" aria-hidden="true" />
            <span className="hidden 2xl:inline 2xl:ml-[5px]">
              {"Մուտք"}
            </span>
          </a>
        </div>

        <button
          type="button"
          className={`md:hidden flex items-center justify-center rounded-full bg-[#eceff3] text-navy border-none cursor-pointer transition-all duration-300 ease-in-out hover:bg-accent-blue hover:scale-105 ${
            isCompact ? "w-6 h-6 sm:w-7 sm:h-7" : "w-7 h-7 sm:w-8 sm:h-8"
          }`}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={handleMobileMenuToggle}
        >
          {isMobileMenuOpen ? <FaTimes size={14} aria-hidden="true" /> : <FaBars size={14} aria-hidden="true" />}
        </button>

        <div className="relative" aria-label="Language selection">
          <button
            onClick={toggleLanguageDropdown}
            className="bg-transparent border-none cursor-pointer p-0 flex items-center gap-1"
            aria-label={`Current language: ${currentLanguage.alt}`}
            aria-expanded={isLanguageDropdownOpen}
            aria-haspopup="listbox"
          >
            <img
              src={`https://flagcdn.com/w40/${currentLanguage.flag}.png`}
              alt={currentLanguage.alt}
              width="24"
              height="16"
              className={`${isCompact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6"} rounded-full border border-[#ccc] transition-all duration-300`}
              loading="lazy"
            />
            <span className={`font-semibold text-[#171717] md:hidden ${isCompact ? "text-[10px] sm:text-[11px]" : "text-[11px] sm:text-xs"}`}>{currentLanguage.name}</span>
            <FaChevronDown
              className={`text-[#171717] md:hidden transition-transform duration-200 ${isCompact ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px]"} ${isLanguageDropdownOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {isLanguageDropdownOpen && (
            <div
              className="absolute top-[calc(100%+8px)] right-1/2 translate-x-1/2 bg-white border border-[#ccc] shadow-[0_2px_8px_rgba(0,0,0,0.1)] z-50 rounded-xl py-1 md:right-0 md:translate-x-0"
              role="listbox"
              aria-label="Select language"
            >
              {Object.entries(languages).map(([code, lang]) => (
                <div
                  key={code}
                  className={`flex items-center justify-center whitespace-nowrap cursor-pointer transition-colors duration-200 hover:bg-[#f1f1f1] md:justify-start ${
                    isCompact ? "px-2.5 py-1.5" : "px-3 py-2"
                  }`}
                  role="option"
                  aria-selected={code === language}
                  onClick={() => handleLanguageChange(code)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleLanguageChange(code);
                    }
                  }}
                  tabIndex={0}
                >
                  <img
                    src={`https://flagcdn.com/w40/${lang.flag}.png`}
                    alt={lang.alt}
                    width="24"
                    height="16"
                    className={`${isCompact ? "w-5 h-5" : "w-6 h-6"} rounded-full border border-[#ccc] flex-shrink-0 transition-all duration-300`}
                    loading="lazy"
                  />
                  <span className={`hidden md:inline ml-2 ${isCompact ? "text-xs" : "text-sm"}`}>{lang.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
    ),
    [
      currentLanguage,
      isLanguageDropdownOpen,
      isMobileMenuOpen,
      language,
      toggleLanguageDropdown,
      handleLanguageChange,
      languages,
      isCompact,
      handleMobileMenuToggle,
    ],
  );

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <header
      ref={headerRef}
      className={`relative flex justify-center bg-transparent px-3 sm:px-5 lg:px-[50px] 2xl:px-[100px] transition-all duration-300 ${
        isCompact ? "py-2" : "py-3 sm:py-5"
      }`}
      role="banner"
    >
      <div className="flex flex-wrap items-center text-[#171717] font-bold justify-between cont-width-default md:flex-nowrap transition-all duration-300">
        {LogoSection}
        {NavigationSection}
        {SearchSection}
        {UserNavigationSection}
      </div>

      <aside
        className={`fixed top-[var(--header-height,72px)] right-0 z-40 w-[75vw] max-w-[300px] h-[calc(100vh-var(--header-height,72px))] bg-white border-l border-[#e6e9f2] px-3 py-5 sm:px-4 sm:py-6 shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform duration-[400ms] ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation menu"
      >
        <h3 className="m-0 mb-6 text-base font-semibold text-[#171717]">
          {"Մենյու"}
        </h3>
        <nav className="flex flex-col gap-6 items-start" aria-label="Mobile links">
          {mobileMenuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block w-full text-left text-[#171717] no-underline text-sm font-medium"
              onClick={handleMobileMenuClose}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <nav
        ref={mobileBottomNavRef}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e6e9f2] bg-[#fbfbfb] shadow-[0_-4px_18px_rgba(157,157,157,0.12)] md:hidden"
        aria-label="Bottom mobile navigation"
        style={{ bottom: "var(--mobile-viewport-offset-bottom, 0px)" }}
      >
        <ul className="m-0 flex list-none items-end justify-around px-2 sm:px-4 pt-2 pb-2 sm:pb-2.5">
          {mobileBottomNavItems.map((item) => {
            const isActive =
              item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href);

            return (
              <li key={item.href} className="flex-1">
                <a
                  href={item.href}
                  className="flex w-full flex-col items-center justify-center gap-1 py-1.5 no-underline transition-colors duration-200"
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                  onClick={handleMobileMenuClose}
                >
                  <span
                    className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-200 ${
                      isActive ? "bg-[#152147]" : "bg-transparent"
                    }`}
                  >
                    {renderMobileBottomIcon(item.iconType, isActive)}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] font-medium ${isActive ? "text-[#152147]" : "text-[#6B738C]"}`}>
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
