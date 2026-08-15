/**
 * Predefined catalog options for the shop manager "add product" form.
 * Managers pick category, product, memory, colors, and availability; only price is typed.
 */

import { FILTER_CATEGORY_IDS } from "entities/filter-catalog/model/filterCatalogCategories";
import { COLOR_OPTIONS } from "entities/filter-catalog/model/filterOptions";
import { PRODUCT_CATALOG } from "entities/product";
import { DEMO_SHOP_PRODUCTS_SEED } from "./shopAccountModel";

export const SHOP_PRODUCT_CATEGORY_IDS = [...FILTER_CATEGORY_IDS];

/**
 * Maps a demo shop listing's informal `category` string (chosen for the seller-facing
 * table, not for `entities/filter-catalog`) onto a real, indexable filter category id.
 *
 * `Gaming` and `Accessories` used to have no matching id at all — the filter catalog's 8
 * categories included neither, so both fell back to `buildCatalogProducts`' own default and
 * landed somewhere unrelated (Gaming → wearables, Accessories → smartphones). Now that
 * `consoles` and `accessories` are real catalog categories (see
 * `filterCatalogCategories.js`), every demo category maps onto its actual home.
 */
const DEMO_CATEGORY_TO_ID = {
  Smartphones: "smartphones",
  Laptops: "laptops",
  Audio: "headphones",
  Tablets: "tablets",
  Wearables: "wearables",
  Monitors: "monitors",
  Gaming: "consoles",
  TV: "tv",
  Cameras: "cameras",
  Accessories: "accessories",
};

/**
 * The filter-catalog category a listing belongs to, whatever era of the data it came from.
 *
 * A listing added through the form stores its own `categoryId`. The demo seed predates that
 * field and carries only the informal English `category` string above — so a dashboard that
 * grouped or filtered by `categoryId` alone would file every one of the seeded listings under
 * "no category". Both readings are the listing's own data; neither is invented.
 *
 * @param {{ categoryId?: string, category?: string }} product
 * @returns {string} a `FILTER_CATEGORY_IDS` member, or "" when the listing names no category.
 */
export const resolveShopProductCategoryId = (product) => {
  const explicit = typeof product?.categoryId === "string" ? product.categoryId.trim() : "";
  if (explicit && SHOP_PRODUCT_CATEGORY_IDS.includes(explicit)) return explicit;
  const informal = typeof product?.category === "string" ? product.category.trim() : "";
  return DEMO_CATEGORY_TO_ID[informal] || "";
};

const STANDARD_MEMORY_OPTIONS = [
  { id: "mem-v256a", labelKey: "productDetail.variants.v256a" },
  { id: "mem-v256b", labelKey: "productDetail.variants.v256b" },
  { id: "mem-v1tb", labelKey: "productDetail.variants.v1tb" },
];

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const buildMemoryOptions = () => {
  const options = [...STANDARD_MEMORY_OPTIONS];
  const seenLabels = new Set(
    options.map((option) => (option.labelKey ? option.labelKey : option.label)),
  );

  DEMO_SHOP_PRODUCTS_SEED.forEach((product) => {
    (product.variants || []).forEach((label) => {
      const trimmed = typeof label === "string" ? label.trim() : "";
      if (!trimmed || seenLabels.has(trimmed)) return;
      seenLabels.add(trimmed);
      options.push({ id: `mem-${slugify(trimmed)}`, label: trimmed });
    });
  });

  return options;
};

/**
 * The catalog's colour ids all have a translated name under `filterPage.filters.colorNames`,
 * so the key is derived rather than hand-listed. It used to be a literal map covering six of
 * the eleven — which is why the seller's colour picker offered "silver", "green", "red",
 * "purple" and "beige" in English inside an Armenian form: `resolveShopColorLabel` falls back
 * to the raw id when no key is given, and a raw id is not copy (§50).
 */
const colorLabelKey = (colorId) => `filterPage.filters.colorNames.${colorId}`;

