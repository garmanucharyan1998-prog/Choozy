import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COMPARE_STORAGE_EVENT,
  notifyCompareRejected,
  readCompareIds,
  toggleCompare as toggleCompareSelection,
  writeCompareIds,
} from "entities/product-compare";

/**
 * The compare state for a list of product cards: which ids are selected, how many, and how
 * to flip one.
 *
 * Replaces four separate `useState(() => ({}))` maps — the filter catalog, both account
 * dashboard tabs, related products and the carousel each kept their own, so a product marked
 * for comparison in one list was unmarked everywhere else and gone on unmount. They now all
 * read the same store, and the header's badge counts the same thing they do.
 *
 * Lives in `features` for the same reason `useProductWishlist` does: `shared/ui`'s carousel
 * and card are presentational and may not reach into `entities`, so they take `compareIds`
 * and `onToggleCompare` as props from whoever owns them.
 *
 * @returns {{ compareIds: Set<string>, compareOrder: string[], compareCount: number,
 *   toggleCompare: (product: object | string) => void }}
 */
export const useProductCompare = () => {
  /**
   * Starts empty, matching the server, which has no `localStorage`. Reading real state in the
   * initializer is what produced React #418 on the home page's carousels, and in dev that
   * mismatch takes Vite's CSS injection down with it and serves the page as raw HTML.
   */
  const [compareOrder, setCompareOrder] = useState(() => []);

  useEffect(() => {
    const sync = () => setCompareOrder(readCompareIds());
    sync();
    window.addEventListener(COMPARE_STORAGE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_STORAGE_EVENT, sync);
  }, []);

  /** Derived, not stored: a fresh `Set` per render would defeat every memo downstream. */
  const compareIds = useMemo(() => new Set(compareOrder), [compareOrder]);

  const toggleCompare = useCallback((productOrId) => {
    const productId = typeof productOrId === "string" ? productOrId : productOrId?.id;
    if (!productId) return;

    /**
     * Read through to storage rather than trusting this hook's own copy: several of these
     * hooks are mounted at once (header badge, catalog grid, carousel) and the one being
     * clicked must not overwrite a change another just made.
     */
    const { ids, rejected } = toggleCompareSelection(readCompareIds(), productId);
    if (rejected) {
      notifyCompareRejected(rejected);
      return;
    }
    setCompareOrder(writeCompareIds(ids));
  }, []);

  return { compareIds, compareOrder, compareCount: compareOrder.length, toggleCompare };
};

export default useProductCompare;
