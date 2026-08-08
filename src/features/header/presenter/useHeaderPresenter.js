/**
 * useHeaderPresenter — MVP Presenter for Header.
 * Manages search state, language state, passes to View.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { searchModel } from "entities/search";
import { headerModel } from "entities/header";
import { useLanguage } from "contexts";
import { useLocalizedNavigate } from "shared/lib/locale";

const { LANGUAGES, DEFAULT_LANGUAGE, MOBILE_MENU_ITEMS } = headerModel;
const { MIN_QUERY_LENGTH } = searchModel;

export const useHeaderPresenter = () => {
  const navigate = useLocalizedNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  /** Last query sent for suggestions — lets us drop out-of-order responses. */
  const lastSuggestionQueryRef = useRef("");

  const currentLanguage = useMemo(
    () => LANGUAGES[language] || LANGUAGES[DEFAULT_LANGUAGE],
    [language],
  );
  const mobileMenuItems = useMemo(
    () =>
      MOBILE_MENU_ITEMS.map((item) => ({
        ...item,
        label: t(item.labelKey, item.id),
      })),
    [t],
  );

  const handleLanguageChange = useCallback(
    (langCode) => {
      if (!LANGUAGES[langCode]) {
        return;
      }
      setLanguage(langCode);
      setIsLanguageDropdownOpen(false);
    },
    [setLanguage],
  );

  const toggleLanguageDropdown = useCallback(() => {
    setIsLanguageDropdownOpen((prev) => !prev);
  }, []);

  const openLoginModal = useCallback(() => {
    setIsLanguageDropdownOpen(false);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    navigate("/account");
  }, [navigate]);

  const handleSearchInputChange = useCallback(async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    const query = value.trim();
    lastSuggestionQueryRef.current = query;

    if (query.length >= MIN_QUERY_LENGTH) {
      try {
        const response = await searchModel.fetchSuggestions(query);
        if (lastSuggestionQueryRef.current !== query) {
          return;
        }
        if (response.success) {
          const hasResults = response.data.length > 0;
          setSearchSuggestions(response.data);
          setShowNoResults(!hasResults);
          setShowSuggestions(true);
        }
      } catch {
        if (lastSuggestionQueryRef.current !== query) {
          return;
        }
        setSearchSuggestions([]);
        setShowNoResults(true);
        setShowSuggestions(true);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setShowNoResults(false);
    }
  }, []);

  const navigateToFilterSearch = useCallback(
    (query) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      setShowSuggestions(false);
      navigate(`/filter?q=${encodeURIComponent(trimmed)}`);
    },
    [navigate],
  );

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      navigateToFilterSearch(searchQuery);
    },
    [searchQuery, navigateToFilterSearch],
  );

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      setSearchQuery(suggestion);
      navigateToFilterSearch(suggestion);
    },
    [navigateToFilterSearch],
  );

  const handleClearSearch = useCallback(() => {
    lastSuggestionQueryRef.current = "";
    setSearchQuery("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setShowNoResults(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.trim().length >= MIN_QUERY_LENGTH) {
      setShowSuggestions(true);
    }
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".search-bar")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!isLanguageDropdownOpen) {
      return undefined;
    }
    const handlePointerDown = (event) => {
      if (!event.target.closest("[data-language-switcher]")) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isLanguageDropdownOpen]);

  return {
    languages: LANGUAGES,
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
    handleSearchKeyDown,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    handleLoginSuccess,
  };
};

export default useHeaderPresenter;
