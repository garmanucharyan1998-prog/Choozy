import { useCallback, useMemo, useState } from "react";
import { mockProductDetail } from "entities/product-detail";

const formatAmd = (amount) =>
  typeof amount === "number" ? amount.toLocaleString("en-US") : "";

/**
 * Presenter for the product detail page (demo data + local UI state).
 */
export const useProductDetailPresenter = () => {
  const product = mockProductDetail;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(1);
  const [activeTab, setActiveTab] = useState("short");
  const [wishlist, setWishlist] = useState(false);

  const mainImageSrc = product.galleryImageUrls[activeImageIndex] ?? product.galleryImageUrls[0];

  const variantIds = product.variantIds;
  const colorEntries = product.colors;

  const priceMinFormatted = useMemo(() => formatAmd(product.priceMinAmd), [product.priceMinAmd]);
  const priceMaxFormatted = useMemo(() => formatAmd(product.priceMaxAmd), [product.priceMaxAmd]);

  const toggleWishlist = useCallback(() => {
    setWishlist((prev) => !prev);
  }, []);

  const selectThumbnail = useCallback((index) => {
    setActiveImageIndex(index);
  }, []);

  const selectVariant = useCallback((index) => {
    setSelectedVariantIndex(index);
  }, []);

  const selectColor = useCallback((index) => {
    setSelectedColorIndex(index);
  }, []);

  const selectTab = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const onCompareClick = useCallback(() => {}, []);

  return {
    product,
    mainImageSrc,
    activeImageIndex,
    selectedVariantIndex,
    selectedColorIndex,
    activeTab,
    wishlist,
    variantIds,
    colorEntries,
    priceMinFormatted,
    priceMaxFormatted,
    toggleWishlist,
    selectThumbnail,
    selectVariant,
    selectColor,
    selectTab,
    onCompareClick,
  };
};

export default useProductDetailPresenter;
