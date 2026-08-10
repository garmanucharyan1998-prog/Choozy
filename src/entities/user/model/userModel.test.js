import { vi } from "vitest";
import { serializeSessionCookie } from "entities/session";
import {
  ACCOUNT_STORAGE_EVENT,
  ACCOUNT_STORAGE_KEY,
  addWishlistProduct,
  adoptGuestShelfForSession,
  pushRecentlyViewedProduct,
  readAccountState,
  writeAccountState,
} from "./userModel";

const PRODUCT_A = { id: "fp-1", title: "Product A", price: "1 AMD", href: "/singleproduct/fp-1" };
const PRODUCT_B = { id: "fp-2", title: "Product B", price: "2 AMD", href: "/singleproduct/fp-2" };

const setSessionCookie = (role, email) => {
  const cookie = serializeSessionCookie(role, email, { secure: false }).split(";")[0];
  document.cookie = cookie;
};

const clearSessionCookie = () => {
  document.cookie = "choozy_session=; Max-Age=0; Path=/";
};

const accountKeyFor = (email) => `${ACCOUNT_STORAGE_KEY}::${email}`;

beforeEach(() => {
  window.localStorage.clear();
  clearSessionCookie();
});

afterEach(() => {
  window.localStorage.clear();
  clearSessionCookie();
});

