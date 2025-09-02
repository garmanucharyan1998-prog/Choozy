import { useState } from "react";
import "./Header.css";
import { FaSearch, FaBalanceScale, FaUser, FaListUl } from "react-icons/fa";
import choozyMainLogo from "../../assets/Logos/choozyMainLogo.svg";

const Header = () => {
  const [language, setLanguage] = useState("am"); // Default language is Armenian
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
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

        <form className="search-bar" role="search">
          <FaSearch className="search-icon" />
          <input
            type="search"
            name="q"
            placeholder="Որոնել"
            aria-label="Որոնել"
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Որոնել
          </button>
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

          {/* Custom Language Dropdown */}
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
  );
};

export default Header;
