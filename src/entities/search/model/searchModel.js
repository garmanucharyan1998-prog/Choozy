/**
 * Search Model — data layer for search functionality.
 * MVP: Model — data access only, no UI logic.
 */

import { getSearchSuggestions, searchProducts } from "shared/api";

const MIN_QUERY_LENGTH = 2;

export const fetchSuggestions = async (query) => {
  if (!query || query.length < MIN_QUERY_LENGTH) {
    return { success: true, data: [] };
  }
  return getSearchSuggestions(query);
};

export const submitSearch = async (query, options = {}) => {
  if (!query || !query.trim()) {
    return { success: true, data: [], message: "Empty query" };
  }
  return searchProducts(query, options);
};

export const searchModel = {
  MIN_QUERY_LENGTH,
  fetchSuggestions,
  submitSearch,
};

export default searchModel;
