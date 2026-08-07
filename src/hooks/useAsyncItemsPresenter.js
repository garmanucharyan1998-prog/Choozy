import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "contexts";

/**
 * Reusable presenter hook for async list sections.
 * Expects a loader function that resolves to { success, data }.
 */
export const useAsyncItemsPresenter = (loadItemsFn) => {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /** Guards against state updates after unmount and against out-of-order responses. */
  const requestIdRef = useRef(0);

  const loadItems = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const response = await loadItemsFn();
      if (requestIdRef.current !== requestId) return;
      setItems(response?.success && Array.isArray(response.data) ? response.data : []);
    } catch {
      if (requestIdRef.current !== requestId) return;
      /** Localised: the message is rendered in the UI. */
      setError(t("productShowcase.loadErrorMessage"));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [loadItemsFn, t]);

  useEffect(() => {
    loadItems();
    return () => {
      /** Bumping the id turns any in-flight response into a no-op. */
      requestIdRef.current += 1;
    };
  }, [loadItems]);

  return { items, loading, error, onRetry: loadItems };
};

export default useAsyncItemsPresenter;
