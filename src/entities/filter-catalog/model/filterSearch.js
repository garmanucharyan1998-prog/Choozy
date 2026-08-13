/**
 * Text search helpers for the filter catalog listing.
 */

/**
 * Maps what a visitor types onto the words the catalog actually uses. One entry per real
 * product category — speakers and headphones used to share one entry, so searching
 * "speaker" returned AirPods (and now that the catalog has an actual speaker, that's not
 * even a useful workaround any more). "watch" also expanded to the bare token "ultra",
 * which matched the Galaxy S25 **Ultra** and the Galaxy Tab S10 **Ultra**.
 *
 * Keys come in all three of the site's languages. Russian was missing entirely: the UI has
 * shipped in Russian from the start, but a visitor reading it who typed "ноутбук" or
 * "наушники" — the obvious thing to type on a Russian page — matched nothing, because the
 * catalog's own titles are Latin-script model names and every key here was English or
 * Armenian. The narrow accessory words (keyboard, mouse, router, charger) get their own
 * entries rather than joining one "accessories" bucket, so searching for a mouse does not
 * also return a router.
 */
const SYNONYM_EXPANSIONS = [
  {
    keys: [
      "notebook",
      "notebooks",
      "նոութբուկ",
      "նոութ",
      "նոթբուք",
      "նոթբուքեր",
      "լապտոպ",
      "համակարգիչ",
      "laptop",
      "laptops",
      "ноутбук",
      "ноутбуки",
      "лаптоп",
    ],
    tokens: [
      "macbook",
      "laptop",
      "thinkpad",
      "spectre",
      "latitude",
      "omen",
      "yoga",
      "legion",
      "chromebook",
      "xps",
      "galaxy book",
      "precision",
      "zenbook",
      "vivobook",
      "swift",
      "predator",
      "katana",
      "surface laptop",
      "zephyrus",
    ],
  },
  {
    keys: [
      "smartphone",
      "smartphones",
      "սմարթֆոն",
      "սմարթ",
      "phone",
      "phones",
      "հեռախոս",
      "բջջային",
      "смартфон",
      "смартфоны",
      "телефон",
    ],
    tokens: ["iphone", "galaxy s", "galaxy a", "galaxy z", "smartphone", "pixel", "redmi"],
  },
  {
    keys: [
      "headphone",
      "headphones",
      "earbuds",
      "earphones",
      "headset",
      "ականջակալ",
      "ականջակալներ",
      "ականջ",
      "լսափող",
      "наушники",
      "гарнитура",
    ],
    tokens: ["headphones", "earbuds", "wh-1000", "wf-1000", "airpods", "quietcomfort", "momentum"],
  },
  {
    keys: ["speaker", "speakers", "բարձրախոս", "ձայնային", "колонка", "колонки", "динамик"],
    tokens: ["speaker", "srs-", "soundlink", "emberton", "homepod", "charge 5", "flip 6"],
  },
  {
    keys: ["tablet", "tablets", "պլանշետ", "պլանշ", "թաբլետ", "планшет", "планшеты"],
    tokens: ["ipad", "galaxy tab", "tablet", "xiaomi pad"],
  },
  {
    keys: ["watch", "smartwatch", "ժամացույց", "ժամաց", "часы", "смарт-часы"],
    tokens: ["watch", "venu", "amazfit"],
  },
  {
    keys: ["tv", "television", "հեռուստացույց", "հեռուստ", "տելեվիզոր", "телевизор", "телевизоры"],
    tokens: ["qled", "smart tv", "oled", "bravia", "mini led"],
  },
  {
    keys: [
      "camera",
      "cameras",
      "lens",
      "ֆոտոխցիկ",
      "ֆոտո",
      "ֆոտոապարատ",
      "օբյեկտիվ",
      "տեսախցիկ",
      "տեսախ",
      "կամերա",
      "камера",
      "фотоаппарат",
      "объектив",
    ],
    tokens: [
      "camera",
      "sigma",
      "dc dn",
      "gopro",
      "dji",
      "canon",
      "nikon",
      "fujifilm",
      "alpha a",
      "tamron",
    ],
  },
  /** New with the monitors/consoles/accessories categories (see `filterCatalogCategories.js`). */
  {
    keys: ["monitor", "monitors", "մոնիտոր", "մոնիտ", "էկրան", "монитор", "мониторы"],
    tokens: ["monitor", "ultrasharp", "ultragear", "viewfinity", "odyssey", "proart", "display"],
  },
  {
    keys: [
      "console",
      "consoles",
      "game console",
      "game consoles",
      "կոնսոլ",
      "վահանակ",
      "խաղային",
      "приставка",
      "консоль",
    ],
    tokens: ["console", "playstation", "xbox", "switch", "dualsense", "quest"],
  },
  {
    keys: ["accessory", "accessories", "պարագա", "պարագաներ", "аксессуары", "аксессуар"],
    tokens: ["accessory", "logitech", "anker", "power bank", "keychron", "razer", "tp-link"],
  },
  {
    keys: ["keyboard", "keyboards", "ստեղնաշար", "клавиатура"],
    tokens: ["keyboard", "mx keys", "keychron"],
  },
  { keys: ["mouse", "մկնիկ", "мышь", "мышка"], tokens: ["mouse", "mx master", "deathadder"] },
  { keys: ["router", "երթուղիչ", "роутер", "маршрутизатор"], tokens: ["router", "archer"] },
  {
    keys: ["power bank", "powerbank", "charger", "լիցքավորիչ", "повербанк", "аккумулятор"],
    tokens: ["power bank", "powercore", "anker nano"],
  },
  {
    keys: ["projector", "պրոյեկտոր", "проектор"],
    tokens: ["projector"],
  },
];

/**
 * @param {string} q
 * @returns {string}
 */
export const normalizeQuery = (q) => q.toLowerCase().trim().replace(/\s+/g, " ");

/**
 * @param {string} q
 * @returns {string[]}
 */
export const expandSearchTokens = (q) => {
  const normalized = normalizeQuery(q);
  if (!normalized) return [];

  const tokens = new Set(normalized.split(" ").filter(Boolean));
  tokens.add(normalized);

  /**
   * The query has to contain the key, or one of its words has to *be* the key. The old rule
   * also fired when a key merely contained a typed word (`key.includes(t)`), so typing "no"
   * or "tv" pulled in an entire synonym set — a two-character query expanded into every
   * laptop model name in the catalog.
   */
  SYNONYM_EXPANSIONS.forEach(({ keys, tokens: extra }) => {
    const matches = keys.some((key) => normalized.includes(key) || tokens.has(key));
    if (matches) {
      extra.forEach((t) => tokens.add(t));
    }
  });

  return [...tokens];
};

/**
 * @param {{ title: string, description: string, categoryId?: string, brandId?: string }} product
 * @param {string} q
 * @returns {boolean}
 */
export const productMatchesSearch = (product, q) => {
  const normalized = normalizeQuery(q);
  if (!normalized) return true;

  /**
   * Title, category and brand only. The description is now a translated template resolved at
   * render time, so matching against it would make the same query return different results in
   * different languages — and every word it contributed ("laptop", "smartphone") is already
   * here as `categoryId` or reachable through the synonym expansions above.
   */
  const haystack = [product.title, product.categoryId, product.brandId]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const words = normalized.split(" ").filter(Boolean);
  if (words.length > 0 && words.every((word) => haystack.includes(word))) {
    return true;
  }

  const expanded = expandSearchTokens(q);
  return expanded.some((token) => haystack.includes(token));
};
