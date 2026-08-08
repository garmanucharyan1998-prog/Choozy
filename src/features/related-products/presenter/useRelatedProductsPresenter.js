import { useMemo } from "react";
import { useParams } from "react-router";
import { getProductDetailForRoute, getRelatedProducts } from "entities/product";

/**
 * Presenter for the related-products carousel on the single product page.
 *
 * Previously this always returned the same fixed `mockRelatedProducts` list (8 items,
 * independently hand-copied from catalog entries) regardless of which product page it
 * was rendered on. Now it's the current product's own category, computed from the
 * catalog directly — no separate list to keep in sync.
 */
export const useRelatedProductsPresenter = () => {
  const { productId } = useParams();
  const product = useMemo(() => getProductDetailForRoute(productId), [productId]);
  const items = useMemo(() => getRelatedProducts(product), [product]);

  return { items };
};

export default useRelatedProductsPresenter;
