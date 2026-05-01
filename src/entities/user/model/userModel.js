import { sha256Hex } from "./passwordHash";

export const ACCOUNT_STORAGE_KEY = "choozy.account.v2";

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
  firstName: "Հովհաննիսյան",
  lastName: "Մարգարիտա",
  email: "test2025@gmail.com",
  phoneLocal: "93001002",
};

export const defaultWishlistItems = [
  {
    id: "wl-1",
    title: "Apple MacBook Pro 14",
    category: "Նոթբուք",
    priceLabel: "1 250 000 ֏",
  },
  {
    id: "wl-2",
    title: "Sony WH-1000XM5",
    category: "Ականջակալ",
    priceLabel: "185 000 ֏",
  },
];

export const defaultRecentlyViewed = [
  { id: "rv-1", title: "Apple MacBook Pro" },
  { id: "rv-2", title: "Samsung Galaxy S24" },
];

export const defaultAccountState = {
  profile: { ...defaultProfile },
  avatarDataUrl: "",
  notificationPrefs: { ...defaultNotificationPrefs },
  wishlistItems: defaultWishlistItems.map((item) => ({ ...item })),
  recentlyViewed: defaultRecentlyViewed.map((item) => ({ ...item })),
  subscriptionOptIn: false,
  passwordHash: "",
};

const isBrowser = () => typeof window !== "undefined" && Boolean(window.localStorage);

const normalizeAccountState = (raw) => {
  const value = raw && typeof raw === "object" ? raw : {};

  return {
    profile: {
      ...defaultProfile,
      ...(value.profile && typeof value.profile === "object" ? value.profile : {}),
    },
    avatarDataUrl: typeof value.avatarDataUrl === "string" ? value.avatarDataUrl : "",
    notificationPrefs: {
      ...defaultNotificationPrefs,
      ...(value.notificationPrefs && typeof value.notificationPrefs === "object" ? value.notificationPrefs : {}),
    },
    wishlistItems: Array.isArray(value.wishlistItems) ? value.wishlistItems : defaultWishlistItems.map((item) => ({ ...item })),
    recentlyViewed: Array.isArray(value.recentlyViewed) ? value.recentlyViewed : defaultRecentlyViewed.map((item) => ({ ...item })),
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
    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
};

export const hashPassword = (plainText) => sha256Hex(plainText);

export const userModel = {
  ACCOUNT_STORAGE_KEY,
  SIDEBAR_IDS,
  PERSONAL_INNER_TABS,
  defaultAccountState,
  hashPassword,
  readAccountState,
  writeAccountState,
};

export default userModel;
