/**
 * Predefined catalog options for the shop manager "add product" form.
 * Managers pick category, product, memory, colors, and availability; only price is typed.
 */

import { FILTER_CATEGORY_IDS } from "entities/filter-catalog/model/filterCatalogCategories";
import { COLOR_OPTIONS } from "entities/filter-catalog/model/filterOptions";
import { PRODUCT_CATALOG } from "entities/product";
import { DEMO_SHOP_PRODUCTS_SEED } from "./shopAccountModel";

export const SHOP_PRODUCT_CATEGORY_IDS = [...FILTER_CATEGORY_IDS];

const DEMO_CATEGORY_TO_ID = {
  Smartphones: "smartphones",
  Laptops: "laptops",
  Audio: "headphones",
  Tablets: "tablets",
  Gaming: "wearables",
  TV: "tv",
  Cameras: "cameras",
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

const COLOR_LABEL_KEYS = {
  black: "filterPage.filters.colorNames.black",
  grey: "filterPage.filters.colorNames.grey",
  white: "filterPage.filters.colorNames.white",
  navy: "filterPage.filters.colorNames.navy",
  blue: "filterPage.filters.colorNames.blue",
  orange: "filterPage.filters.colorNames.orange",
};

const buildColorOptions = () => {
  const byId = new Map();

  COLOR_OPTIONS.forEach((color) => {
    byId.set(color.id, {
      id: color.id,
      hex: color.hex,
      labelKey: COLOR_LABEL_KEYS[color.id] || "",
    });
  });

  const extraDetailColors = [
    { id: "gray", hex: "#aeaeb2", labelKey: "productDetail.colors.gray" },
    { id: "yellow", hex: "#E8B923", label: "Yellow" },
    { id: "violet", hex: "#5B4B8A", label: "Violet" },
    { id: "pink", hex: "#E8A0A8", label: "Pink" },
    { id: "hazel", hex: "#9A8B7A", label: "Hazel" },
    { id: "starlight", hex: "#F5F0E8", label: "Starlight" },
    { id: "silver", hex: "#E3E4E6", label: "Silver" },
    { id: "midnight", hex: "#2E3642", label: "Midnight" },
    { id: "space-black", hex: "#1c1c1e", label: "Space Black" },
    { id: "mint", hex: "#7EC8B8", label: "Mint" },
    { id: "platinum", hex: "#E8E8E8", label: "Platinum" },
    { id: "graphite", hex: "#3A3A3C", label: "Graphite" },
    { id: "neon-red", hex: "#E63946", label: "Neon Red" },
    { id: "neon-blue", hex: "#3A86FF", label: "Neon Blue" },
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
