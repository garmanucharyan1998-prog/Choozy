/**
 * The finite set of "X vs Y" pages that exist as real, indexable URLs.
 *
 * A comparison built by a visitor lives in `?ids=` and is deliberately `noindex`: with 27
 * products there are thousands of possible selections, all of them thin variations on each
 * other, and `/filter?page=N` already taught this project what happens when an unbounded
 * family of URLs each claims to be canonical. So the crawlable half of the feature is this
 * list — derived from the catalog by a rule, never hand-maintained, so it cannot drift when
 * a product is added or repriced.
 *
 * **The rule:** within one category, sort by price and pair every product with the next two
 * above it. Two products people actually cross-shop are near each other in price, and the
 * distance-2 window keeps the count linear in catalog size (2n per category) instead of
 * quadratic — 13 laptops would otherwise be 78 pages of near-identical content.
 *
 * Slugs are built from the same `slugifyProductTitle` the product routes use, so
 * `/compare/<a>-vs-<b>` reads like `/singleproduct/<slug>~<id>` does. A slug is resolved by
 * exact lookup in the map below rather than by splitting on `-vs-`: a product whose own title
 * contained those characters would otherwise make the URL ambiguous.
 */
import { PRODUCT_CATALOG } from "entities/product";
import { slugifyProductTitle } from "entities/product-detail";

/** How far apart in the category's price order two products may be and still get a page. */
const NEIGHBOUR_DISTANCE = 2;

const catalogIndexById = new Map(PRODUCT_CATALOG.map((product, index) => [product.id, index]));

/**
 * Catalog order, not price order, decides which product is named first — price order would
 * reshuffle every slug (and 301 every indexed URL) the next time a price changed.
 */
const orderPair = (a, b) =>
  catalogIndexById.get(a.id) <= catalogIndexById.get(b.id) ? [a, b] : [b, a];

export const buildComparePairSlug = (a, b) =>
  `${slugifyProductTitle(a.title)}-vs-${slugifyProductTitle(b.title)}`;

const buildPairs = () => {
  const byCategory = new Map();
  PRODUCT_CATALOG.forEach((product) => {
    const bucket = byCategory.get(product.categoryId);
    if (bucket) bucket.push(product);
    else byCategory.set(product.categoryId, [product]);
  });

  const pairs = [];
  byCategory.forEach((products) => {
    /** Ties broken by catalog index so the generated list is stable across runs. */
    const sorted = [...products].sort(
      (a, b) =>
        a.priceValue - b.priceValue || catalogIndexById.get(a.id) - catalogIndexById.get(b.id),
    );

    sorted.forEach((product, index) => {
      for (let step = 1; step <= NEIGHBOUR_DISTANCE && index + step < sorted.length; step += 1) {
        const [first, second] = orderPair(product, sorted[index + step]);
        pairs.push({
          slug: buildComparePairSlug(first, second),
          ids: [first.id, second.id],
          categoryId: first.categoryId,
        });
      }
    });
  });

  return pairs;
};

/** @type {{ slug: string, ids: [string, string], categoryId: string }[]} */
export const COMPARE_PAIRS = buildPairs();

const pairsBySlug = new Map(COMPARE_PAIRS.map((pair) => [pair.slug, pair]));

/**
 * `<b>-vs-<a>` for every pair: a real URL people will type and link, and one that must 301
 * onto the canonical order rather than serve the same table at a second address.
 */
const canonicalSlugByReversedSlug = new Map(
  COMPARE_PAIRS.map((pair) => {
    const [a, b] = pair.ids.map((id) => PRODUCT_CATALOG[catalogIndexById.get(id)]);
    return [buildComparePairSlug(b, a), pair.slug];
  }),
);

/** A selection, in any order, reduced to the key its pair is stored under. */
const pairKey = (ids) =>
  [...ids].sort((a, b) => catalogIndexById.get(a) - catalogIndexById.get(b)).join("|");

const pairsByIdKey = new Map(COMPARE_PAIRS.map((pair) => [pairKey(pair.ids), pair]));

export const getComparePairs = () => COMPARE_PAIRS;

/** @returns {{ slug: string, ids: [string, string], categoryId: string } | null} */
export const getComparePairBySlug = (slug) => pairsBySlug.get(String(slug ?? "").trim()) ?? null;

/**
 * The canonical slug a reversed URL should be redirected to, or `null` when the slug is not a
 * reversal of anything known (in which case it is simply a 404, not a redirect).
 */
export const getCanonicalSlugForReversed = (slug) =>
  canonicalSlugByReversedSlug.get(String(slug ?? "").trim()) ?? null;

/**
 * Does this exact selection already have a pretty page? Used by the canonical rule: a
 * `?ids=` URL that happens to name a known pair should point at that page rather than at the
 * bare `/compare` landing.
 *
 * @param {string[]} ids
 * @returns {string | null}
 */
export const getComparePairSlugForIds = (ids) => {
  if (!Array.isArray(ids) || ids.length !== 2) return null;
  return pairsByIdKey.get(pairKey(ids))?.slug ?? null;
};

/** `/compare/<slug>` — language-agnostic, to be run through `localizedPath` by the caller. */
export const getComparePairPath = (slug) => `/compare/${slug}`;
