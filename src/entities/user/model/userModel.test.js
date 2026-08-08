import { serializeSessionCookie } from "entities/session";
import {
  ACCOUNT_STORAGE_KEY,
  addWishlistProduct,
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
    addWishlistProduct(PRODUCT_B); // as buyer@test.com

    const accountRaw = JSON.parse(window.localStorage.getItem(accountKeyFor("buyer@test.com")));
    // fp-1 was merged in from the guest shelf on the first read under this identity.
    expect(accountRaw.wishlistItems.map((i) => i.id).sort()).toEqual(["fp-1", "fp-2"]);
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
    // First read under the new identity triggers the merge.
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
    const ids = readAccountState().wishlistItems.map((i) => i.id);
    expect(ids).toEqual(["fp-1"]);
  });

  test("logging out returns to the (now-empty, post-merge) guest shelf", () => {
    addWishlistProduct(PRODUCT_A); // guest
    setSessionCookie("buyer", "erin@test.com");
    readAccountState(); // merges + empties the guest shelf

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
});
