import { getComparePairPath, getComparePairSlugForIds, parseCompareIds } from "entities/product-compare";

/**
 * Decides the one URL a `/compare` request should be indexed under, and whether it should be
 * indexed at all. The sibling of `resolveCatalogCanonical`, and it exists for the same reason.
 *
 * The rules, in order:
 *  - Bare `/compare` is a landing page and self-canonicalizes. It is the page that answers
 *    "compare prices in Armenia", and until now the site had none.
 *  - `?ids=…` is one visitor's working selection. With 27 products there are thousands of
 *    them, all thin variations carrying the same products as each other, so it is kept out of
 *    the index and points back at the landing page.
 *  - unless that selection happens to be one of the generated pairs, in which case it points
 *    at that pair's own page — the pretty URL is the copy worth indexing, and pointing a
 *    duplicate at the landing page instead would waste the signal.
 *
 * @param {URLSearchParams | string} search — `location.search`
 * @returns {{ path: string, ids: string[], noIndex: boolean }}
 */
export const resolveCompareCanonical = (search) => {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const ids = parseCompareIds(params.get("ids"));

  if (ids.length === 0) {
    return { path: "/compare", ids, noIndex: false };
  }

  const pairSlug = getComparePairSlugForIds(ids);
  return {
    path: pairSlug ? getComparePairPath(pairSlug) : "/compare",
    ids,
    noIndex: true,
  };
};

export default resolveCompareCanonical;
