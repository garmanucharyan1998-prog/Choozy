/**
 * Shared image pool for the demo catalog. `fm=webp` asks Unsplash's own image API to
 * serve WebP instead of the browser negotiating a heavier format — a same-URL,
 * zero-risk win since these are remote images the catalog doesn't control encoding for.
 */
const IMG_CROP = "auto=format&fm=webp&fit=crop&w=1200&h=900&q=85";

export const PRODUCT_IMAGES = {
  iphoneOrange: `https://images.unsplash.com/photo-1592750475338-74b7b21085ab?${IMG_CROP}`,
  iphoneBlack: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?${IMG_CROP}`,
  samsungPhone: `https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?${IMG_CROP}`,
  headphones: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?${IMG_CROP}`,
  earbuds: `https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?${IMG_CROP}`,
  watch: `https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?${IMG_CROP}`,
  lens: `https://images.unsplash.com/photo-1502920917128-1aa500764cbd?${IMG_CROP}`,
  macbook: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?${IMG_CROP}`,
  laptop: `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?${IMG_CROP}`,
  tablet: `https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?${IMG_CROP}`,
  tv: `https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?${IMG_CROP}`,
  gamingLaptop: `https://images.unsplash.com/photo-1593642632823-8f785ba67e45?${IMG_CROP}`,
  speaker: `https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?${IMG_CROP}`,
};

/**
 * Per-category image sets for detail-page galleries — 2-3 distinct, already-verified
 * URLs per category instead of one image repeated N times (`repeatGallery`, removed).
 * Not truly per-product (these are stock photos, not real product shots), but a
 * meaningfully closer approximation than a single frame duplicated across the gallery.
 */
const CATEGORY_GALLERY = {
  smartphones: [PRODUCT_IMAGES.iphoneOrange, PRODUCT_IMAGES.iphoneBlack, PRODUCT_IMAGES.samsungPhone],
  laptops: [PRODUCT_IMAGES.macbook, PRODUCT_IMAGES.laptop, PRODUCT_IMAGES.gamingLaptop],
  speakers: [PRODUCT_IMAGES.speaker, PRODUCT_IMAGES.headphones],
  headphones: [PRODUCT_IMAGES.headphones, PRODUCT_IMAGES.earbuds],
  tablets: [PRODUCT_IMAGES.tablet, PRODUCT_IMAGES.iphoneBlack],
  tv: [PRODUCT_IMAGES.tv],
  wearables: [PRODUCT_IMAGES.watch],
  cameras: [PRODUCT_IMAGES.lens],
};

/**
 * Builds a product's gallery: its own listing image first (so the primary photo always
 * matches the catalog card), then the rest of its category's set.
 * @param {{ image: string, categoryId: string }} product
 */
export const buildGalleryForProduct = (product) => {
  const categorySet = CATEGORY_GALLERY[product.categoryId] || [product.image];
  const rest = categorySet.filter((url) => url !== product.image);
  return [product.image, ...rest];
};
