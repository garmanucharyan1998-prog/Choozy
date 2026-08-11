import { PRODUCT_CATALOG } from "./productCatalog";

/** Must match the presenter's DEFAULT_PAGE_SIZE — the size a canonical URL implies. */
export const DEFAULT_CATALOG_PAGE_SIZE = 20;

/** Home page "top products" carousel — was a separate hand-copied `top-N` list. */
export const getTopCatalogProducts = () => PRODUCT_CATALOG.filter((p) => p.homeSection === "top");

/** Home page "variety" carousel — was a separate hand-copied `var-N` list. */
export const getVarietyCatalogProducts = () =>
  PRODUCT_CATALOG.filter((p) => p.homeSection === "variety");

/**
 * Related products for a product detail page: other items in the same category,
 * cheapest-shared-relevance first (same category, excluding the product itself),
 * capped at 8 — was a separate hand-copied `rel-N` list whose title/price/image were
 * independent copies of the real catalog entries and could silently drift out of sync.
 *
 * @param {{ id: string, categoryId: string }} product
 * @param {number} [limit]
 */
export const getRelatedProducts = (product, limit = 8) => {
  if (!product) return [];
  const sameCategory = PRODUCT_CATALOG.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const rest = PRODUCT_CATALOG.filter(
    (p) => p.categoryId !== product.categoryId && p.id !== product.id,
  );
  return [...sameCategory, ...rest].slice(0, limit);
};

/**
 * Search-suggestion text matching over the real catalog — previously
 * `getSearchSuggestions` matched against a wholly separate, disconnected mock product
 * list (English-only, USD-priced, never rendered anywhere as an actual product), so a
 * suggestion could name a product that didn't exist anywhere else on the site.
 *
 * @param {string} query
 * @param {number} [limit]
 */
export const getCatalogSearchSuggestions = (query, limit = 6) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches = PRODUCT_CATALOG.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brandId.toLowerCase().includes(q) ||
      p.categoryId.toLowerCase().includes(q),
  );
  return matches.slice(0, limit).map((p) => p.title);
};

/**
 * How many pages a catalog landing page really has, at the default page size.
 *
 * Exported so the SEO layer can clamp `?page=` the same way the presenter does. They used to
 * disagree: the presenter clamped for rendering while `meta()` did not, so `?page=50` served
 * page 1's products under a canonical claiming to be page 50.
 *
 * @param {string | null} categoryId — `null` for the unfiltered catalog
 * @param {number} [pageSize]
 */
export const getCatalogPageCount = (categoryId, pageSize = DEFAULT_CATALOG_PAGE_SIZE) => {
  const total = categoryId
    ? PRODUCT_CATALOG.filter((p) => p.categoryId === categoryId).length
    : PRODUCT_CATALOG.length;
  return Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
};
