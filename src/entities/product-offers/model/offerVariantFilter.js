const VARIANT_KEY_256A = "productDetail.variants.v256a";
const VARIANT_KEY_256B = "productDetail.variants.v256b";
const VARIANT_KEY_1TB = "productDetail.variants.v1tb";

/** Storage family for global best-offers filter (256GB vs 1TB). */
export const getVariantStorageFamily = (variantKey) => {
  if (!variantKey) return null;
  if (variantKey === VARIANT_KEY_256A || variantKey === VARIANT_KEY_256B) return "256";
  if (variantKey === VARIANT_KEY_1TB) return "1tb";
  return null;
};

export const offerMatchesVariantFilter = (offer, globalVariantKey) => {
  if (!globalVariantKey) return true;
  const family = getVariantStorageFamily(globalVariantKey);
  if (!family || !Array.isArray(offer.supportedVariantKeys)) return false;
  return offer.supportedVariantKeys.some((key) => getVariantStorageFamily(key) === family);
};

export const resolveOfferVariantIndex = (offer, globalVariantKey, fallbackIndex = 0) => {
  if (!globalVariantKey) return fallbackIndex;

  const exactIndex = offer.variantKeys.indexOf(globalVariantKey);
  if (exactIndex >= 0 && offer.supportedVariantKeys?.includes(globalVariantKey)) {
    return exactIndex;
  }

  const family = getVariantStorageFamily(globalVariantKey);
  const familyIndex = offer.variantKeys.findIndex(
    (key) => offer.supportedVariantKeys?.includes(key) && getVariantStorageFamily(key) === family,
  );

  return familyIndex >= 0 ? familyIndex : fallbackIndex;
};
