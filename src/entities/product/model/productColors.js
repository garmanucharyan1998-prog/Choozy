/**
 * Canonical color id -> hex map, matching `filterOptions.js`'s `COLOR_OPTIONS` (the
 * facet filter uses the same ids) — previously the product detail page had its own
 * separate `{id, hex}` list with different hex values and even a different spelling
 * ("gray" vs "grey"), so a product's catalog color and its detail-page swatch could
 * show two different shades for the same name. Labels are looked up from the existing
 * `filterPage.filters.colorNames.*` dictionary — one color-name translation, reused by
 * both the filter sidebar and the detail page, instead of two.
 *
 * Colors are the one facet that stays hand-listed rather than derived: each id owes the
 * dictionary a translated name in three languages, so the set has to be closed. Adding one
 * here means adding it to `COLOR_OPTIONS`, `ALTERNATES_BY_COLOR` and `colorNames` too —
 * a product carrying an id missing from any of them would render an untranslated key.
 */
export const COLOR_HEX = {
  black: "#1a1a1a",
  grey: "#9ca3af",
  white: "#f3f4f6",
  silver: "#d6dae0",
  navy: "#152147",
  blue: "#2563eb",
  green: "#15803d",
  red: "#dc2626",
  orange: "#f97316",
  purple: "#7c3aed",
  beige: "#e7dbc7",
};

/**
 * Plausible alternate colors offered alongside a product's own primary color. Kept to the
 * neutral shades a manufacturer really does offer next to a statement color — a phone sold
 * in orange comes in black and white too, not in orange and purple.
 */
const ALTERNATES_BY_COLOR = {
  black: ["grey", "white"],
  grey: ["black", "white"],
  white: ["black", "silver"],
  silver: ["black", "white"],
  navy: ["black", "silver"],
  blue: ["black", "white"],
  green: ["black", "white"],
  red: ["black", "silver"],
  orange: ["black", "white"],
  purple: ["black", "white"],
  beige: ["black", "grey"],
};

/**
 * A product's available color options for the detail page: its own catalog color
 * first (so the default selection matches what's shown in the listing), then 1-2
 * plausible alternates.
 * @param {string} colorId
 * @returns {{ id: string, hex: string }[]}
 */
export const buildColorOptionsForProduct = (colorId) => {
  const alternates = ALTERNATES_BY_COLOR[colorId] || [];
  const ids = [colorId, ...alternates].filter((id, index, arr) => arr.indexOf(id) === index);
  return ids.map((id) => ({ id, hex: COLOR_HEX[id] || COLOR_HEX.black }));
};
