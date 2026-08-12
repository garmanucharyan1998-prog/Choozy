/**
 * Filter catalog category ids and home-grid → category mapping.
 *
 * This list is what the nav panel, the sitemap's category landing pages and the shop
 * manager's "add product" form are all built from, so an id here is a promise that
 * `/filter?category=<id>` returns products. `monitors`, `consoles` and `accessories` were
 * added with the catalog entries that populate them — the seller dashboard had been shipping
 * demo products in "Gaming" and "Accessories" and `shopProductCatalog` filed them under
 * `tv` and `laptops` for want of anywhere honest to put them.
 */

export const FILTER_CATEGORY_IDS = [
  "smartphones",
  "laptops",
  "tablets",
  "monitors",
  "tv",
  "headphones",
  "speakers",
  "wearables",
  "cameras",
  "consoles",
  "accessories",
];

/**
 * The home page's catalog grid. Six tiles, six different categories: `laptops-2` and
 * `speakers-2` used to be second tiles for laptops and speakers, so two of the six advertised
 * entry points led where another tile already led.
 *
 * @type {Record<string, string>}
 */
export const GRID_ITEM_TO_CATEGORY = {
  smartphones: "smartphones",
  speakers: "speakers",
  "laptops-1": "laptops",
  tablets: "tablets",
  accessories: "accessories",
  headphones: "headphones",
};

/**
 * @param {string | null | undefined} categoryId
 * @returns {boolean}
 */
export const isValidFilterCategoryId = (categoryId) =>
  Boolean(categoryId && FILTER_CATEGORY_IDS.includes(categoryId));

/**
 * @param {string} gridItemId
 * @returns {string | undefined}
 */
export const getCategoryIdForGridItem = (gridItemId) => GRID_ITEM_TO_CATEGORY[gridItemId];
