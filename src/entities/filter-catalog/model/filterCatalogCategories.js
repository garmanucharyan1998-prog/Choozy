/**
 * Filter catalog category ids and home-grid → category mapping.
 */

export const FILTER_CATEGORY_IDS = [
  "smartphones",
  "laptops",
  "speakers",
  "headphones",
  "tablets",
  "tv",
  "wearables",
  "cameras",
];

/** @type {Record<string, string>} */
export const GRID_ITEM_TO_CATEGORY = {
  smartphones: "smartphones",
  speakers: "speakers",
  "speakers-2": "speakers",
  "laptops-1": "laptops",
  "laptops-2": "laptops",
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
