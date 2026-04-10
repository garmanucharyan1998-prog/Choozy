/**
 * Catalog Model — data for grid catalog section.
 * MVP: Model — data access only, no UI logic.
 */

export const getCatalogItems = () => [
  {
    id: "smartphones",
    labelKey: "gridCatalog.items.smartphones",
    image: "/assets/images/gridCatalog/smartphone.png",
    className: "item-1 grid-item",
  },
  {
    id: "speakers",
    labelKey: "gridCatalog.items.speakers",
    image: "/assets/images/gridCatalog/headphone.png",
    className: "item-2 grid-item",
  },
  {
    id: "laptops-1",
    labelKey: "gridCatalog.items.laptops",
    image: "/assets/images/gridCatalog/notebook.png",
    className: "item-3 grid-item",
  },
  {
    id: "laptops-2",
    labelKey: "gridCatalog.items.laptops",
    image: "/assets/images/gridCatalog/notebook.png",
    className: "item-4 grid-item",
  },
  {
    id: "speakers-2",
    labelKey: "gridCatalog.items.speakers",
    image: "/assets/images/gridCatalog/headphone.png",
    className: "item-5 grid-item",
  },
  {
    id: "headphones",
    labelKey: "gridCatalog.items.headphones",
    image: "/assets/images/gridCatalog/earphones.png",
    className: "item-6 grid-item",
  },
];

export const catalogModel = { getCatalogItems };
export default catalogModel;
