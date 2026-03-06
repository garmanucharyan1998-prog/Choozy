import { useMemo } from "react";
import "./Header.css";
import { FaSearch, FaBalanceScale, FaUser, FaTimes } from "react-icons/fa";
import choozyMainLogo from "../../assets/Logos/choozyMainLogo.svg";
import { useHeaderPresenter } from "../../core/mvp/presenter";

const Header = () => {
  const {
    languages,
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

  const LogoSection = useMemo(() => (
    <a
      href="/"
      className="no-underline flex justify-start"
      aria-label="Choozy - Main page"
      title="Choozy - Electronics online store"
    >
      <img
        src={choozyMainLogo}
        alt="Choozy - Electronics online store logo"
        className="w-[55px] h-auto sm:w-[100px]"
        loading="eager"
      />
    </a>
  ), []);

  const NavigationSection = useMemo(() => (
    <nav aria-label="Main navigation" className="flex items-center gap-4 text-xs px-[10px] lg:px-[70px] 2xl:px-0">
      <a
        href="/about"
        className="no-underline text-[#333] flex items-center p-3.5 rounded-pill gap-1 min-w-0 mx-[5px] justify-center scale-[1.1] hover:scale-[1.15] hover:duration-150 hover:bg-accent-blue lg:scale-100 lg:hover:scale-105 2xl:px-5 2xl:py-3.5 2xl:mx-0"
        title="Learn more about Choozy company"
      >
        {"Մեր մասին"}
      </a>
    </nav>
  ), []);

  const SearchSection = useMemo(() => (
    <form
      className="relative flex bg-input-bg rounded-pill grow border-[1.5px] border-accent-blue order-3 w-full mt-3 md:order-none md:w-auto md:mt-0 md:ml-5 2xl:max-w-[400px] 2xl:ml-0"
      role="search"
      onSubmit={handleSearchSubmit}
      aria-label="Product search"
    >
      <FaSearch className="text-[#888] mr-2 ml-[18px] self-center" aria-hidden="true" />
      <input
        type="search"
        name="q"
        placeholder={"Որոնել"}
        aria-label="Search for products and services"
        aria-describedby="search-help"
        className="search-input border-none bg-transparent p-3 grow text-sm outline-none 2xl:p-4"
        value={searchQuery}
        onChange={handleSearchInputChange}
        onFocus={handleSearchFocus}
        autoComplete="off"
        style={{ WebkitAppearance: 'none' }}
        maxLength="100"
      />
      <div id="search-help" className="sr-only">
        Enter at least 2 characters to search
      </div>

      {searchQuery && (
        <button
          type="button"
          className="bg-transparent border-none text-[#888] cursor-pointer p-2 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-input-bg hover:text-[#666] mr-5 lg:mr-0"
          onClick={handleClearSearch}
          aria-label="Clear search"
          title="Clear search field"
        >
          <FaTimes aria-hidden="true" />
        </button>
      )}

      <button
        type="submit"
        className="bg-accent-blue border-none px-4 py-3 rounded-pill text-active-blue font-semibold cursor-pointer transition-all duration-200 text-[13px] -ml-[100px] hover:enabled:bg-[#c8d4ff] hover:enabled:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed lg:-ml-5 2xl:px-5 2xl:py-3.5 2xl:text-sm 2xl:ml-0"
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
                tabIndex={0}
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
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
  ), [searchQuery, searchSuggestions, showSuggestions, showNoResults, handleSearchInputChange, handleSearchSubmit, handleClearSearch, handleSuggestionClick, handleSearchFocus]);

  const UserNavigationSection = useMemo(() => (
    <nav className="flex items-center gap-[5px] 2xl:gap-4" aria-label="User navigation">
      <a
        href="/compare"
        className="tooltip-container relative no-underline text-[#333] flex items-center p-3.5 rounded-pill gap-1 min-w-0 mx-[5px] justify-center scale-[1.1] hover:scale-[1.15] hover:duration-150 hover:bg-accent-blue lg:scale-100 lg:hover:scale-105 2xl:px-5 2xl:py-3.5 2xl:mx-0"
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
        className="tooltip-container relative no-underline text-[#333] flex items-center p-3.5 rounded-pill gap-1 min-w-0 mx-[5px] justify-center scale-[1.1] hover:scale-[1.15] hover:duration-150 hover:bg-accent-blue lg:scale-100 lg:hover:scale-105 2xl:px-5 2xl:py-3.5 2xl:mx-0"
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
          className="tooltip-container relative flex items-center gap-1.5 bg-white border-[1.5px] border-navy p-3.5 rounded-[40px] text-active-blue no-underline min-w-0 mx-[5px] justify-center 2xl:px-5 2xl:py-3.5 2xl:mx-0"
          title="Login to account"
          aria-label="Login to personal cabinet"
        >
          <FaUser color="#152147" aria-hidden="true" />
          <span className="hidden 2xl:inline 2xl:ml-[5px]">
            {"Մուտք"}
          </span>
        </a>
      </div>

      <div className="relative" aria-label="Language selection">
        <button
          onClick={toggleLanguageDropdown}
          className="bg-transparent border-none cursor-pointer p-0 flex items-center"
          aria-label={`Current language: ${currentLanguage.alt}`}
          aria-expanded={isLanguageDropdownOpen}
          aria-haspopup="listbox"
        >
          <img
            src={`https://flagcdn.com/w40/${currentLanguage.flag}.png`}
            alt={currentLanguage.alt}
            width="24"
            height="16"
            className="w-6 h-6 rounded-full border border-[#ccc]"
            loading="lazy"
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
                className="flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer transition-colors duration-200 hover:bg-[#f1f1f1] md:justify-start"
                role="option"
                aria-selected={code === language}
                onClick={() => handleLanguageChange(code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
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
                  className="w-6 h-6 rounded-full border border-[#ccc] flex-shrink-0"
                  loading="lazy"
                />
                <span className="hidden md:inline ml-2 text-sm">{lang.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  ), [currentLanguage, isLanguageDropdownOpen, language, toggleLanguageDropdown, handleLanguageChange, languages]);

  return (
    <header className="flex justify-center bg-[#c0caec26] px-5 py-5 lg:px-[50px] 2xl:px-[100px]" role="banner">
      <div className="flex flex-wrap items-center text-[#171717] font-bold justify-between cont-width-default md:flex-nowrap">
        {LogoSection}
        {NavigationSection}
        {SearchSection}
        {UserNavigationSection}
      </div>
    </header>
  );
};

export default Header;
