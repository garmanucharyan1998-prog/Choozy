/**
 * useGridCatalogPresenter — MVP Presenter for GridCatalog section.
 * Loads catalog items from Model, passes to View.
 */

import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { catalogModel } from "entities/catalog";
import { useLanguage } from "contexts";

export const useGridCatalogPresenter = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const items = useMemo(
    () =>
      catalogModel.getCatalogItems().map((item) => ({
        ...item,
        label: t(item.labelKey, item.id),
      })),
    [t],
  );

  const navigateToCategory = useCallback(
    (filterCategoryId) => {
      if (!filterCategoryId) return;
      navigate(`/filter?category=${encodeURIComponent(filterCategoryId)}`);
    },
    [navigate],
  );

  return { items, navigateToCategory };
};

export default useGridCatalogPresenter;
