import { useCallback, useEffect, useState } from "react";

/**
 * Reusable presenter hook for async list sections.
 * Expects a loader function that resolves to { success, data }.
 */
export const useAsyncItemsPresenter = (loadItemsFn) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await loadItemsFn();
      if (response?.success && Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [loadItemsFn]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return { items, loading, error, onRetry: loadItems };
};

export default useAsyncItemsPresenter;
