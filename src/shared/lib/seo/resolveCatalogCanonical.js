/**
 * Decides the one URL a `/filter` request should be indexed under, and whether it should be
 * indexed at all.
 *
 * `/filter` used to hardcode `path: "/filter"` for every combination of query parameters,
 * while the sitemap advertised eight `?category=` URLs per language. Google fetched all 24,
 * read a canonical pointing at bare `/filter`, and dropped them — so the highest-intent
 * landing pages on the site could not rank, and the sitemap contradicted the pages it listed.
 *
 * The rules, in order:
 *  - A known `category` is a real landing page and self-canonicalizes, carrying `page` when
 *    the visitor is deeper in that category's pagination.
 *  - Any other facet (brand, storage, screen, colour, price, sort, search, page size) is a
 *    filtered *view* of a landing page, not a page of its own: it canonicalizes up to the
 *    category (or to bare `/filter`) and is left out of the index, because there are
 *    thousands of such combinations and they carry the same products as their parent.
 *  - `page` alone is a self-canonical, indexable page — dropping it would tell Google that
 *    page 3 is a duplicate of page 1 and hide everything past the first page.
 *
 * @param {URLSearchParams | string} search — `location.search`
 * @param {(categoryId: string) => boolean} isKnownCategory
 * @param {(categoryId: string | null) => number} countPages — how many pages that landing page really has
 * @returns {{ path: string, categoryId: string | null, page: number, noIndex: boolean }}
 */
export const resolveCatalogCanonical = (search, isKnownCategory, countPages = () => Infinity) => {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;

  const rawCategory = params.get("category");
  const categoryId = rawCategory && isKnownCategory(rawCategory) ? rawCategory : null;

  /**
   * Clamped against the real page count, the same way the presenter clamps it for rendering.
   * Without an upper bound the head advertised a page the body never rendered: every category
   * fits on one page, so `?page=50` served page 1's products under a self-referencing
   * canonical claiming to be page 50 — an unbounded family of indexable URLs all serving
   * identical HTML, each telling a search engine it is *not* a duplicate of the others.
   */
  const rawPage = Number(params.get("page"));
  const requestedPage = Number.isInteger(rawPage) && rawPage > 1 ? rawPage : 1;
  const totalPages = Math.max(1, countPages(categoryId));
  const page = Math.min(requestedPage, totalPages);
  /** Past the end is a made-up URL: canonicalize onto the real last page and keep it out. */
  const isPageOutOfRange = requestedPage > totalPages;

  /**
   * Everything that narrows results without being a landing page of its own. `perPage` is
   * here too: the same products in a different batch size is not a different page.
   */
  const NARROWING_PARAMS = [
    "brand",
    "storage",
    "screen",
    "color",
    "priceMin",
    "priceMax",
    "sort",
    "q",
    "perPage",
  ];
  const isNarrowed = NARROWING_PARAMS.some((key) => {
    const value = params.get(key);
    return value != null && value !== "";
  });

  /** An unknown `?category=` value is a made-up URL — index the page it falls back to, not it. */
  const hasBogusCategory = Boolean(rawCategory) && !categoryId;

  const base = categoryId ? `/filter?category=${encodeURIComponent(categoryId)}` : "/filter";
  const canonicalPath = isNarrowed || page === 1 ? base : `${base}${categoryId ? "&" : "?"}page=${page}`;

  return {
    path: canonicalPath,
    categoryId,
    page,
    noIndex: isNarrowed || hasBogusCategory || isPageOutOfRange,
  };
};

export default resolveCatalogCanonical;
