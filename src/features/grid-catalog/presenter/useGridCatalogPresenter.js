/**
 * useGridCatalogPresenter — MVP Presenter for GridCatalog section.
 * Loads catalog items from Model, passes to View.
 */

import { useMemo } from "react";
import { catalogModel } from "entities/catalog";
import { useLanguage } from "contexts";

export const useGridCatalogPresenter = () => {
  const { t } = useLanguage();
  const items = useMemo(
    () =>
      catalogModel.getCatalogItems().map((item) => ({
        ...item,
        label: t(item.labelKey, item.id),
      })),
    [t],
  );

  return { items };
};

export default useGridCatalogPresenter;
