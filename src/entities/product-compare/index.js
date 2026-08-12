export {
  MAX_COMPARE_ITEMS,
  COMPARE_REJECTION,
  normalizeCompareIds,
  parseCompareIds,
  serializeCompareIds,
  compareCategoryId,
  addToCompare,
  removeFromCompare,
  toggleCompare,
  getCompareProducts,
} from "./model/compareSelection";
export {
  COMPARE_STORAGE_KEY,
  COMPARE_STORAGE_EVENT,
  readCompareIds,
  writeCompareIds,
  clearCompareIds,
  notifyCompareRejected,
} from "./model/compareStorage";
export { COMPARE_SECTION_IDS, buildCompareRows } from "./model/compareRows";
export {
  COMPARE_ATTRIBUTES,
  COMPARE_ATTRIBUTE_BY_KEY,
  pickRadarAxes,
} from "./model/compareAttributes";
export { buildRadarData } from "./model/compareNormalize";
export { buildCompareBars } from "./model/compareBarsModel";
export { buildCompareAdvantages } from "./model/compareAdvantages";
export {
  COMPARE_PAIRS,
  buildComparePairSlug,
  getComparePairs,
  getComparePairBySlug,
  getComparePairPath,
  getComparePairSlugForIds,
  getCanonicalSlugForReversed,
} from "./model/comparePairs";
