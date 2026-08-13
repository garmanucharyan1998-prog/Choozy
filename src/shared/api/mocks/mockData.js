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
 * The expansions used to prune PlayStation, Xbox, Nintendo, Bose, Google Pixel and ASUS —
 * brands the catalog didn't carry at the time, so picking one landed on an empty `/filter`.
 * The catalog now carries all of them (see `entities/product/model/catalog/`), so they're
 * back, alongside the categories that came with them (monitors, game consoles, cameras,
 * accessories). `entities/search` still drops any expansion that returns nothing, so the
 * guarantee holds even if this table drifts again.
 *
 * Keys include the partial words people actually stop typing at ("նոութ", "հեռուստ",
 * "ֆոտո") next to the full ones, because `fetchSuggestions` matches a key against the query
 * in both directions — `բարձր` was the only such prefix here for a long time, so typing four
 * letters of any other category produced nothing until the whole word was spelled out. Every
 * Armenian *value* below has to be a term `filterSearch.js` expands or a string that appears
 * in a catalog title, otherwise `leadsToResults` drops the suggestion on sight.
 */
export const mockArmenianSuggestions = {
  /** Smartphones */
  սմարթֆոն: ["iPhone", "Samsung Galaxy", "Google Pixel", "Xiaomi 15", "սմարթֆոն"],
  սմարթ: ["iPhone", "Samsung Galaxy", "Nothing Phone", "սմարթֆոն"],
  հեռախոս: ["iPhone", "Samsung Galaxy", "Google Pixel", "հեռախոս"],
  բջջային: ["iPhone", "Samsung Galaxy", "Honor Magic", "հեռախոս"],

  /** Laptops */
  նոութբուկ: ["MacBook", "Dell", "Lenovo", "ASUS ROG", "նոութբուկ"],
  նոութ: ["MacBook", "Dell XPS", "Lenovo ThinkPad", "նոութբուկ"],
  նոթբուք: ["MacBook", "HP Spectre", "Acer Swift", "նոութբուկ"],
  լապտոպ: ["MacBook Air", "Lenovo Yoga", "MSI Katana", "նոութբուկ"],
  համակարգիչ: ["MacBook", "Dell Precision", "Microsoft Surface", "նոութբուկ"],

  /** Tablets */
  պլանշետ: ["iPad", "Galaxy Tab", "Xiaomi Pad", "պլանշետ"],
  պլանշ: ["iPad Pro", "Galaxy Tab", "պլանշետ"],
  թաբլետ: ["iPad Air", "Galaxy Tab", "պլանշետ"],

  /** Monitors */
  մոնիտոր: ["Dell UltraSharp", "LG UltraGear", "մոնիտոր"],
  մոնիտ: ["Dell UltraSharp", "Samsung Odyssey", "մոնիտոր"],
  էկրան: ["Apple Studio Display", "ASUS ProArt", "մոնիտոր"],

  /** TV */
  հեռուստացույց: ["Samsung Neo QLED", "LG OLED", "հեռուստացույց"],
  հեռուստ: ["Samsung Neo QLED", "Sony BRAVIA", "հեռուստացույց"],
  տելեվիզոր: ["LG OLED", "TCL", "Hisense", "հեռուստացույց"],

  /** Headphones and earbuds */
  ականջակալ: ["AirPods", "Sony WH-1000XM5", "Bose QuietComfort", "ականջակալ"],
  ականջ: ["AirPods", "Sony WF-1000XM5", "ականջակալ"],
  լսափող: ["AirPods", "Sony WH-1000XM5", "Bose QuietComfort", "լսափող"],
  ականջակալներ: ["JBL Tune", "Marshall Major", "Sennheiser Momentum", "ականջակալ"],

  /** Speakers */
  բարձր: ["բարձրախոս", "Sony SRS", "JBL Charge"],
  բարձրախոս: ["Sony SRS", "JBL Charge", "Bose SoundLink", "բարձրախոս"],
  ձայնային: ["Marshall Emberton", "HomePod mini", "բարձրախոս"],

  /** Wearables */
  ժամացույց: ["Apple Watch", "Samsung Galaxy Watch", "ժամացույց"],
  ժամաց: ["Apple Watch", "Galaxy Watch", "ժամացույց"],
  խելացի: ["Apple Watch Ultra", "Garmin Venu", "Amazfit", "ժամացույց"],

  /** Cameras and lenses */
  ֆոտոխցիկ: ["Sony Alpha", "Canon EOS", "Fujifilm", "ֆոտոխցիկ"],
  ֆոտո: ["Sony Alpha", "Canon EOS", "Nikon", "ֆոտոխցիկ"],
  ֆոտոապարատ: ["Sony Alpha", "Canon EOS", "ֆոտոխցիկ"],
  տեսախցիկ: ["GoPro", "DJI Mini", "տեսախցիկ"],
  տեսախ: ["GoPro", "DJI Mini", "տեսախցիկ"],
  կամերա: ["Sony Alpha", "Canon EOS", "GoPro", "ֆոտոխցիկ"],
  օբյեկտիվ: ["Sigma", "Tamron", "օբյեկտիվ"],

  /** Game consoles */
  կոնսոլ: ["PlayStation 5", "Xbox Series", "Nintendo Switch", "կոնսոլ"],
  վահանակ: ["DualSense", "Xbox Wireless Controller", "վահանակ"],
  խաղային: ["PlayStation 5", "Xbox Series", "Meta Quest", "կոնսոլ"],

  /** Accessories */
  պարագա: ["Logitech", "Anker", "պարագա"],
  պարագաներ: ["Logitech MX", "TP-Link", "պարագա"],
  ստեղնաշար: ["Logitech MX Keys", "Keychron", "ստեղնաշար"],
  մկնիկ: ["Logitech MX Master", "Razer DeathAdder", "մկնիկ"],
  երթուղիչ: ["TP-Link Archer", "երթուղիչ"],
  լիցքավորիչ: ["Anker PowerCore", "Anker Nano", "լիցքավորիչ"],
  պրոյեկտոր: ["Xiaomi Smart Projector", "պրոյեկտոր"],
};

export default mockArmenianSuggestions;
