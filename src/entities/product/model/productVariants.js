/**
 * Storage/configuration variants, generated per product from its own `ramGb` field
 * (the catalog's loose "memory tier" facet) instead of every product sharing the same
 * three hardcoded variant ids ("v256a"/"v256b"/"v1tb", previously translation keys on
 * `mockProductDetail` — a TV and a pair of earbuds showed the exact same "256 GB / 512
 * GB / 1 TB" storage picker as the MacBook).
 *
 * Categories with a real storage/config axis (phones, laptops, tablets) get two tiers;
 * everything else gets one "as configured" variant. Labels are plain text, not
 * translated — matches how titles and spec values already work in this catalog:
 * a spec number like "256 GB" doesn't change meaning across locales the way a color
 * name does.
 */
const STORAGE_STEP_UP_GB = {
  4: 8,
  8: 16,
  12: 16,
  16: 32,
  32: 64,
  128: 256,
};

const CONFIGURABLE_CATEGORIES = new Set(["smartphones", "laptops", "tablets"]);

const formatStorage = (gb) => (gb >= 1000 ? `${gb / 1000} TB` : `${gb} GB`);

/**
 * @param {{ id: string, categoryId: string, ramGb: number }} product
 * @returns {{ id: string, label: string }[]}
 */
export const buildVariantsForProduct = (product) => {
  if (!CONFIGURABLE_CATEGORIES.has(product.categoryId)) {
    return [{ id: `${product.id}-standard`, label: formatStorage(product.ramGb) }];
  }

  const baseGb = product.ramGb;
  const stepUpGb = STORAGE_STEP_UP_GB[baseGb] ?? baseGb * 2;

  return [
    { id: `${product.id}-${baseGb}`, label: formatStorage(baseGb) },
    { id: `${product.id}-${stepUpGb}`, label: formatStorage(stepUpGb) },
  ];
};
