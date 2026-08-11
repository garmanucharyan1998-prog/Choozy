/**
 * What "the things being compared" means, as pure data — no React, no storage, no DOM.
 *
 * Compare used to be four independent `useState(() => ({}))` maps (the filter catalog, both
 * account dashboard tabs, related products, the carousel), each flipping its own
 * `aria-pressed` and forgetting everything on unmount. Nothing agreed with anything else and
 * no two of them could ever be looking at the same selection, so this module is the one
 * answer to "what is selected" that all of them now share.
 *
 * Two rules are enforced here rather than in the UI, because every entry point has to obey
 * them identically:
 *  - at most `MAX_COMPARE_ITEMS` products, and
 *  - all of them from one category.
 *
 * The category rule is not arbitrary: `buildSpecsForProduct` emits a *different set of rows*
 * per category (a laptop has screen/storage/RAM/battery/year, a camera has only year), so a
 * table mixing a TV with a pair of headphones would be mostly dashes. Rejecting the mix is
 * more honest than rendering an empty grid.
 */
import { getCatalogProductById } from "entities/product";

/** Four columns is what fits on a desktop table before the labels stop being readable. */
export const MAX_COMPARE_ITEMS = 4;

/** Why an `addToCompare` call did nothing — surfaced to the visitor by `CompareNotice`. */
export const COMPARE_REJECTION = {
  LIMIT: "limit",
  CATEGORY: "category",
};

/**
 * Drops everything that cannot legally be in a selection, in one pass and in one place, so
 * that a hand-typed `?ids=`, a stale `localStorage` entry written by an older build, and a
 * click on a card all converge on the same list.
 *
 * Order is the order of first appearance: it is the order the visitor built, and — when the
 * list came from a URL — the column order whoever shared the link saw.
 *
 * @param {string[]} ids
 * @returns {string[]}
 */
export const normalizeCompareIds = (ids) => {
  if (!Array.isArray(ids)) return [];

  const seen = new Set();
  let categoryId = null;
  const result = [];

  for (const rawId of ids) {
    const id = typeof rawId === "string" ? rawId.trim() : "";
    if (!id || seen.has(id)) continue;

    const product = getCatalogProductById(id);
    if (!product) continue;

    /** The first survivor fixes the category; anything else is silently dropped. */
    if (categoryId === null) categoryId = product.categoryId;
    else if (product.categoryId !== categoryId) continue;

    seen.add(id);
    result.push(id);
    if (result.length === MAX_COMPARE_ITEMS) break;
  }

  return result;
};

/**
 * `"fp-1,fp-4"` → `["fp-1", "fp-4"]`. Accepts anything (a missing param, an array already,
 * garbage) because the callers are a URL and `localStorage`, neither of which is trustworthy.
 *
 * @param {string | string[] | null | undefined} raw
 * @returns {string[]}
 */
export const parseCompareIds = (raw) => {
  if (raw == null) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  return normalizeCompareIds(list);
};

/** The inverse of `parseCompareIds`, and the single format used by both the URL and storage. */
export const serializeCompareIds = (ids) => normalizeCompareIds(ids).join(",");

/** The category every member of the selection belongs to, or `null` when it is empty. */
export const compareCategoryId = (ids) => {
  const [first] = normalizeCompareIds(ids);
  return first ? getCatalogProductById(first).categoryId : null;
};

/**
 * @param {string[]} ids
 * @param {string} productId
 * @returns {{ ids: string[], rejected: string | null }} `ids` is unchanged when rejected.
 */
export const addToCompare = (ids, productId) => {
  const current = normalizeCompareIds(ids);
  const product = getCatalogProductById(productId);

  /** An id that matches no product is not a rejection worth explaining — it is a bad call. */
  if (!product) return { ids: current, rejected: null };
  if (current.includes(product.id)) return { ids: current, rejected: null };

  const categoryId = compareCategoryId(current);
  if (categoryId !== null && categoryId !== product.categoryId) {
    return { ids: current, rejected: COMPARE_REJECTION.CATEGORY };
  }
  /**
   * Checked after the category, deliberately: told "wrong category" a visitor removes the
   * odd one out, told "list is full" they remove anything. Reporting the limit for a product
   * that could never have been added regardless would send them down the wrong path.
   */
  if (current.length >= MAX_COMPARE_ITEMS) {
    return { ids: current, rejected: COMPARE_REJECTION.LIMIT };
  }

  return { ids: [...current, product.id], rejected: null };
};

/** @returns {string[]} */
export const removeFromCompare = (ids, productId) =>
  normalizeCompareIds(ids).filter((id) => id !== productId);

/**
 * @returns {{ ids: string[], rejected: string | null }}
 */
export const toggleCompare = (ids, productId) => {
  const current = normalizeCompareIds(ids);
  return current.includes(productId)
    ? { ids: removeFromCompare(current, productId), rejected: null }
    : addToCompare(current, productId);
};

/** The catalog records behind a selection, in selection order. */
export const getCompareProducts = (ids) =>
  normalizeCompareIds(ids).map((id) => getCatalogProductById(id));
