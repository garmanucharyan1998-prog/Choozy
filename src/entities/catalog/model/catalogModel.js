/**
 * Catalog Model — data for grid catalog section.
 * MVP: Model — data access only, no UI logic.
 */

import { getCategoryIdForGridItem } from "entities/filter-catalog/model/filterCatalogCategories";

export const getCatalogItems = () => [
  {
    id: "smartphones",
    labelKey: "gridCatalog.items.smartphones",
    image: "/assets/images/gridCatalog/smartphone.png",
    className: "item-1 grid-item",
    filterCategoryId: getCategoryIdForGridItem("smartphones"),
  },
  {
    id: "speakers",
    labelKey: "gridCatalog.items.speakers",
    image: "/assets/images/gridCatalog/headphone.png",
    className: "item-2 grid-item",
    filterCategoryId: getCategoryIdForGridItem("speakers"),
  },
  {
    id: "laptops-1",
    labelKey: "gridCatalog.items.laptops",
    image: "/assets/images/gridCatalog/notebook.png",
    className: "item-3 grid-item",
    filterCategoryId: getCategoryIdForGridItem("laptops-1"),
  },
  {
    id: "tablets",
    labelKey: "gridCatalog.items.tablets",
    image: "/assets/images/gridCatalog/smartphone.png",
    className: "item-4 grid-item",
    filterCategoryId: getCategoryIdForGridItem("tablets"),
  },
  {
    id: "accessories",
    labelKey: "gridCatalog.items.accessories",
    image: "/assets/images/gridCatalog/bag.png",
    className: "item-5 grid-item",
    filterCategoryId: getCategoryIdForGridItem("accessories"),
  },
  {
    id: "headphones",
    labelKey: "gridCatalog.items.headphones",
    image: "/assets/images/gridCatalog/earphones.png",
    className: "item-6 grid-item",
    filterCategoryId: getCategoryIdForGridItem("headphones"),
  },
];

export const catalogModel = { getCatalogItems };
export default catalogModel;
