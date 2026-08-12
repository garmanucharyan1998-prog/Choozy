import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useLanguage } from "contexts";
import {
  MAX_COMPARE_ITEMS,
  getCompareProducts,
  readCompareIds,
  removeFromCompare,
  writeCompareIds,
} from "entities/product-compare";
import { useProductCompare } from "features/product-compare";
import { stripLanguageFromPath } from "shared/lib/locale/localizedPath";

/**
 * State for the site-wide compare tray.
 *
 * Reads the same store every compare button writes to, so the tray is not a second source of
 * truth: `useProductCompare` syncs through `localStorage` plus a `CustomEvent`, which is what
 * lets a click in the home page carousel and the header's badge and this bar all agree without
 * any of them owning the selection.
 *
 * Hidden on `/compare` and its pair pages: the table there *is* the tray, and a floating copy of
 * the same thumbnails would cover the comparison the visitor just asked for.
 */
export const useCompareTrayPresenter = () => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const { compareOrder } = useProductCompare();
  /**
   * The selection lives in `localStorage`, which the server cannot read. Rendering nothing until
   * mount keeps the server and the first client render identical — the same gate
   * `useComparePresenter` and the carousels use, and the reason this bar never causes React #418.
   */
  const [hasMounted, setHasMounted] = useState(false);
  const trayRef = useRef(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const barePath = stripLanguageFromPath(pathname);
  const isOnComparePage = barePath === "/compare" || barePath.startsWith("/compare/");

  const products = useMemo(
    () => (hasMounted ? getCompareProducts(compareOrder) : []),
    [hasMounted, compareOrder],
  );

  const isVisible = hasMounted && !isOnComparePage && products.length > 0;

  /**
   * Publishes the bar's height the way the header publishes its own: three fixed elements sit in
   * this exact corner — the page's bottom padding, the compare toast and the scroll-to-top button
   * — and each would otherwise be covered by, or cover, the tray. Measured rather than hardcoded
   * because the row's height moves with the locale's font metrics and the viewport.
   */
  useEffect(() => {
    const root = document.documentElement;

    if (!isVisible) {
      root.style.setProperty("--compare-tray-height", "0px");
      return () => root.style.removeProperty("--compare-tray-height");
    }

    const update = () => {
      root.style.setProperty(
        "--compare-tray-height",
        `${trayRef.current?.offsetHeight ?? 0}px`,
      );
    };

    update();

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(update);
      if (trayRef.current) resizeObserver.observe(trayRef.current);
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      root.style.removeProperty("--compare-tray-height");
    };
  }, [isVisible]);

  /** Reads through to the store rather than closing over `compareOrder`, as every other writer does. */
  const removeProduct = useCallback((productId) => {
    writeCompareIds(removeFromCompare(readCompareIds(), productId));
  }, []);

  const clearAll = useCallback(() => {
    writeCompareIds([]);
  }, []);

  return {
    t,
    isVisible,
    trayRef,
    products,
    count: products.length,
    maxItems: MAX_COMPARE_ITEMS,
    /** Comparing one product against nothing is not a comparison; the CTA waits for a second. */
    canCompare: products.length >= 2,
    removeProduct,
    clearAll,
  };
};

export default useCompareTrayPresenter;
