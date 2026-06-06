/**
 * useTopProductsPresenter — MVP Presenter for TopProducts section.
 * Delegates async state handling to a shared presenter hook.
 */

import { useMemo } from "react";
import { useLanguage } from "contexts";
import { productModel } from "entities/product";
import { useAsyncItemsPresenter } from "hooks/useAsyncItemsPresenter";
import { localizeCarouselItems } from "shared/i18n/mapCarouselDescriptions";

export const useTopProductsPresenter = () => {
  const { t } = useLanguage();
  const { items: rawItems, loading, error, onRetry } = useAsyncItemsPresenter(
    productModel.getTopProducts,
  );
  const items = useMemo(
    () => localizeCarouselItems(rawItems, t),
    [rawItems, t],
  );

  return { items, loading, error, onRetry };
};

export default useTopProductsPresenter;
