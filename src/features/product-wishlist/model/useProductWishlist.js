import { useCallback, useEffect, useState } from "react";
import { ACCOUNT_STORAGE_EVENT, readAccountState, toggleWishlistProduct } from "entities/user";
import { useSession } from "contexts";

const wishlistIdsFromStorage = () => new Set(readAccountState().wishlistItems.map((x) => x.id));

/**
 * Wishlist state for a list of product cards: which ids are saved, and how to toggle one.
 *
 * Lives in `features` so that `shared/ui`'s carousel can stay a presentational component.
 * It used to read and write `entities/user` directly, which put a shared component in
 * charge of domain state and violated the layer policy the project lints for.
 *
 * @returns {{ wishlistIds: Set<string>, toggleWishlist: (product: object) => void }}
 */
export const useProductWishlist = () => {
  const session = useSession();

  /**
   * Starts empty, matching the server, which has no `localStorage` — reading real state in
   * the initializer diverged from the SSR HTML on the first client render (React #418) on
   * the home page, where these carousels live.
   */
  const [wishlistIds, setWishlistIds] = useState(() => new Set());

  useEffect(() => {
    const sync = () => setWishlistIds(wishlistIdsFromStorage());
    sync();
    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
    /** Keyed on the session: the shelf a read lands on depends on who is signed in. */
  }, [session.isAuthenticated, session.email]);

  const toggleWishlist = useCallback((product) => {
    toggleWishlistProduct({
      id: product.id,
      title: product.title,
      description: product.description,
      priceValue: product.priceValue,
      image: product.image,
      href: product.href,
      category: product.categoryId,
    });
    setWishlistIds(wishlistIdsFromStorage());
  }, []);

  return { wishlistIds, toggleWishlist };
};

export default useProductWishlist;
