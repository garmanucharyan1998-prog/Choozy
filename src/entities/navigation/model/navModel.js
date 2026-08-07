/**
 * Nav Model — data for navigation panel.
 * MVP: Model — data access only, no UI logic.
 *
 * Items mirror the real filter catalog categories, so every entry is a crawlable link
 * that lands on a populated listing. Labels reuse `filterPage.categories.*`, which is
 * already translated for every locale — no separate (and previously English-only)
 * aria strings are needed.
 */

import { FILTER_CATEGORY_IDS } from "entities/filter-catalog/model/filterCatalogCategories";

export const getNavItems = () =>
  FILTER_CATEGORY_IDS.map((categoryId) => ({
    id: categoryId,
    labelKey: `filterPage.categories.${categoryId}`,
    href: `/filter?category=${encodeURIComponent(categoryId)}`,
  }));

export const navModel = { getNavItems };
export default navModel;
