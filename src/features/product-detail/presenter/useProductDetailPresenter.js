import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { getCanonicalProductDetailPath, getProductDetailHref } from "entities/product-detail";
import { getProductDetailForRoute } from "entities/product";
import {
  ACCOUNT_STORAGE_EVENT,
  isWishlistProductId,
  pushRecentlyViewedProduct,
  toggleWishlistProduct,
} from "entities/user";
import { useProductOffersVariantFilter } from "contexts";
import { formatAmd } from "shared/lib/formatAmd";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";

/**
 * Presenter for the product detail page (demo data + local UI state).
 */
export const useProductDetailPresenter = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const product = useMemo(() => getProductDetailForRoute(productId), [productId]);
  const { setSelectedVariantIndex: setGlobalVariantIndex, clearSelectedVariantIndex } =
    useProductOffersVariantFilter();

  const canonicalPath = useMemo(() => getCanonicalProductDetailPath(product), [product]);

  /**
   * Normalises legacy/mistyped slugs onto the canonical URL — while preserving the
   * language prefix, which a bare `navigate(canonicalPath)` would strip.
   */
  useEffect(() => {
    const language = getLanguageFromPath(location.pathname);
    const target = localizedPath(canonicalPath, language);
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [canonicalPath, location.pathname, navigate]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  /** Index 0 — the product's own default configuration/color, not an arbitrary alternate. */
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  /**
   * Starts `false` (matching the server, which has no `localStorage`) rather than reading
   * real wishlist state in the initializer — that would diverge from the SSR HTML on the
   * very first client render (React #418). The effect below, whose deps include
   * `product.id`, already re-runs right after mount and sets the real value then.
   */
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedVariantIndex(0);
    setSelectedColorIndex(0);
    setWishlist(isWishlistProductId(product.id));
    clearSelectedVariantIndex();
  }, [product.id, clearSelectedVariantIndex]);

  useEffect(() => {
    const sync = () => setWishlist(isWishlistProductId(product.id));
    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
  }, [product.id]);

  /**
   * Stores the product's own price as a number, like the wishlist does. Both shelves used to
   * hold a formatted string, and two different shapes of one — a range here
   * ("717,000 – 798,000 AMD") against a single price there — with the currency word frozen
   * into the visitor's saved data in whichever language they happened to be using.
   */
  useEffect(() => {
    pushRecentlyViewedProduct({
      id: product.id,
      title: product.listingTitle || "Product",
      description: product.listingDescription || "",
      priceValue: product.priceValue,
      image: product.galleryImageUrls?.[0] || "",
      href: getProductDetailHref(product.id, product.listingTitle || "Product"),
    });
  }, [product]);

  const mainImageSrc = product.galleryImageUrls[activeImageIndex] ?? product.galleryImageUrls[0];

  const variants = product.variants;
  const colorEntries = product.colors;

  const priceMinFormatted = useMemo(() => formatAmd(product.priceMinAmd), [product.priceMinAmd]);
  const priceMaxFormatted = useMemo(() => formatAmd(product.priceMaxAmd), [product.priceMaxAmd]);

  const toggleWishlist = useCallback(() => {
    toggleWishlistProduct({
      id: product.id,
      title: product.listingTitle || "Product",
      description: product.listingDescription || "",
      priceValue: product.priceValue,
      image: mainImageSrc,
      href: getProductDetailHref(product.id, product.listingTitle || "Product"),
      category: product.categoryId,
    });
    setWishlist(isWishlistProductId(product.id));
  }, [product, mainImageSrc]);

  const selectThumbnail = useCallback((index) => {
    setActiveImageIndex(index);
  }, []);

  const selectVariant = useCallback(
    (index) => {
      setSelectedVariantIndex(index);
      /** Best Offers reads the same index — its offers share this product's own variant list. */
      setGlobalVariantIndex(index);
    },
    [setGlobalVariantIndex],
  );

  const selectColor = useCallback((index) => {
    setSelectedColorIndex(index);
  }, []);

  const onCompareClick = useCallback(() => {}, []);

  return {
    product,
    mainImageSrc,
    activeImageIndex,
    selectedVariantIndex,
    selectedColorIndex,
    wishlist,
    variants,
    colorEntries,
    priceMinFormatted,
    priceMaxFormatted,
    toggleWishlist,
    selectThumbnail,
    selectVariant,
    selectColor,
    onCompareClick,
  };
};

export default useProductDetailPresenter;
