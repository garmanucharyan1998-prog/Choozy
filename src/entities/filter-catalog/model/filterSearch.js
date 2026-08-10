/**
 * Text search helpers for the filter catalog listing.
 */

/**
 * Maps what a visitor types onto the words the catalog actually uses. One entry per real
 * product category — speakers and headphones used to share one entry, so searching
 * "speaker" returned AirPods (and now that the catalog has an actual speaker, that's not
 * even a useful workaround any more). "watch" also expanded to the bare token "ultra",
 * which matched the Galaxy S25 **Ultra** and the Galaxy Tab S10 **Ultra**.
 */
const SYNONYM_EXPANSIONS = [
  {
    keys: ["notebook", "notebooks", "նոութբուկ", "նոթբուք", "նոթբուքեր", "laptop", "laptops"],
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
    ],
  },
  {
    keys: ["smartphone", "smartphones", "սմարթֆոն", "phone", "phones", "հեռախոս"],
    tokens: ["iphone", "galaxy s", "smartphone"],
  },
  {
    keys: ["headphone", "headphones", "earbuds", "ականջակալ", "ականջակալներ", "լսափող"],
    tokens: ["headphones", "wh-1000", "wf-1000", "airpods"],
  },
  {
    keys: ["speaker", "speakers", "բարձրախոս"],
    tokens: ["speaker", "srs-"],
  },
  { keys: ["tablet", "tablets", "պլանշետ"], tokens: ["ipad", "galaxy tab", "tablet"] },
  { keys: ["watch", "smartwatch", "ժամացույց"], tokens: ["watch"] },
  { keys: ["tv", "television", "հեռուստացույց"], tokens: ["qled", "smart tv"] },
  { keys: ["camera", "lens", "ֆոտոխցիկ", "օբյեկտիվ"], tokens: ["sigma", "dc dn"] },
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

  const haystack = [product.title, product.description, product.categoryId, product.brandId]
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
