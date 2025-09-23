import { useState, useEffect } from "react";
import "./Header.css";
import { FaSearch, FaBalanceScale, FaUser, FaListUl, FaTimes } from "react-icons/fa";
import choozyMainLogo from "../../assets/Logos/choozyMainLogo.svg";
import { getSearchSuggestions, searchProducts } from "../../features/api/services/apiService";

const Header = () => {
  const [language, setLanguage] = useState("am");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNoResultsInDropdown, setShowNoResultsInDropdown] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const handleSearchInputChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      try {
        const suggestionsResponse = await getSearchSuggestions(query);
        if (suggestionsResponse.success) {
          if (suggestionsResponse.data.length > 0) {
            setSearchSuggestions(suggestionsResponse.data);
            setShowNoResultsInDropdown(false);
          } else {
            setSearchSuggestions([]);
            setShowNoResultsInDropdown(true);
          }
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSearchSuggestions([]);
        setShowNoResultsInDropdown(true);
        setShowSuggestions(true);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setShowNoResultsInDropdown(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    console.log('Search submitted:', searchQuery);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    console.log('Suggestion selected:', suggestion);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setShowNoResultsInDropdown(false);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.search-bar')) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <header className="header">
      <div className="header-container cont-width-default">
        <a href="/" className="logo-link" aria-label="Choozy Home">
          <img
            src={choozyMainLogo}
            alt="Choozy logo"
            className="main-choozy-logo"
          />
        </a>

        <nav aria-label="Main navigation" className="nav-left">
          <a href="#" className="header-nav-link">
            Մեր մասին
          </a>
        </nav>

        <form className="search-bar" role="search" onSubmit={handleSearchSubmit}>
          <FaSearch className="search-icon" />
          <input
            type="search"
            name="q"
            placeholder="Որոնել"
            aria-label="Որոնել"
            className="search-input"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            autoComplete="off"
            style={{ WebkitAppearance: 'none' }}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClearSearch}
              aria-label="Մաքրել որոնումը"
            >
              <FaTimes />
            </button>
          )}
              <button 
                type="submit" 
                className="search-btn"
              >
                Որոնել
              </button>
          
          {showSuggestions && (
            <div className="search-suggestions">
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))
              ) : showNoResultsInDropdown ? (
                <div className="no-results-item">
                  Արդյունքներ չեն գտնվել
                </div>
              ) : null}
            </div>
          )}
        </form>

        <nav className="nav-right" aria-label="User navigation">
          <a
            href="#"
            className="header-nav-link tooltip-container"
            data-tooltip="Համեմատել"
          >
            <FaBalanceScale size={20} />
            <span className="header-btn-text"> Համեմատել</span>
          </a>
          <a
            href="#"
            className="header-nav-link tooltip-container"
            data-tooltip="Նախընտրելի"
          >
            <FaListUl size={20} />
            <span className="header-btn-text"> Նախընտրելի</span>
          </a>

          <div className="profile-wrapper">
            <a
              href="#"
              className="profile-btn tooltip-container"
              data-tooltip="Մուտք"
            >
              <FaUser color="#152147" />
              <span className="profile-btn-text">Մուտք</span>
            </a>
          </div>

          <div className="lang-switcher" aria-label="Change language">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="language-btn"
              aria-label="Select language"
            >
              <img
                src={`https://flagcdn.com/w40/${language}.png`}
                alt={language}
                width="24"
                height="16"
                className="lang-flag"
              />
            </button>

            <div className={`custom-dropdown ${isOpen ? "open" : ""}`}>
              <div
                className="dropdown-item"
                onClick={() => handleLanguageChange("am")}
              >
                <img
                  src="https://flagcdn.com/w40/am.png"
                  alt="Հայերեն"
                  width="24"
                  height="16"
                  className="flag-option"
                />
                Հայ
              </div>
              <div
                className="dropdown-item"
                onClick={() => handleLanguageChange("en")}
              >
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="English"
                  width="24"
                  height="16"
                  className="flag-option"
                />
                Eng
              </div>
              <div
                className="dropdown-item"
                onClick={() => handleLanguageChange("ru")}
              >
                <img
                  src="https://flagcdn.com/w40/ru.png"
                  alt="Русский"
                  width="24"
                  height="16"
                  className="flag-option"
                />
                Рус
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  </div>
  );
};

export default Header;