describe("account storage — guest vs. signed-in shelves", () => {
  test("anonymous reads/writes use the shared guest key", () => {
    addWishlistProduct(PRODUCT_A);
    const raw = JSON.parse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY));
    expect(raw.wishlistItems.map((i) => i.id)).toEqual(["fp-1"]);
  });

  test("a signed-in buyer gets a shelf scoped to their email, separate from the guest shelf", () => {
    addWishlistProduct(PRODUCT_A); // as guest

    setSessionCookie("buyer", "buyer@test.com");
    adoptGuestShelfForSession(); // what the session-keyed effect in Header does on login
    addWishlistProduct(PRODUCT_B); // as buyer@test.com

    const accountRaw = JSON.parse(window.localStorage.getItem(accountKeyFor("buyer@test.com")));
    expect(accountRaw.wishlistItems.map((i) => i.id).sort()).toEqual(["fp-1", "fp-2"]);
  });

  /**
   * The merge is a localStorage write, so it must not ride along on a read: `readAccountState`
   * is called from render paths (state initializers, presenters), where a write is a side
   * effect during render — double-invoked under StrictMode and invisible to every
   * ACCOUNT_STORAGE_EVENT listener.
   */
  test("reading does not move anything between shelves", () => {
    addWishlistProduct(PRODUCT_A); // guest

    setSessionCookie("buyer", "read-only@test.com");
    expect(readAccountState().wishlistItems).toEqual([]);

    const guestRaw = JSON.parse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY));
    expect(guestRaw.wishlistItems.map((i) => i.id)).toEqual(["fp-1"]);
    expect(window.localStorage.getItem(accountKeyFor("read-only@test.com"))).toBeNull();
  });

  test("adopting the guest shelf announces the change so mounted listeners refresh", () => {
    addWishlistProduct(PRODUCT_A); // guest
    setSessionCookie("buyer", "notify@test.com");

    const listener = vi.fn();
    window.addEventListener(ACCOUNT_STORAGE_EVENT, listener);
    try {
      expect(adoptGuestShelfForSession()).toBe(true);
      expect(listener).toHaveBeenCalledTimes(1);

      /** Nothing left to move — a second call is a no-op and stays quiet. */
      expect(adoptGuestShelfForSession()).toBe(false);
      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener(ACCOUNT_STORAGE_EVENT, listener);
    }
  });

  /** Recently-viewed used to be stranded on the guest shelf, invisible after signing in. */
  test("the merge carries recently-viewed rows over, not just the wishlist", () => {
    pushRecentlyViewedProduct(PRODUCT_A); // guest
    pushRecentlyViewedProduct(PRODUCT_B); // guest

    setSessionCookie("buyer", "recent@test.com");
    adoptGuestShelfForSession();

    expect(readAccountState().recentlyViewed.map((i) => i.id).sort()).toEqual(["fp-1", "fp-2"]);
    const guestRaw = JSON.parse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY));
    expect(guestRaw.recentlyViewed).toEqual([]);
  });

  test("two different accounts on the same browser do not share a wishlist", () => {
    setSessionCookie("buyer", "alice@test.com");
    addWishlistProduct(PRODUCT_A);

    setSessionCookie("buyer", "bob@test.com");
    expect(readAccountState().wishlistItems).toEqual([]);
    addWishlistProduct(PRODUCT_B);

    expect(readAccountState().wishlistItems.map((i) => i.id)).toEqual(["fp-2"]);

    setSessionCookie("buyer", "alice@test.com");
    expect(readAccountState().wishlistItems.map((i) => i.id)).toEqual(["fp-1"]);
  });

  test("logging in merges the guest wishlist by product id and empties the guest shelf", () => {
    addWishlistProduct(PRODUCT_A); // guest
    addWishlistProduct(PRODUCT_B); // guest

    setSessionCookie("buyer", "carol@test.com");
    adoptGuestShelfForSession();
    const merged = readAccountState().wishlistItems.map((i) => i.id).sort();
    expect(merged).toEqual(["fp-1", "fp-2"]);

    const guestRaw = JSON.parse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY));
    expect(guestRaw.wishlistItems).toEqual([]);
  });

  test("the merge does not duplicate a product already saved on the account shelf", () => {
    setSessionCookie("buyer", "dave@test.com");
    addWishlistProduct(PRODUCT_A);

    clearSessionCookie();
    addWishlistProduct(PRODUCT_A); // same product, saved again as guest

    setSessionCookie("buyer", "dave@test.com");
    adoptGuestShelfForSession();
    const ids = readAccountState().wishlistItems.map((i) => i.id);
    expect(ids).toEqual(["fp-1"]);
  });

  test("logging out returns to the (now-empty, post-merge) guest shelf", () => {
    addWishlistProduct(PRODUCT_A); // guest
    setSessionCookie("buyer", "erin@test.com");
    adoptGuestShelfForSession(); // merges + empties the guest shelf

    clearSessionCookie();
    expect(readAccountState().wishlistItems).toEqual([]);
  });

  test("writeAccountState writes to the currently active shelf, not the guest one", () => {
    setSessionCookie("seller", "shop@test.com");
    writeAccountState((state) => ({ ...state, subscriptionOptIn: true }));

    expect(window.localStorage.getItem(ACCOUNT_STORAGE_KEY)).toBeNull();
    const accountRaw = JSON.parse(window.localStorage.getItem(accountKeyFor("shop@test.com")));
    expect(accountRaw.subscriptionOptIn).toBe(true);
  });

  test("logging in with the same email typed in a different case reuses the same shelf", () => {
    setSessionCookie("buyer", "Frank@Test.com");
    addWishlistProduct(PRODUCT_A);

    setSessionCookie("buyer", "frank@test.com");
    expect(readAccountState().wishlistItems.map((i) => i.id)).toEqual(["fp-1"]);
  });

  test("a seller's guest wishlist is not merged into their shelf and stays on the guest shelf", () => {
    addWishlistProduct(PRODUCT_A); // guest

    setSessionCookie("seller", "seller@test.com");
    expect(adoptGuestShelfForSession()).toBe(false);
    expect(readAccountState().wishlistItems).toEqual([]);
    expect(window.localStorage.getItem(accountKeyFor("seller@test.com"))).toBeNull();

    const guestRaw = JSON.parse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY));
    expect(guestRaw.wishlistItems.map((i) => i.id)).toEqual(["fp-1"]);
  });
});
