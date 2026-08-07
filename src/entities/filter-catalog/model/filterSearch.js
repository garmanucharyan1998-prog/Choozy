/**
 * Text search helpers for the filter catalog listing.
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
      "book",
    ],
  },
  {
    keys: ["smartphone", "smartphones", "սմարթֆոն", "phone", "phones", "հեռախոս"],
    tokens: ["iphone", "galaxy", "pixel", "smartphone"],
  },
  {
    keys: ["speaker", "speakers", "բարձրախոս", "շարժական", "headphone", "headphones"],
    tokens: ["headphone", "headphones", "wh-", "wireless", "earbud", "airpods", "xm"],
  },
  { keys: ["tablet", "tablets", "պլանշետ"], tokens: ["ipad", "tab", "tablet"] },
  { keys: ["watch", "ժամացույց"], tokens: ["watch", "ultra"] },
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

  SYNONYM_EXPANSIONS.forEach(({ keys, tokens: extra }) => {
    const matches = keys.some(
      (key) =>
        normalized.includes(key) || [...tokens].some((t) => key.includes(t) || t.includes(key)),
    );
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
