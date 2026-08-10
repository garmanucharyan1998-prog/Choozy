/**
 * Storage/configuration variants, generated per product from its own `storageGb` field
 * instead of every product sharing the same three hardcoded variant ids
 * ("v256a"/"v256b"/"v1tb", previously translation keys on `mockProductDetail` — a TV and a
 * pair of earbuds showed the exact same "256 GB / 512 GB / 1 TB" storage picker as the
 * MacBook).
 *
 * Products with no storage axis at all (headphones, a speaker, a lens, a TV) get no
 * variants and the picker doesn't render — they used to get a single chip labelled with
 * the old `ramGb` tier, i.e. a pair of earbuds offering "4 GB".
 *
 * Labels are plain text, not translated — matches how titles and spec values already work
 * in this catalog: a spec number like "256 GB" doesn't change meaning across locales the
 * way a color name does.
 */
import { formatStorageGb } from "shared/lib/formatStorageGb";

const STORAGE_STEP_UP_GB = {
  64: 128,
  128: 256,
  256: 512,
  512: 1000,
  1000: 2000,
};

const CONFIGURABLE_CATEGORIES = new Set(["smartphones", "laptops", "tablets"]);

/**
 * @param {{ id: string, categoryId: string, storageGb?: number }} product
 * @returns {{ id: string, label: string }[]}
 */
export const buildVariantsForProduct = (product) => {
  const baseGb = product.storageGb;
  if (typeof baseGb !== "number" || baseGb <= 0) {
    return [];
  }

  if (!CONFIGURABLE_CATEGORIES.has(product.categoryId)) {
    return [{ id: `${product.id}-standard`, label: formatStorageGb(baseGb) }];
  }

  const stepUpGb = STORAGE_STEP_UP_GB[baseGb] ?? baseGb * 2;

  return [
    { id: `${product.id}-${baseGb}`, label: formatStorageGb(baseGb) },
    { id: `${product.id}-${stepUpGb}`, label: formatStorageGb(stepUpGb) },
  ];
};
