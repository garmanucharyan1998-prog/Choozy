import { sha256Hex } from "./passwordHash";
import { getDefaultProductDetailPath, getProductDetailHref } from "entities/product-detail";

export const ACCOUNT_STORAGE_KEY = "choozy.account.v2";

/** Fired on same-tab updates after `writeAccountState` (storage event only fires across tabs). */
export const ACCOUNT_STORAGE_EVENT = "choozy-account-storage";

export const SIDEBAR_IDS = {
  PERSONAL: "personal",
  WISHLIST: "wishlist",
  RECENT: "recent",
  SUBSCRIPTION: "subscription",
  NOTIFICATIONS: "notifications",
};

export const PERSONAL_INNER_TABS = {
  DATA: "data",
  NOTIFICATIONS: "notifications",
};

export const defaultNotificationPrefs = {
  priceDrops: true,
  wishlistUpdates: true,
  accountNews: false,
};

export const defaultProfile = {
  firstName: "Անի",
  lastName: "Պետրոսյան",
  email: "buyer.demo@choosy.am",
  phoneLocal: "91234567",
};

export const defaultWishlistItems = [
  {
    id: "wl-1",
    title: "Bag for notebook",
    category: "Accessories",
    description: "Choosy demo copy for wishlist grid — premium marketplace placeholder text.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/bag.png",
    href: getProductDetailHref("fp-4", "Bag for notebook"),
  },
  {
    id: "wl-2",
    title: "Bag for notebook",
    category: "Accessories",
    description: "Choosy demo copy for wishlist grid — premium marketplace placeholder text.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/bag.png",
    href: getProductDetailHref("fp-4", "Bag for notebook"),
  },
  {
    id: "wl-3",
    title: "Bag for notebook",
    category: "Accessories",
    description: "Choosy demo copy for wishlist grid — premium marketplace placeholder text.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/bag.png",
    href: getProductDetailHref("fp-4", "Bag for notebook"),
  },
  {
    id: "wl-4",
    title: "Bag for notebook",
    category: "Accessories",
    description: "Choosy demo copy for wishlist grid — premium marketplace placeholder text.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/bag.png",
    href: getProductDetailHref("fp-4", "Bag for notebook"),
  },
  {
    id: "wl-5",
    title: "Bag for notebook",
    category: "Accessories",
    description: "Choosy demo copy for wishlist grid — premium marketplace placeholder text.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/bag.png",
    href: getProductDetailHref("fp-4", "Bag for notebook"),
  },
  {
    id: "wl-6",
    title: "Bag for notebook",
    category: "Accessories",
    description: "Choosy demo copy for wishlist grid — premium marketplace placeholder text.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/bag.png",
    href: getProductDetailHref("fp-4", "Bag for notebook"),
  },
  {
    id: "wl-7",
    title: "Bag for notebook",
    category: "Accessories",
    description: "Choosy demo copy for wishlist grid — premium marketplace placeholder text.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/bag.png",
    href: getProductDetailHref("fp-4", "Bag for notebook"),
  },
  {
    id: "wl-8",
    title: "Bag for notebook",
    category: "Accessories",
    description: "Choosy demo copy for wishlist grid — premium marketplace placeholder text.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/bag.png",
    href: getProductDetailHref("fp-4", "Bag for notebook"),
  },
];

