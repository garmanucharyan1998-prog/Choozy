/**
 * Product Model — data layer for products.
 * MVP: Model — data access only, no UI logic.
 */

import apiService from '../../../features/api/services/apiService';

const LOCAL_IMAGES = {
  smartphone: '/assets/images/gridCatalog/smartphone.png',
  laptop: '/assets/images/gridCatalog/notebook.png',
  tablet: '/assets/images/gridCatalog/smartphone.png',
  headphones: '/assets/images/gridCatalog/earphones.png',
  smartwatch: '/assets/images/gridCatalog/smartphone.png',
  gaming_console: '/assets/images/gridCatalog/bag.png',
  tv: '/assets/images/gridCatalog/bag.png',
};

const DEFAULT_IMAGE = '/assets/images/gridCatalog/smartphone.png';

const resolveImage = (product) => {
  return LOCAL_IMAGES[product.type] || DEFAULT_IMAGE;
};

const toCarouselItem = (product) => ({
  id: product.id,
  title: product.title,
  price: product.price
    ? `${product.price.toLocaleString()} ${product.currency || 'USD'}`
    : '',
  description: product.description || '',
  image: resolveImage(product),
});

/**
 * @param {number} limit
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getTopProducts = async (limit = 6) => {
  const response = await apiService.getProductsByCategory('electronics');
  if (!response.success) return response;

  const sorted = [...(response.data || [])]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);

  return {
    success: true,
    data: sorted.map(toCarouselItem),
  };
};

/**
 * @param {string} type
 * @param {number} limit
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getVarietyProducts = async (type = 'smartphone', limit = 6) => {
  const response = await apiService.getProductsByType(type);
  if (!response.success) return response;

  const items = (response.data || []).slice(0, limit).map(toCarouselItem);

  return { success: true, data: items };
};

export const productModel = {
  getTopProducts,
  getVarietyProducts,
  toCarouselItem,
};

export default productModel;
