/**
 * Product Model — data layer for product sections.
 * MVP: Model — data access only, no UI logic.
 */

import { apiService } from "shared/api";

export const getTopProducts = async () => {
  return apiService.getTopProducts();
};

export const getVarietyProducts = async () => {
  return apiService.getVarietyProducts();
};

export const productModel = {
  getTopProducts,
  getVarietyProducts,
};

export default productModel;
