import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ProductOffersVariantFilterContext = createContext(null);

/**
 * Shared variant selection for Best Offers, driven from the product detail variant
 * pills — a plain index into the current product's own `variants` array.
 *
 * Previously this synced by i18n key (`productDetail.variants.v256a`, shared globally
 * across every product) and Best Offers had to fuzzy-match a "storage family" out of
 * it, because offers weren't otherwise tied to which product's variants they meant.
 * Now that `getOffersForProduct` builds every offer's `variantIds` from that same
 * product's own `variants`, the two lists are already index-aligned — no key or family
 * resolution needed, just the index itself.
 */
export const ProductOffersVariantFilterProvider = ({ children }) => {
  const [selectedVariantIndex, setSelectedVariantIndexState] = useState(null);

  const setSelectedVariantIndex = useCallback((index) => {
    setSelectedVariantIndexState(index);
  }, []);

  const clearSelectedVariantIndex = useCallback(() => {
    setSelectedVariantIndexState(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedVariantIndex,
      setSelectedVariantIndex,
      clearSelectedVariantIndex,
    }),
    [selectedVariantIndex, setSelectedVariantIndex, clearSelectedVariantIndex],
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
