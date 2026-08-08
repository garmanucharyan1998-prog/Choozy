/**
 * Armenian search-term expansions ("սմարթֆոն" -> "iPhone", "Samsung Galaxy", ...) used
 * alongside catalog title matching in `getSearchSuggestions`.
 *
 * This file previously also held a wholly separate demo product list (`mockProducts`,
 * USD-priced, English-only, id 1-8) that fed search suggestions but was never rendered
 * anywhere as an actual product — a suggestion could name something that didn't exist
 * anywhere else on the site. Search now matches against the real catalog
 * (`entities/product`'s `getCatalogSearchSuggestions`) instead.
 */
export const mockArmenianSuggestions = {
  բարձր: ["բարձրախոս", "շարժական բարձրախոս", "Bluetooth բարձրախոս"],
  սմարթֆոն: ["iPhone", "Samsung Galaxy", "Google Pixel", "սմարթֆոն"],
  հեռախոս: ["iPhone", "Samsung Galaxy", "հեռախոս"],
  նոութբուկ: ["MacBook", "Dell", "ASUS նոութբուկ"],
  պլանշետ: ["iPad", "Samsung Galaxy Tab", "պլանշետ"],
  լսափող: ["AirPods", "Sony", "Bose", "լսափող"],
  ժամացույց: ["Apple Watch", "Samsung Galaxy Watch", "խելացի ժամացույց"],
  խաղ: ["PlayStation", "Xbox", "Nintendo", "խաղային սարք"],
};

export default mockArmenianSuggestions;