const buildColorOptions = () => {
  const byId = new Map();

  COLOR_OPTIONS.forEach((color) => {
    byId.set(color.id, {
      id: color.id,
      hex: color.hex,
      labelKey: colorLabelKey(color.id),
    });
  });

  const extraDetailColors = [
    { id: "gray", hex: "#aeaeb2", labelKey: "productDetail.colors.gray" },
    { id: "yellow", hex: "#e8b923", label: "Yellow" },
    { id: "violet", hex: "#5b4b8a", label: "Violet" },
    { id: "pink", hex: "#e8a0a8", label: "Pink" },
    { id: "hazel", hex: "#9a8b7a", label: "Hazel" },
    { id: "starlight", hex: "#f5f0e8", label: "Starlight" },
    { id: "silver", hex: "#e3e4e6", label: "Silver" },
    { id: "midnight", hex: "#2e3642", label: "Midnight" },
    { id: "space-black", hex: "#1c1c1e", label: "Space Black" },
    { id: "mint", hex: "#7ec8b8", label: "Mint" },
    { id: "platinum", hex: "#e8e8e8", label: "Platinum" },
    { id: "graphite", hex: "#3a3a3c", label: "Graphite" },
    { id: "neon-red", hex: "#e63946", label: "Neon Red" },
    { id: "neon-blue", hex: "#3a86ff", label: "Neon Blue" },
  ];

  extraDetailColors.forEach((color) => {
    if (!byId.has(color.id)) byId.set(color.id, color);
  });

  DEMO_SHOP_PRODUCTS_SEED.forEach((product) => {
    (product.colors || []).forEach((swatch) => {
      if (!swatch?.id || byId.has(swatch.id)) return;
      byId.set(swatch.id, {
        id: swatch.id,
        hex: swatch.hex,
        label: swatch.id.replace(/-/g, " "),
      });
    });
  });

  return [...byId.values()];
};

const buildCatalogProducts = () => {
  const byTitle = new Map();

  PRODUCT_CATALOG.forEach((product) => {
    byTitle.set(product.title, {
      id: `catalog-${product.id}`,
      categoryId: product.categoryId,
      title: product.title,
      description: product.description,
      image: product.image,
    });
  });

  DEMO_SHOP_PRODUCTS_SEED.forEach((product) => {
    if (byTitle.has(product.title)) return;
    byTitle.set(product.title, {
      id: `catalog-${product.id}`,
      categoryId: DEMO_CATEGORY_TO_ID[product.category] || "smartphones",
      title: product.title,
      description: product.description || "",
      image: product.image || "",
    });
  });

  return [...byTitle.values()].sort((a, b) => a.title.localeCompare(b.title));
};

export const SHOP_MEMORY_OPTIONS = buildMemoryOptions();
export const SHOP_COLOR_OPTIONS = buildColorOptions();
export const SHOP_CATALOG_PRODUCTS = buildCatalogProducts();

export const getShopCategoryLabelKey = (categoryId) => `filterPage.categories.${categoryId}`;

/**
 * @param {string} categoryId
 */
export const getCatalogProductsByCategory = (categoryId) => {
  if (!categoryId) return [];
  return SHOP_CATALOG_PRODUCTS.filter((product) => product.categoryId === categoryId);
};

/**
 * @param {string} catalogProductId
 */
export const getCatalogProductById = (catalogProductId) =>
  SHOP_CATALOG_PRODUCTS.find((product) => product.id === catalogProductId) ?? null;

/**
 * @param {{ labelKey?: string; label?: string }} option
 * @param {(key: string) => string} t
 */
export const resolveShopMemoryLabel = (option, t) => {
  if (!option) return "";
  if (option.labelKey) return t(option.labelKey);
  return option.label || "";
};

/**
 * @param {string} colorId
 */
export const getShopColorOptionById = (colorId) =>
  SHOP_COLOR_OPTIONS.find((color) => color.id === colorId) ?? null;

/**
 * @param {{ labelKey?: string; label?: string }} colorOption
 * @param {(key: string) => string} t
 */
export const resolveShopColorLabel = (colorOption, t) => {
  if (!colorOption) return "";
  if (colorOption.labelKey) return t(colorOption.labelKey);
  return colorOption.label || colorOption.id || "";
};
