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
  COMPARE_PAIRS,
  buildComparePairSlug,
  getComparePairs,
  getComparePairBySlug,
  getComparePairPath,
  getComparePairSlugForIds,
  getCanonicalSlugForReversed,
} from "./model/comparePairs";
