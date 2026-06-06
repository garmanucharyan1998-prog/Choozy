import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ProductOffersVariantFilterContext = createContext(null);

/** Maps product-detail variant id (e.g. v1tb) to i18n key used by best-offers filter. */
export const productDetailVariantIdToFilterKey = (variantId) =>
  variantId ? `productDetail.variants.${variantId}` : null;

/**
 * Shared memory/storage filter for Best Offers, driven from product detail variant pills.
 */
export const ProductOffersVariantFilterProvider = ({ children }) => {
  const [globalVariantKey, setGlobalVariantKeyState] = useState(null);

  const setGlobalVariantKey = useCallback((variantKey) => {
    setGlobalVariantKeyState(variantKey);
  }, []);

  const clearGlobalVariantKey = useCallback(() => {
    setGlobalVariantKeyState(null);
  }, []);

  const value = useMemo(
    () => ({
      globalVariantKey,
      setGlobalVariantKey,
      clearGlobalVariantKey,
    }),
    [globalVariantKey, setGlobalVariantKey, clearGlobalVariantKey],
  );

  return (
    <ProductOffersVariantFilterContext.Provider value={value}>
      {children}
    </ProductOffersVariantFilterContext.Provider>
  );
};

export const useProductOffersVariantFilter = () => {
  const ctx = useContext(ProductOffersVariantFilterContext);
  if (!ctx) {
    throw new Error(
      "useProductOffersVariantFilter must be used within ProductOffersVariantFilterProvider",
    );
  }
  return ctx;
};
