/**
 * useVarietyPresenter — MVP Presenter for Variety section.
 * Loads data from Model, manages state, passes to View.
 */

import { useState, useEffect, useCallback } from 'react';
import { productModel } from '../model/productModel';

export const useVarietyPresenter = (options = {}) => {
  const { type = 'smartphone', limit = 6 } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productModel.getVarietyProducts(type, limit);
      if (response.success && response.data?.length) {
        setItems(response.data);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [type, limit]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { items, loading, error, onRetry: loadProducts };
};

export default useVarietyPresenter;