export const defaultRecentlyViewed = [
  {
    id: "rv-1",
    title: "Bag for notebook",
    description: "Choosy online marketplace demo line for recently viewed product cards.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/smartphone.png",
    href: getProductDetailHref("fp-1", "Bag for notebook"),
  },
  {
    id: "rv-2",
    title: "Bag for notebook",
    description: "Choosy online marketplace demo line for recently viewed product cards.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/smartphone.png",
    href: getProductDetailHref("fp-1", "Bag for notebook"),
  },
  {
    id: "rv-3",
    title: "Bag for notebook",
    description: "Choosy online marketplace demo line for recently viewed product cards.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/smartphone.png",
    href: getProductDetailHref("fp-1", "Bag for notebook"),
  },
  {
    id: "rv-4",
    title: "Bag for notebook",
    description: "Choosy online marketplace demo line for recently viewed product cards.",
    price: "489,600 AMD",
    image: "/assets/images/gridCatalog/smartphone.png",
    href: getProductDetailHref("fp-1", "Bag for notebook"),
  },
  {
    id: "rv-5",
    title: "Sony WH-1000XM5 Wireless Headphones",
    description: "Choosy online marketplace demo line for recently viewed product cards.",
    price: "165,000 AMD",
    image: "/assets/images/gridCatalog/headphone.png",
    href: getProductDetailHref("fp-3", "Sony WH-1000XM5 Wireless Headphones"),
  },
  {
    id: "rv-6",
    title: "Apple MacBook Pro 14 M4 Pro 512GB Space Black",
    description: "Choosy online marketplace demo line for recently viewed product cards.",
    price: "1,290,000 AMD",
    image: "/assets/images/gridCatalog/notebook.png",
    href: getProductDetailHref("fp-2", "Apple MacBook Pro 14 M4 Pro 512GB Space Black"),
  },
  {
    id: "rv-7",
    title: "Samsung Galaxy S25 Ultra 512GB Titanium Black",
    description: "Choosy online marketplace demo line for recently viewed product cards.",
    price: "615,000 AMD",
    image: "/assets/images/gridCatalog/smartphone.png",
    href: getProductDetailHref("fp-4", "Samsung Galaxy S25 Ultra 512GB Titanium Black"),
  },
  {
    id: "rv-8",
    title: "Apple AirPods Pro 2 USB-C",
    description: "Choosy online marketplace demo line for recently viewed product cards.",
    price: "129,000 AMD",
    image: "/assets/images/gridCatalog/earphones.png",
    href: getProductDetailHref("fp-12", "Apple AirPods Pro 2 USB-C"),
  },
];

/**
 * A fresh visitor starts with empty lists: seeding the wishlist made the header badge
 * claim "8" before anything was saved, and it desynced prerendered HTML from the
 * hydrated client whenever real data existed.
 * `defaultWishlistItems` / `defaultRecentlyViewed` are kept as demo fixtures.
 */
export const defaultAccountState = {
  profile: { ...defaultProfile },
  avatarDataUrl: "",
  notificationPrefs: { ...defaultNotificationPrefs },
  wishlistItems: [],
  recentlyViewed: [],
  subscriptionOptIn: false,
  passwordHash: "",
};

const isBrowser = () => typeof window !== "undefined" && Boolean(window.localStorage);

/**
 * @param {unknown} item
 * @returns {{ id: string, title: string, description: string, price: string, image: string, href: string, category: string }}
 */
export const normalizeWishlistItem = (item) => {
  if (!item || typeof item !== "object") {
    return {
      id: "",
      title: "",
      description: "",
      price: "",
      image: "",
      href: getDefaultProductDetailPath(),
      category: "",
    };
  }
  const id = typeof item.id === "string" || typeof item.id === "number" ? String(item.id) : "";
  const title = typeof item.title === "string" ? item.title : "";
  const description =
    typeof item.description === "string"
      ? item.description
      : typeof item.desc === "string"
        ? item.desc
        : "";
  const price =
    typeof item.price === "string"
      ? item.price
      : typeof item.priceLabel === "string"
        ? item.priceLabel
        : "";
  const image = typeof item.image === "string" ? item.image : "";
  const href =
    typeof item.href === "string" && item.href.startsWith("/")
      ? item.href
      : getProductDetailHref(id || "apple-macbook-pro-demo", title);
  const category = typeof item.category === "string" ? item.category : "";
  return { id, title, description, price, image, href, category };
};

/** Same shape as wishlist rows; used for `recentlyViewed` normalization. */
export const normalizeRecentItem = normalizeWishlistItem;

const MAX_RECENTLY_VIEWED = 12;

