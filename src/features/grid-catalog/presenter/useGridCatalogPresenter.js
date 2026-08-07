/**
 * useGridCatalogPresenter — MVP Presenter for GridCatalog section.
 * Loads catalog items from Model, passes to View.
 */

import { useMemo } from "react";
import { catalogModel } from "entities/catalog";
import { useLanguage } from "contexts";

/** Category tiles are crawlable links, so each item carries a real href. */
const categoryHref = (filterCategoryId) =>
  filterCategoryId ? `/filter?category=${encodeURIComponent(filterCategoryId)}` : "/filter";

export const useGridCatalogPresenter = () => {
  const { t } = useLanguage();
  const items = useMemo(
    () =>
      catalogModel.getCatalogItems().map((item) => ({
        ...item,
        label: t(item.labelKey, item.id),
        href: categoryHref(item.filterCategoryId),
      })),
    [t],
  );

  return { items };
};

export default useGridCatalogPresenter;
