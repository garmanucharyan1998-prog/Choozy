import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaHome,
  FaBalanceScale,
  FaUser,
  FaTimes,
  FaBars,
  FaChevronDown,
  FaRegHeart,
} from "react-icons/fa";
import { useHeaderPresenter } from "features/header";
import { LoginModal } from "features/login";
import { ACCOUNT_STORAGE_EVENT, readAccountState } from "entities/user";
import { useLanguage } from "contexts";
import choozyMainLogo from "shared/assets/logos/choozyMainLogo.svg";
import "./Header.css";

function FavoritesCountBadge({ text }) {
  if (text == null || text === "") {
    return null;
  }
  const sizeModifier =
    text.length >= 3
      ? "header-favorites-count-badge--compact-wide"
      : text.length >= 2
        ? "header-favorites-count-badge--wide"
        : "";
  return (
    <span
      className={`header-favorites-count-badge${sizeModifier ? ` ${sizeModifier}` : ""}`}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

const Header = ({
  isCompact = false,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onCloseMobileMenu,
}) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [wishlistCount, setWishlistCount] = useState(() => readAccountState().wishlistItems.length);
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
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    handleLoginSuccess,
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
    const syncWishlistCount = () => {
      setWishlistCount(readAccountState().wishlistItems.length);
    };
    syncWishlistCount();
    window.addEventListener(ACCOUNT_STORAGE_EVENT, syncWishlistCount);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, syncWishlistCount);
  }, []);

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
        className="flex shrink-0 justify-start no-underline"
        aria-label={t("header.brandAriaLabel")}
        title={t("header.brandTitle")}
      >
        <img
          src={choozyMainLogo}
          alt={t("header.brandAlt")}
          className={`h-auto shrink-0 transition-all duration-300 ${
            isCompact
              ? "w-[38px] sm:w-[72px] md:w-[78px] lg:w-[88px] 2xl:w-[100px]"
              : "w-[44px] sm:w-[80px] md:w-[88px] lg:w-[96px] 2xl:w-[100px]"
          }`}
          loading="eager"
        />
      </a>
    ),
    [isCompact, t],
  );

  const NavigationSection = useMemo(
    () => (
      <nav
        aria-label={t("header.mainNavigationAriaLabel")}
        className="hidden shrink-0 items-center gap-4 px-2 text-xs lg:flex lg:px-4 2xl:px-0"
      >
        <a
          href="/about"
          className={`mx-[5px] flex min-w-0 items-center justify-center gap-1 rounded-pill text-[#333] no-underline transition-all duration-300 hover:bg-accent-blue hover:duration-150 hover:scale-[1.15] lg:scale-100 lg:hover:scale-105 2xl:mx-0 ${
            isCompact
              ? "px-3 py-2 text-[11px] lg:px-3 lg:py-2 2xl:px-4 2xl:py-2.5"
              : "p-3 lg:p-3 2xl:px-5 2xl:py-3.5"
          }`}
          title={t("header.aboutLinkTitle")}
        >
          {t("header.aboutLinkLabel")}
        </a>
      </nav>
    ),
    [isCompact, t],
  );

  const SearchSection = useMemo(
    () => (
      <form
        className={`search-bar relative flex min-w-0 grow bg-input-bg rounded-pill border-[1.5px] border-accent-blue order-3 w-full md:order-none md:ml-3 md:w-auto md:max-w-[min(100%,280px)] lg:ml-4 lg:max-w-[min(100%,320px)] 2xl:ml-0 2xl:max-w-[400px] transition-all duration-300 ${
          isCompact ? "pt-1.5 sm:pt-2 md:pt-0" : "pt-2 sm:pt-3 md:pt-0"
        }`}
        role="search"
        onSubmit={handleSearchSubmit}
        aria-label={t("header.search.formAriaLabel")}
      >
        <FaSearch
          className={`text-[#888] self-center text-xs sm:text-sm transition-all duration-300 ${isCompact ? "mr-1 ml-2 sm:mr-1.5 sm:ml-3" : "mr-1.5 ml-2.5 sm:mr-2 sm:ml-[18px]"}`}
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          placeholder={t("header.search.placeholder")}
          aria-label={t("header.search.inputAriaLabel")}
          aria-describedby="search-help"
          className={`search-input border-none bg-subtle-bg grow text-xs sm:text-sm outline-none transition-all duration-300 ${
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
          {t("header.search.helpText")}
        </div>

        {searchQuery && (
          <button
            type="button"
            className={`bg-transparent border-none text-[#888] cursor-pointer flex items-center justify-center rounded-full transition-all duration-200 hover:bg-input-bg hover:text-[#666] lg:mr-0 ${
              isCompact ? "p-1.5 mr-2" : "p-2 mr-5"
            }`}
            onClick={handleClearSearch}
            aria-label={t("header.search.clearAriaLabel")}
            title={t("header.search.clearTitle")}
          >
            <FaTimes aria-hidden="true" />
          </button>
        )}

        <button
          type="submit"
          className={`shrink-0 rounded-pill border-none bg-accent-blue font-semibold text-link-blue transition-all duration-200 hover:enabled:scale-[1.02] hover:enabled:bg-[#c8d4ff] disabled:cursor-not-allowed disabled:opacity-70 2xl:ml-0 ${
            isCompact
              ? "-ml-[76px] px-2.5 py-1.5 text-[11px] sm:-ml-[86px] sm:px-3 sm:py-2 sm:text-xs md:-ml-12 md:px-2 md:py-2 lg:-ml-4 2xl:px-4 2xl:py-2.5 2xl:text-[13px]"
              : "-ml-[86px] px-3 py-2 text-xs sm:-ml-[100px] sm:px-4 sm:py-3 sm:text-[13px] md:-ml-14 md:px-2.5 md:py-2.5 lg:-ml-5 2xl:px-5 2xl:py-3.5 2xl:text-sm"
          }`}
          aria-label={t("header.search.submitAriaLabel")}
          disabled={!searchQuery.trim()}
        >
          <span className="md:hidden">{t("header.search.submitLabel")}</span>
          <FaSearch className="hidden md:inline 2xl:hidden" size={14} aria-hidden="true" />
          <span className="hidden 2xl:inline">{t("header.search.submitLabel")}</span>
        </button>

        {showSuggestions && (
          <div
            className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-subtle-bg border border-accent-blue rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-[1000] max-h-[280px] overflow-y-auto py-2"
            role="listbox"
            aria-label={t("header.search.resultsAriaLabel")}
          >
            {searchSuggestions.length > 0 ? (
              searchSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
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
                  aria-label={`${t("header.search.selectSuggestionPrefix")} ${suggestion}`}
                >
                  {suggestion}
                </div>
              ))
            ) : showNoResults ? (
              <div className="px-5 py-4 text-sm text-[#666] text-center" role="status" aria-live="polite">
                {t("header.search.noResults")}
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
      t,
    ],
  );

  const mobileBottomNavItems = useMemo(
    () => [
      {
        href: "/",
        label: t("header.mobileBottomNav.home.label"),
        ariaLabel: t("header.mobileBottomNav.home.ariaLabel"),
        iconType: "home",
      },
      {
        href: "/compare",
        label: t("header.mobileBottomNav.compare.label"),
        ariaLabel: t("header.mobileBottomNav.compare.ariaLabel"),
        iconType: "compare",
      },
      {
        href: "/account/favorite",
        label: t("header.mobileBottomNav.favorites.label"),
        ariaLabel: t("header.mobileBottomNav.favorites.ariaLabel"),
        iconType: "favorites",
      },
      {
        href: "/account",
        label: t("header.mobileBottomNav.profile.label"),
        ariaLabel: t("header.mobileBottomNav.profile.ariaLabel"),
        iconType: "profile",
        opensLogin: true,
      },
    ],
    [t],
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
            src="/assets/Icons/heart.svg"
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

  const favoritesCountBadge = (() => {
    if (wishlistCount <= 0) return null;
    if (wishlistCount > 999) return "999+";
    return String(wishlistCount);
  })();

  const favoritesLinkAriaLabel = favoritesCountBadge
    ? `${t("header.favoritesAriaLabel")}. ${t("header.favoritesCountForAria")}: ${favoritesCountBadge}.`
    : t("header.favoritesAriaLabel");

  const loginLinkClassName = isCompact
    ? "tooltip-container relative mx-[5px] inline-flex items-center justify-center gap-2 rounded-[40px] border border-solid border-black bg-transparent px-2.5 py-1.5 text-sm font-semibold text-black no-underline transition-colors duration-200 hover:bg-neutral-100 md:px-2.5 md:py-2 2xl:px-4 2xl:py-2"
    : "tooltip-container relative mx-[5px] inline-flex items-center justify-center gap-2 rounded-[40px] border border-solid border-black bg-transparent px-3 py-2 text-sm font-semibold text-black no-underline transition-colors duration-200 hover:bg-neutral-100 md:px-3 md:py-2.5 2xl:px-5 2xl:py-2.5";

  const UserNavigationSection = useMemo(
    () => (
      <nav
        className={`flex shrink-0 items-center transition-all duration-300 ${isCompact ? "gap-1 sm:gap-1.5 md:gap-1 2xl:gap-3" : "gap-1.5 sm:gap-2 md:gap-1 lg:gap-1.5 2xl:gap-4"}`}
        aria-label={t("header.userNavigationAriaLabel")}
      >
        <Link
          to="/compare"
          className={`tooltip-container relative mx-[5px] hidden min-w-0 items-center justify-center gap-1 rounded-pill text-[#333] no-underline transition-all duration-300 hover:bg-accent-blue hover:duration-150 hover:scale-[1.15] md:flex lg:scale-100 lg:hover:scale-105 2xl:mx-0 ${
            isCompact ? "p-2 2xl:px-4 2xl:py-2.5" : "p-2.5 2xl:px-5 2xl:py-3.5"
          }`}
          title={t("header.compareTitle")}
          aria-label={t("header.compareAriaLabel")}
        >
          <FaBalanceScale size={20} aria-hidden="true" />
          <span className="hidden 2xl:ml-[5px] 2xl:inline">
            {t("header.compareLabel")}
          </span>
        </Link>

        <Link
          to="/account/favorite"
          className={`tooltip-container relative mx-[5px] hidden min-w-0 items-center justify-center rounded-pill text-black no-underline transition-colors duration-200 hover:bg-accent-blue/40 hover:opacity-80 md:inline-flex 2xl:mx-0 2xl:gap-2 2xl:px-2 ${
            isCompact ? "p-2 2xl:py-1.5" : "p-2.5 2xl:py-2"
          }`}
          title={t("header.favoritesTitle")}
          aria-label={favoritesLinkAriaLabel}
        >
          <span className="relative inline-flex shrink-0">
            <FaRegHeart size={20} className="text-black" aria-hidden="true" />
            <FavoritesCountBadge text={favoritesCountBadge} />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-black 2xl:inline">
            <span className="whitespace-nowrap">{t("header.favoritesLabel")}</span>
          </span>
        </Link>

        <div className="hidden md:block">
          <button
            type="button"
            className={loginLinkClassName}
            title={t("header.loginTitle")}
            aria-label={t("header.loginAriaLabel")}
            onClick={openLoginModal}
          >
            <FaUser className="text-black" size={18} aria-hidden="true" />
            <span className="hidden whitespace-nowrap 2xl:inline">{t("header.loginLabel")}</span>
          </button>
        </div>

        <button
          type="button"
          className={`md:hidden flex items-center justify-center rounded-full bg-[#eceff3] text-navy border-none cursor-pointer transition-all duration-300 ease-in-out hover:bg-accent-blue hover:scale-105 ${
            isCompact ? "w-6 h-6 sm:w-7 sm:h-7" : "w-7 h-7 sm:w-8 sm:h-8"
          }`}
          aria-label={isMobileMenuOpen ? t("header.closeMenuAriaLabel") : t("header.openMenuAriaLabel")}
          aria-expanded={isMobileMenuOpen}
          onClick={handleMobileMenuToggle}
        >
          {isMobileMenuOpen ? (
            <FaTimes size={14} aria-hidden="true" />
          ) : (
            <FaBars size={14} aria-hidden="true" />
          )}
        </button>

        <div
          className="relative"
          data-language-switcher
          aria-label={t("header.languageSelectionAriaLabel")}
        >
          <button
            type="button"
            onClick={toggleLanguageDropdown}
            className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-0"
            aria-label={`${t("header.currentLanguagePrefix")}: ${currentLanguage.alt}`}
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
              className="absolute top-[calc(100%+8px)] right-1/2 z-50 min-w-[7.5rem] translate-x-1/2 overflow-hidden rounded-xl border border-[#d1d5db] bg-white py-1.5 shadow-[0_4px_14px_rgba(15,23,42,0.12)] md:right-0 md:translate-x-0"
              role="listbox"
              aria-label={t("header.selectLanguageAriaLabel")}
            >
              {Object.entries(languages).map(([code, lang]) => {
                const isActive = code === language;
                return (
                  <button
                    key={code}
                    type="button"
                    className={`flex w-full cursor-pointer items-center gap-2.5 whitespace-nowrap border-none px-3 py-2 text-start transition-colors hover:bg-[#f4f6fb] ${
                      isActive ? "bg-[#f8fafc]" : "bg-transparent"
                    } ${isCompact ? "py-1.5" : ""}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleLanguageChange(code)}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${lang.flag}.png`}
                      alt={lang.alt}
                      width="24"
                      height="24"
                      className={`${isCompact ? "h-5 w-5" : "h-6 w-6"} shrink-0 rounded-full border border-[#d1d5db] object-cover`}
                      loading="lazy"
                    />
                    <span className={`font-bold text-[#171717] ${isCompact ? "text-xs" : "text-sm"}`}>
                      {lang.name}
                    </span>
                  </button>
                );
              })}
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
      favoritesCountBadge,
      favoritesLinkAriaLabel,
      loginLinkClassName,
      openLoginModal,
      t,
    ],
  );

  const currentPath = location.pathname;

  return (
    <header
      ref={headerRef}
      className={`relative flex justify-center bg-transparent px-3 sm:px-5 lg:px-[50px] 2xl:px-[100px] transition-all duration-300 ${
        isCompact ? "py-2" : "py-3 sm:py-5"
      }`}
      role="banner"
    >
      <div className="cont-width-default flex min-w-0 flex-wrap items-center justify-between gap-2 font-bold text-[#171717] transition-all duration-300 md:flex-nowrap md:gap-2 lg:gap-3">
        {LogoSection}
        {NavigationSection}
        {SearchSection}
        {UserNavigationSection}
      </div>

      <aside
        className={`fixed top-[var(--header-height,72px)] right-0 z-40 w-[75vw] max-w-[300px] h-[calc(100vh-var(--header-height,72px))] bg-white border-l border-[#e6e9f2] px-3 py-5 sm:px-4 sm:py-6 shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform duration-[400ms] ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label={t("header.mobileNavigationAriaLabel")}
      >
        <h2 className="m-0 mb-6 text-base font-semibold text-[#171717]">
          {t("header.mobileMenuTitle")}
        </h2>
        <nav className="flex flex-col gap-6 items-start" aria-label={t("header.mobileLinksAriaLabel")}>
          {mobileMenuItems.map((item) => (
            <a
              key={item.id}
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
        aria-label={t("header.bottomNavigationAriaLabel")}
        style={{ bottom: "var(--mobile-viewport-offset-bottom, 0px)" }}
      >
        <ul className="m-0 flex list-none items-end justify-around px-2 sm:px-4 pt-2 pb-2 sm:pb-2.5">
          {mobileBottomNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? currentPath === "/"
                : item.href === "/account/favorite"
                  ? currentPath.startsWith("/account/favorite")
                  : item.href === "/account"
                    ? currentPath.startsWith("/account") && !currentPath.startsWith("/account/favorite")
                    : currentPath.startsWith(item.href);

            return (
              <li key={item.href} className="flex-1">
                {item.opensLogin ? (
                  <button
                    type="button"
                    className="flex w-full flex-col items-center justify-center gap-1 border-0 bg-transparent py-1.5 transition-colors duration-200"
                    aria-label={item.ariaLabel}
                    onClick={() => {
                      handleMobileMenuClose();
                      openLoginModal();
                    }}
                  >
                    <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-transparent transition-all duration-200">
                      {renderMobileBottomIcon(item.iconType, false)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-[#6B738C]">
                      {item.label}
                    </span>
                  </button>
                ) : (
                  <Link
                    to={item.href}
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
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default Header;
