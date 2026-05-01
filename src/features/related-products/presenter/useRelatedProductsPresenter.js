import { useMemo } from "react";
import { mockRelatedProducts } from "entities/related-products";

/**
 * Presenter for the related-products carousel on the single product page.
 */
export const useRelatedProductsPresenter = () => {
  const items = useMemo(() => mockRelatedProducts, []);

  return { items };
};

export default useRelatedProductsPresenter;
