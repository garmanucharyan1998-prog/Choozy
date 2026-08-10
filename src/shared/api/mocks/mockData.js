/**
 * Armenian search-term expansions ("սմարթֆոն" -> "iPhone", "Samsung Galaxy", ...) used
 * alongside catalog title matching in `getSearchSuggestions`.
 *
 * This file previously also held a wholly separate demo product list (`mockProducts`,
 * USD-priced, English-only, id 1-8) that fed search suggestions but was never rendered
 * anywhere as an actual product — a suggestion could name something that didn't exist
 * anywhere else on the site. Search now matches against the real catalog
 * (`entities/product`'s `getCatalogSearchSuggestions`) instead.
 *
 * The expansions kept naming brands the catalog doesn't carry (PlayStation, Xbox,
 * Nintendo, Bose, Google Pixel, ASUS), so picking one landed on an empty `/filter`. They
 * are pruned here, and `entities/search` now also drops any expansion that returns nothing
 * — the guarantee holds even if this table drifts again.
 */
export const mockArmenianSuggestions = {
  բարձր: ["բարձրախոս", "Sony SRS"],
  սմարթֆոն: ["iPhone", "Samsung Galaxy", "սմարթֆոն"],
  հեռախոս: ["iPhone", "Samsung Galaxy", "հեռախոս"],
  նոութբուկ: ["MacBook", "Dell", "Lenovo", "նոութբուկ"],
  պլանշետ: ["iPad", "Galaxy Tab", "պլանշետ"],
  լսափող: ["AirPods", "Sony WH-1000XM5", "լսափող"],
  ժամացույց: ["Apple Watch", "ժամացույց"],
  հեռուստացույց: ["Samsung Neo QLED", "հեռուստացույց"],
};

export default mockArmenianSuggestions;
