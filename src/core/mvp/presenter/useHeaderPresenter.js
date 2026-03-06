/**
 * useHeaderPresenter — MVP Presenter for Header.
 * Manages search state, language state, passes to View.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { searchModel } from '../model/searchModel';
import { headerModel } from '../model/headerModel';

const { LANGUAGES, DEFAULT_LANGUAGE } = headerModel;
const { MIN_QUERY_LENGTH } = searchModel;

export const useHeaderPresenter = () => {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);

  const currentLanguage = useMemo(() => LANGUAGES[language], [language]);

  const handleLanguageChange = useCallback((langCode) => {
    setLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  }, []);

  const toggleLanguageDropdown = useCallback(() => {
    setIsLanguageDropdownOpen((prev) => !prev);
  }, []);

  const handleSearchInputChange = useCallback(async (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);

    if (query.length >= MIN_QUERY_LENGTH) {
      try {
        const response = await searchModel.fetchSuggestions(query);
        if (response.success) {
          const hasResults = response.data.length > 0;
          setSearchSuggestions(response.data);
          setShowNoResults(!hasResults);
          setShowSuggestions(true);
        }
      } catch {
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

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowSuggestions(false);
      }
    },
    [searchQuery],
  );

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setShowNoResults(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.length >= MIN_QUERY_LENGTH) {
      setShowSuggestions(true);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.search-bar')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return {
    languages: LANGUAGES,
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
  };
};

export default useHeaderPresenter;
