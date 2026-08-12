/**
 * Assigns each compared product a stable colour so the same product reads as the same line in
 * the bars, the advantage cards, and (eventually) the radar legend. Colour is keyed to the
 * product's id, not its position in the array: removing one product must not shift everyone
 * else's colour, or a legend a visitor already learned would silently relabel itself.
 */
export const COMPARE_SERIES_COLORS = ["#2f4eb4", "#d97706", "#0d9488", "#9333ea"];

/**
 * @param {{ id: string }[]} products
 * @param {Record<string, string>} previousAssignments - this function's own prior return value;
 *   pass `{}` on the first call.
 * @returns {Record<string, string>} productId -> hex colour
 */
export const assignSeriesColors = (products, previousAssignments = {}) => {
  const currentIds = new Set((products ?? []).map((product) => product.id));

  /** Drop anyone no longer in the comparison — frees their colour for a new entrant. */
  const kept = {};
  Object.entries(previousAssignments).forEach(([id, color]) => {
    if (currentIds.has(id)) kept[id] = color;
  });

  const usedColors = new Set(Object.values(kept));
  const availableColors = COMPARE_SERIES_COLORS.filter((color) => !usedColors.has(color));
  let cursor = 0;

  (products ?? []).forEach((product) => {
    if (kept[product.id]) return;
    kept[product.id] = availableColors[cursor] ?? COMPARE_SERIES_COLORS[0];
    cursor += 1;
  });

  return kept;
};

export default assignSeriesColors;
