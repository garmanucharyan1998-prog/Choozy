/**
 * useVarietyPresenter — MVP Presenter for Variety section.
 * Delegates async state handling to a shared presenter hook.
 */

import { useMemo } from "react";
import { useLanguage } from "contexts";
import { productModel } from "entities/product";
import { useAsyncItemsPresenter } from "hooks/useAsyncItemsPresenter";
import { localizeCarouselItems } from "shared/i18n/mapCarouselDescriptions";

export const useVarietyPresenter = () => {
  const { t } = useLanguage();
  const {
    items: rawItems,
    loading,
    error,
    onRetry,
  } = useAsyncItemsPresenter(productModel.getVarietyProducts);
  const items = useMemo(() => localizeCarouselItems(rawItems, t), [rawItems, t]);

  return { items, loading, error, onRetry };
};

export default useVarietyPresenter;
