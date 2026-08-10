/**
 * Search Model — data layer for search functionality.
 * MVP: Model — data access only, no UI logic.
 */
import { getCatalogSearchSuggestions, PRODUCT_CATALOG } from "entities/product";
import { productMatchesSearch } from "entities/filter-catalog";
import { mockArmenianSuggestions } from "shared/api/mocks/mockData";

const MIN_QUERY_LENGTH = 2;

/**
 * A suggestion is only shown if picking it actually returns something. Suggestions navigate
 * to `/filter?q=<suggestion>`, so this asks the same question that page will: several
 * expansions named brands the catalog doesn't carry (PlayStation, Bose, Google Pixel), and
 * tapping one landed the visitor on an empty result set.
 */
const leadsToResults = (suggestion) =>
  PRODUCT_CATALOG.some((product) => productMatchesSearch(product, suggestion));

/**
 * Suggestions come from the real catalog plus a small set of Armenian search-term
 * expansions — previously this matched against a separate, disconnected mock product
 * list (`shared/api/services/apiService.js`'s `mockProducts`) that was never rendered
 * anywhere else on the site, so a suggestion could name a product with no actual page.
 */
export const fetchSuggestions = async (query) => {
  if (!query || query.length < MIN_QUERY_LENGTH) {
    return { success: true, data: [] };
  }

  const q = query.toLowerCase();
  const armenianMatches = Object.keys(mockArmenianSuggestions)
    .filter((key) => key.includes(q) || q.includes(key))
    .flatMap((key) => mockArmenianSuggestions[key])
    .filter(leadsToResults);

  const catalogMatches = getCatalogSearchSuggestions(query);

  const suggestions = [...new Set([...armenianMatches, ...catalogMatches])].slice(0, 6);
  return { success: true, data: suggestions };
};

export const searchModel = {
  MIN_QUERY_LENGTH,
  fetchSuggestions,
};

export default searchModel;