const normalizeAccountState = (raw) => {
  const value = raw && typeof raw === "object" ? raw : {};

  const rawWishlist = Array.isArray(value.wishlistItems) ? value.wishlistItems : [];

  return {
    profile: {
      ...defaultProfile,
      ...(value.profile && typeof value.profile === "object" ? value.profile : {}),
    },
    avatarDataUrl: typeof value.avatarDataUrl === "string" ? value.avatarDataUrl : "",
    notificationPrefs: {
      ...defaultNotificationPrefs,
      ...(value.notificationPrefs && typeof value.notificationPrefs === "object"
        ? value.notificationPrefs
        : {}),
    },
    wishlistItems: rawWishlist.map((item) => normalizeWishlistItem(item)).filter((item) => item.id),
    recentlyViewed: (Array.isArray(value.recentlyViewed) ? value.recentlyViewed : [])
      .map((item) => normalizeRecentItem(item))
      .filter((item) => item.id),
    subscriptionOptIn: Boolean(value.subscriptionOptIn),
    passwordHash: typeof value.passwordHash === "string" ? value.passwordHash : "",
  };
};

export const readAccountState = () => {
  if (!isBrowser()) {
    return normalizeAccountState(null);
  }

  try {
    const stored = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return stored ? normalizeAccountState(JSON.parse(stored)) : normalizeAccountState(null);
  } catch {
    return normalizeAccountState(null);
  }
};

export const writeAccountState = (partialOrFn) => {
  const current = readAccountState();
  const patch = typeof partialOrFn === "function" ? partialOrFn(current) : partialOrFn;
  const next = normalizeAccountState({
    ...current,
    ...(patch && typeof patch === "object" ? patch : {}),
  });

  if (isBrowser()) {
    try {
      window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /**
       * Quota exceeded (a large avatar data URL) or storage disabled in private mode.
       * The write is lost, but the in-memory state below still drives the UI — throwing
       * here used to take the whole page down.
       */
    }
    window.dispatchEvent(new CustomEvent(ACCOUNT_STORAGE_EVENT));
  }

  return next;
};

/**
 * @param {{ id: string, title: string, description?: string, price: string, image?: string, href?: string, category?: string }} product
 */
export const addWishlistProduct = (product) => {
  const normalized = normalizeWishlistItem(product);
  if (!normalized.id) return readAccountState();

  return writeAccountState((state) => {
    if (state.wishlistItems.some((x) => x.id === normalized.id)) {
      return state;
    }
    return { ...state, wishlistItems: [...state.wishlistItems, normalized] };
  });
};

export const removeWishlistProduct = (productId) =>
  writeAccountState((state) => ({
    ...state,
    wishlistItems: state.wishlistItems.filter((x) => x.id !== String(productId)),
  }));

/**
 * @param {{ id: string, title: string, description?: string, price: string, image?: string, href?: string, category?: string }} product
 */
export const toggleWishlistProduct = (product) => {
  const id = product?.id != null ? String(product.id) : "";
  if (!id) return readAccountState();
  const current = readAccountState();
  if (current.wishlistItems.some((x) => x.id === id)) {
    return removeWishlistProduct(id);
  }
  return addWishlistProduct(product);
};

export const isWishlistProductId = (productId) => {
  if (productId == null) return false;
  return readAccountState().wishlistItems.some((x) => x.id === String(productId));
};

/**
 * @param {{ id: string, title: string, description?: string, price: string, image?: string, href?: string, category?: string }} product
 */
export const pushRecentlyViewedProduct = (product) => {
  const normalized = normalizeRecentItem(product);
  if (!normalized.id) return readAccountState();

  return writeAccountState((state) => {
    const without = state.recentlyViewed.filter((x) => x.id !== normalized.id);
    return { ...state, recentlyViewed: [normalized, ...without].slice(0, MAX_RECENTLY_VIEWED) };
  });
};

export const hashPassword = (plainText) => sha256Hex(plainText);

export const userModel = {
  ACCOUNT_STORAGE_KEY,
  ACCOUNT_STORAGE_EVENT,
  SIDEBAR_IDS,
  PERSONAL_INNER_TABS,
  defaultAccountState,
  hashPassword,
  readAccountState,
  writeAccountState,
  addWishlistProduct,
  removeWishlistProduct,
  toggleWishlistProduct,
  isWishlistProductId,
  pushRecentlyViewedProduct,
  normalizeRecentItem,
};

export default userModel;
