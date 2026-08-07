import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  getCanonicalProductDetailPath,
  getProductDetailForRoute,
  getProductDetailHref,
} from "entities/product-detail";
import {
  ACCOUNT_STORAGE_EVENT,
  isWishlistProductId,
  pushRecentlyViewedProduct,
  toggleWishlistProduct,
} from "entities/user";
import { productDetailVariantIdToFilterKey, useProductOffersVariantFilter } from "contexts";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";

const formatAmd = (amount) => (typeof amount === "number" ? amount.toLocaleString("en-US") : "");

/**
 * Presenter for the product detail page (demo data + local UI state).
 */
export const useProductDetailPresenter = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const product = useMemo(() => getProductDetailForRoute(productId), [productId]);
  const { setGlobalVariantKey, clearGlobalVariantKey } = useProductOffersVariantFilter();

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
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(1);
  const [wishlist, setWishlist] = useState(() => isWishlistProductId(product.id));

  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedVariantIndex(1);
    setSelectedColorIndex(1);
    setWishlist(isWishlistProductId(product.id));
    clearGlobalVariantKey();
  }, [product.id, clearGlobalVariantKey]);

  useEffect(() => {
    const sync = () => setWishlist(isWishlistProductId(product.id));
    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
  }, [product.id]);

  useEffect(() => {
    pushRecentlyViewedProduct({
      id: product.id,
      title: product.listingTitle || "Product",
      description: product.listingDescription || "",
      price: `${formatAmd(product.priceMinAmd)} – ${formatAmd(product.priceMaxAmd)} AMD`,
      image: product.galleryImageUrls?.[0] || "",
      href: getProductDetailHref(product.id, product.listingTitle || "Product"),
    });
  }, [product]);

  const mainImageSrc = product.galleryImageUrls[activeImageIndex] ?? product.galleryImageUrls[0];

  const variantIds = product.variantIds;
  const colorEntries = product.colors;

  const priceMinFormatted = useMemo(() => formatAmd(product.priceMinAmd), [product.priceMinAmd]);
  const priceMaxFormatted = useMemo(() => formatAmd(product.priceMaxAmd), [product.priceMaxAmd]);

  const toggleWishlist = useCallback(() => {
    toggleWishlistProduct({
      id: product.id,
      title: product.listingTitle || "Product",
      description: product.listingDescription || "",
      price: `${priceMinFormatted} – ${priceMaxFormatted} AMD`,
      image: mainImageSrc,
      href: getProductDetailHref(product.id, product.listingTitle || "Product"),
    });
    setWishlist(isWishlistProductId(product.id));
  }, [product, priceMinFormatted, priceMaxFormatted, mainImageSrc]);

  const selectThumbnail = useCallback((index) => {
    setActiveImageIndex(index);
  }, []);

  const selectVariant = useCallback(
    (index) => {
      setSelectedVariantIndex(index);
      const variantId = product.variantIds[index];
      const filterKey = productDetailVariantIdToFilterKey(variantId);
      if (filterKey) {
        setGlobalVariantKey(filterKey);
      }
    },
    [product.variantIds, setGlobalVariantKey],
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
    variantIds,
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
