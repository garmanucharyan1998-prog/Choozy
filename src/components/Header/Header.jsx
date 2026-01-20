import { useState, useEffect, useCallback, useMemo } from "react";
import "./Header.css";
import { FaSearch, FaBalanceScale, FaUser, FaTimes } from "react-icons/fa";
import choozyMainLogo from "../../assets/Logos/choozyMainLogo.svg";
import { getSearchSuggestions, searchProducts } from "../../features/api/services/apiService";

// Constants for better maintainability
const MIN_SEARCH_LENGTH = 2;
const LANGUAGES = {
  am: { code: "am", name: "Հայ", flag: "am", alt: "Հայերեն" },
  en: { code: "en", name: "Eng", flag: "gb", alt: "English" },
  ru: { code: "ru", name: "Рус", flag: "ru", alt: "Русский" }
};

const Header = () => {
  // State management
  const [language, setLanguage] = useState("am");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNoResultsInDropdown, setShowNoResultsInDropdown] = useState(false);

  // Memoized current language data
  const currentLanguage = useMemo(() => LANGUAGES[language], [language]);

  // Language handling
  const handleLanguageChange = useCallback((langCode) => {
    setLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  }, []);

  const toggleLanguageDropdown = useCallback(() => {
    setIsLanguageDropdownOpen(prev => !prev);
  }, []);

  // Search functionality
  const handleSearchInputChange = useCallback(async (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
    
    if (query.length >= MIN_SEARCH_LENGTH) {
      try {
        const suggestionsResponse = await getSearchSuggestions(query);
        if (suggestionsResponse.success) {
          const hasResults = suggestionsResponse.data.length > 0;
          setSearchSuggestions(suggestionsResponse.data);
          setShowNoResultsInDropdown(!hasResults);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error getting search suggestions:', error);
        setSearchSuggestions([]);
        setShowNoResultsInDropdown(true);
        setShowSuggestions(true);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setShowNoResultsInDropdown(false);
    }
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      // TODO: Implement actual search functionality
      console.log('Search submitted:', searchQuery);
    }
  }, [searchQuery]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    console.log('Suggestion selected:', suggestion);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setShowNoResultsInDropdown(false);
  }, []);

  const handleClickOutside = useCallback((e) => {
    if (!e.target.closest('.search-bar')) {
      setShowSuggestions(false);
    }
  }, []);

  // Event listeners
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Memoized components for better performance
  const LogoSection = useMemo(() => (
    <a 
      href="/" 
      className="logo-link" 
      aria-label="Choozy - Main page"
      title="Choozy - Electronics online store"
    >
      <img
        src={choozyMainLogo}
        alt="Choozy - Electronics online store logo"
        className="main-choozy-logo"
        loading="eager"
      />
    </a>
  ), []);

  const NavigationSection = useMemo(() => (
    <nav aria-label="Main navigation" className="about-us-link">
      <a 
        href="/about" 
        className="header-nav-link"
        title="Learn more about Choozy company"
      >
        Մեր մասին
      </a>
    </nav>
  ), []);

  const SearchSection = useMemo(() => (
    <form 
      className="search-bar" 
      role="search" 
      onSubmit={handleSearchSubmit}
      aria-label="Product search"
    >
      <FaSearch className="search-icon" aria-hidden="true" />
      <input
        type="search"
        name="q"
        placeholder="Որոնել"
        aria-label="Search for products and services"
        aria-describedby="search-help"
        className="search-input"
        value={searchQuery}
        onChange={handleSearchInputChange}
        onFocus={() => searchQuery.length >= MIN_SEARCH_LENGTH && setShowSuggestions(true)}
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
          className="clear-btn"
          onClick={handleClearSearch}
          aria-label="Clear search"
          title="Clear search field"
        >
          <FaTimes aria-hidden="true" />
        </button>
      )}
      
      <button 
        type="submit" 
        className="search-btn"
        aria-label="Execute search"
        disabled={!searchQuery.trim()}
      >
        Որոնել
      </button>
      
      {showSuggestions && (
        <div 
          className="search-suggestions" 
          role="listbox" 
          aria-label="Search results"
        >
          {searchSuggestions.length > 0 ? (
            searchSuggestions.map((suggestion, index) => (
              <div
                key={`suggestion-${index}`}
                className="suggestion-item"
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
          ) : showNoResultsInDropdown ? (
            <div className="no-results-item" role="status" aria-live="polite">
              Արդյունքներ չեն գտնվել
            </div>
          ) : null}
        </div>
      )}
    </form>
  ), [searchQuery, searchSuggestions, showSuggestions, showNoResultsInDropdown, handleSearchInputChange, handleSearchSubmit, handleClearSearch, handleSuggestionClick]);

  const UserNavigationSection = useMemo(() => (
    <nav className="nav-right" aria-label="User navigation">
      <a
        href="/compare"
        className="header-nav-link tooltip-container"
        title="Compare products"
        aria-label="Compare selected products"
      >
        <FaBalanceScale size={20} aria-hidden="true" />
        <span className="header-btn-text">Համեմատել</span>
      </a>
      
      <a
        href="/favorites"
        className="header-nav-link tooltip-container"
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
        <span className="header-btn-text">Նախընտրելի</span>
      </a>

      <div className="profile-wrapper">
        <a
          href="/login"
          className="profile-btn tooltip-container"
          title="Login to account"
          aria-label="Login to personal cabinet"
        >
          <FaUser color="#152147" aria-hidden="true" />
          <span className="profile-btn-text">Մուտք</span>
        </a>
      </div>

      <div className="lang-switcher" aria-label="Language selection">
        <button
          onClick={toggleLanguageDropdown}
          className="language-btn"
          aria-label={`Current language: ${currentLanguage.alt}`}
          aria-expanded={isLanguageDropdownOpen}
          aria-haspopup="listbox"
        >
          <img
            src={`https://flagcdn.com/w40/${currentLanguage.flag}.png`}
            alt={currentLanguage.alt}
            width="24"
            height="16"
            className="lang-flag"
            loading="lazy"
          />
        </button>

        <div 
          className={`custom-dropdown ${isLanguageDropdownOpen ? "open" : ""}`}
          role="listbox"
          aria-label="Select language"
        >
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <div
              key={code}
              className="lang-dropdown-item"
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
                className="flag-option"
                loading="lazy"
              />
              <span className="lang-btn-text">{lang.name}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  ), [currentLanguage, isLanguageDropdownOpen, language, toggleLanguageDropdown, handleLanguageChange]);

  return (
    <header className="header" role="banner">
      <div className="header-container cont-width-default">
        {LogoSection}
        {NavigationSection}
        {SearchSection}
        {UserNavigationSection}
      </div>
    </header>
  );
};

export default Header;
