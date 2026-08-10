import { parseAmdInput } from "shared/lib/parseAmdInput";

/** Fired on same-tab updates after `writeShopAccountState`. */
export const SHOP_ACCOUNT_STORAGE_EVENT = "choozy-shop-account-storage";

export const SHOP_ACCOUNT_STORAGE_KEY = "choozy.shopAccount.v1";

/** Products are removed if not refreshed within this window. */
export const SHOP_PRODUCT_STALE_MS = 5 * 24 * 60 * 60 * 1000;

export const SHOP_SIDEBAR_IDS = {
  DETAILS: "shop-details",
  PRODUCTS: "products",
  STATISTICS: "statistics",
  FINANCE: "finance",
};

export const SHOP_INNER_TABS = {
  DATA: "data",
  NOTIFICATIONS: "notifications",
};

export const SHOP_NOTIFICATIONS_PAGE_TABS = {
  FEED: "feed",
  SETTINGS: "settings",
};

export const defaultShopNotificationPrefs = {
  priceDrops: true,
  wishlistUpdates: true,
  accountNews: false,
};

/** Default color dots when none stored (yellow, black, white, muted blue). */
export const DEFAULT_PRODUCT_SWATCH_COLORS = ["#e8b923", "#111111", "#ffffff", "#6b8eae"];

const DEFAULT_SWATCH_OBJECTS = () =>
  DEFAULT_PRODUCT_SWATCH_COLORS.map((hex, idx) => ({ id: `color-${idx}`, hex }));

const BADGE_KEY_WHITELIST = new Set(["productOffers.badges.discount", "productOffers.badges.new"]);

/**
 * @param {unknown} raw
 * @param {number} idx
 * @returns {{ id: string; hex: string } | null}
 */
const normalizeSwatch = (raw, idx) => {
  if (raw && typeof raw === "object" && typeof raw.hex === "string" && raw.hex.trim()) {
    const hex = raw.hex.trim();
    const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : `color-${idx}`;
    return { id, hex };
  }
  if (typeof raw === "string" && raw.trim()) {
    return { id: `color-${idx}`, hex: raw.trim() };
  }
  return null;
};

export const defaultShopProfile = {
  shopName: "TechZone Electronics",
  description:
    "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ գնորդների և վաճառողների համար, ովքեր գնահատում են որակը և անհատականացումը։",
  email: "seller.demo@choosy.am",
  phoneLocal: "99887766",
  website: "techzone.am",
};

export const defaultShopAccountState = {
  profile: { ...defaultShopProfile },
  avatarDataUrl: "",
  notificationPrefs: { ...defaultShopNotificationPrefs },
  shopProducts: [],
};

/** Demo catalog rows (shown until localStorage exists): shop admin table samples. */
export const DEMO_SHOP_PRODUCTS_SEED = [
  {
    id: "demo-sp-1",
    title: "Apple iPhone 16 Pro Max 1TB Black Titanium",
    description: "",
    descriptionKey: "",
    price: "550,000",
    priceAmd: 550_000,
    image: "",
    category: "Smartphones",
    createdAt: 1730000006000,
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 12gb", "1TB / 12gb"],
    colors: [
      { id: "yellow", hex: "#e8b923" },
      { id: "black", hex: "#1c1c1e" },
      { id: "white", hex: "#ffffff" },
      { id: "blue", hex: "#4a90d9" },
    ],
  },
  {
    id: "demo-sp-2",
    title: "Samsung Galaxy S24 Ultra 512GB Titanium Gray",
    description: "",
    descriptionKey: "",
    price: "480,000",
    priceAmd: 480_000,
    image: "",
    category: "Smartphones",
    createdAt: 1730000005000,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 12gb", "512 / 12gb"],
    colors: [
      { id: "gray", hex: "#8e8e93" },
      { id: "black", hex: "#1c1c1e" },
      { id: "violet", hex: "#5b4b8a" },
      { id: "yellow", hex: "#e8b923" },
    ],
  },
  {
    id: "demo-sp-3",
    title: "Google Pixel 9 Pro 256GB Obsidian",
    description: "",
    descriptionKey: "",
    price: "420,000",
    priceAmd: 420_000,
    image: "",
    category: "Smartphones",
    createdAt: 1730000004000,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 16gb", "256 / 16gb"],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "white", hex: "#f5f5f7" },
      { id: "pink", hex: "#e8a0a8" },
      { id: "hazel", hex: "#9a8b7a" },
    ],
  },
  {
    id: "demo-sp-4",
    title: 'MacBook Air 15" M3 512GB Starlight',
    description: "",
    descriptionKey: "",
    price: "680,000",
    priceAmd: 680_000,
    image: "",
    category: "Laptops",
    createdAt: 1730000003000,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 16gb", "512 / 24gb"],
    colors: [
      { id: "starlight", hex: "#f5f0e8" },
      { id: "silver", hex: "#e3e4e6" },
      { id: "midnight", hex: "#2e3642" },
    ],
  },
  {
    id: "demo-sp-5",
    title: "Apple AirPods Pro 2 USB-C",
    description: "",
    descriptionKey: "",
    price: "89,000",
    priceAmd: 89_000,
    image: "",
    category: "Audio",
    createdAt: 1730000007200,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["USB-C Case", "MagSafe"],
    colors: [
      { id: "white", hex: "#f5f5f7" },
      { id: "black", hex: "#1c1c1e" },
    ],
  },
  {
    id: "demo-sp-6",
    title: 'Apple iPad Pro 11" M4 256GB Space Black',
    description: "",
    descriptionKey: "",
    price: "380,000",
    priceAmd: 380_000,
    image: "",
    category: "Tablets",
    createdAt: 1730000007100,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 8gb", "512 / 8gb"],
    colors: [
      { id: "space-black", hex: "#1c1c1e" },
      { id: "silver", hex: "#e3e4e6" },
    ],
  },
  {
    id: "demo-sp-7",
    title: "Sony WH-1000XM5 Wireless Noise Canceling Black",
    description: "",
    descriptionKey: "",
    price: "185,000",
    priceAmd: 185_000,
    image: "",
    category: "Audio",
    createdAt: 1730000007000,
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Black", "Silver"],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "silver", hex: "#c4c4c4" },
      { id: "blue", hex: "#3d5a80" },
    ],
  },
  {
    id: "demo-sp-8",
    title: "Dell XPS 15 9530 OLED Core i7 32GB 1TB",
    description: "",
    descriptionKey: "",
    price: "920,000",
    priceAmd: 920_000,
    image: "",
    category: "Laptops",
    createdAt: 1730000007600,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["32 / 1TB", "64 / 2TB"],
    colors: [
      { id: "platinum", hex: "#e8e8e8" },
      { id: "graphite", hex: "#3a3a3c" },
    ],
  },
  {
    id: "demo-sp-9",
    title: "Nothing Phone (2a) 128GB Black",
    description: "",
    descriptionKey: "",
    price: "165,000",
    priceAmd: 165_000,
    image: "",
    category: "Smartphones",
    createdAt: 1730000007500,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 8gb", "256 / 8gb"],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "white", hex: "#f5f5f7" },
      { id: "mint", hex: "#7ec8b8" },
    ],
  },
  {
    id: "demo-sp-10",
    title: "Nintendo Switch OLED Model White",
    description: "",
    descriptionKey: "",
    price: "195,000",
    priceAmd: 195_000,
    image: "",
    category: "Gaming",
    createdAt: 1730000007400,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["OLED White", "OLED Neon"],
    colors: [
      { id: "white", hex: "#ffffff" },
      { id: "neon-red", hex: "#e60012" },
      { id: "neon-blue", hex: "#00aedf" },
    ],
  },
  {
    id: "demo-sp-11",
    title: "Canon EOS R50 Mirrorless Kit 18-45mm Black",
    description: "",
    descriptionKey: "",
    price: "310,000",
    priceAmd: 310_000,
    image: "",
    category: "Cameras",
    createdAt: 1730000007300,
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["18-45mm Kit", "Body only"],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "white", hex: "#f5f5f7" },
    ],
  },
  {
    id: "demo-sp-12",
    title: 'LG OLED evo C4 55" 4K Smart TV',
    description: "",
    descriptionKey: "",
    price: "1,250,000",
    priceAmd: 1_250_000,
    image: "",
    category: "TV",
    createdAt: 1730000008300,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ['55"', '65"', '77"'],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "silver", hex: "#c7c7cc" },
    ],
  },
  {
    id: "demo-sp-13",
    title: "Logitech MX Master 3S Wireless Mouse Graphite",
    description: "",
    descriptionKey: "",
    price: "42,000",
    priceAmd: 42_000,
    image: "",
    category: "Accessories",
    createdAt: 1730000008200,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Graphite", "Pale Gray"],
    colors: [
      { id: "graphite", hex: "#3c3c43" },
      { id: "pale-gray", hex: "#d1d1d6" },
    ],
  },
  {
    id: "demo-sp-14",
    title: "ASUS ROG Zephyrus G14 RTX 4060 32GB 1TB Eclipse Gray",
    description: "",
    descriptionKey: "",
    price: "890,000",
    priceAmd: 890_000,
    image: "",
    category: "Laptops",
    createdAt: 1730000008100,
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["32 / 1TB", "16 / 512gb"],
    colors: [
      { id: "eclipse", hex: "#2b2b2d" },
      { id: "white", hex: "#f5f5f7" },
    ],
  },
  {
    id: "demo-sp-15",
    title: "GoPro HERO12 Black Waterproof Action Camera",
    description: "",
    descriptionKey: "",
    price: "225,000",
    priceAmd: 225_000,
    image: "",
    category: "Cameras",
    createdAt: 1730000008000,
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard", "Creator Edition"],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "blue", hex: "#0077b6" },
    ],
  },
];

/**
 * @param {unknown} raw
 * @returns {{
 *   id: string;
 *   title: string;
 *   description: string;
 *   descriptionKey: string;
 *   price: string;
 *   priceAmd: number | undefined;
 *   image: string;
 *   category: string;
 *   createdAt: number;
 *   availability: "in_stock" | "out_of_stock";
 *   variants: string[];
 *   colors: { id: string; hex: string }[];
 *   logoLabel: string;
 *   badgeKey: string;
 *   shopUrlLabel: string;
 *   productUrl: string;
 *   categoryId: string;
 *   lastRefreshedAt: number;
 * }}
 */
export const normalizeShopProduct = (raw) => {
  const base = raw && typeof raw === "object" ? raw : {};
  const idRaw = base.id != null ? String(base.id) : "";

  let variants = [];
  if (Array.isArray(base.variants)) {
    variants = base.variants
      .filter((x) => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let colors = [];
  if (Array.isArray(base.colors)) {
    colors = base.colors.map((c, idx) => normalizeSwatch(c, idx)).filter(Boolean);
  }
  if (colors.length === 0) {
    colors = DEFAULT_SWATCH_OBJECTS();
  }

  const availability =
    base.availability === "out_of_stock" || base.availability === "in_stock"
      ? base.availability
      : "in_stock";

  const descriptionKey =
    typeof base.descriptionKey === "string" && base.descriptionKey.trim()
      ? base.descriptionKey.trim()
      : "";

  let badgeKey =
    typeof base.badgeKey === "string" && base.badgeKey.trim() ? base.badgeKey.trim() : "";
  if (badgeKey && !BADGE_KEY_WHITELIST.has(badgeKey)) {
    badgeKey = "";
  }

  let priceAmd;
  if (typeof base.priceAmd === "number" && Number.isFinite(base.priceAmd)) {
    priceAmd = base.priceAmd;
  } else {
    priceAmd = parseAmdInput(base.price) ?? undefined;
  }

  const createdAt = typeof base.createdAt === "number" ? base.createdAt : Date.now();
  const lastRefreshedAt =
    typeof base.lastRefreshedAt === "number" ? base.lastRefreshedAt : Date.now();

  return {
    id: idRaw,
    title: typeof base.title === "string" ? base.title : "",
    description: typeof base.description === "string" ? base.description : "",
    descriptionKey,
    price: typeof base.price === "string" ? base.price : "",
    priceAmd,
    image: typeof base.image === "string" ? base.image : "",
    category: typeof base.category === "string" ? base.category : "",
    categoryId: typeof base.categoryId === "string" ? base.categoryId.trim() : "",
    createdAt,
    lastRefreshedAt,
    availability,
    variants,
    colors,
    logoLabel: typeof base.logoLabel === "string" ? base.logoLabel.trim() : "",
    badgeKey,
    shopUrlLabel: typeof base.shopUrlLabel === "string" ? base.shopUrlLabel.trim() : "",
    productUrl: typeof base.productUrl === "string" ? base.productUrl.trim() : "",
  };
};

const DEMO_SEED_PRODUCT_IDS = new Set(DEMO_SHOP_PRODUCTS_SEED.map((product) => product.id));

/**
 * @param {{ id?: string, lastRefreshedAt?: number; createdAt?: number }} product
 * @param {number} [now]
 */
export const isShopProductStale = (product, now = Date.now()) => {
  /**
   * The demo catalog is fixture data, not a listing a seller is expected to refresh, so it
   * never expires. Without this the whole shop emptied itself permanently: the seed carries
   * no `lastRefreshedAt`, so `normalizeShopProduct` stamps it with "now" on every read —
   * harmless until the first write froze that stamp into storage. Five days later the
   * pruner deleted all 15 demo products, and because storage now existed the seed was
   * never consulted again, leaving the products tab blank forever.
   */
  if (product?.id && DEMO_SEED_PRODUCT_IDS.has(product.id)) return false;
  const refreshedAt = product?.lastRefreshedAt ?? product?.createdAt ?? now;
  return now - refreshedAt > SHOP_PRODUCT_STALE_MS;
};

/**
 * @param {ReturnType<typeof normalizeShopProduct>[]} products
 * @param {number} [now]
 */
export const pruneStaleShopProducts = (products, now = Date.now()) =>
  products.filter((product) => !isShopProductStale(product, now));

const isBrowser = () => typeof window !== "undefined" && Boolean(window.localStorage);

const normalizeShopProfile = (raw) => {
  const value = raw && typeof raw === "object" ? raw : {};
  return {
    shopName: typeof value.shopName === "string" ? value.shopName : defaultShopProfile.shopName,
    description:
      typeof value.description === "string" ? value.description : defaultShopProfile.description,
    email: typeof value.email === "string" ? value.email : defaultShopProfile.email,
    phoneLocal:
      typeof value.phoneLocal === "string"
        ? value.phoneLocal.replace(/\D/g, "").slice(0, 8)
        : defaultShopProfile.phoneLocal,
    website: typeof value.website === "string" ? value.website.trim() : defaultShopProfile.website,
  };
};

const normalizeShopAccountState = (raw) => {
  const value = raw && typeof raw === "object" ? raw : {};
  const rawProducts = Array.isArray(value.shopProducts) ? value.shopProducts : [];
  return {
    profile: normalizeShopProfile(value.profile),
    avatarDataUrl: typeof value.avatarDataUrl === "string" ? value.avatarDataUrl : "",
    notificationPrefs: {
      ...defaultShopNotificationPrefs,
      ...(value.notificationPrefs && typeof value.notificationPrefs === "object"
        ? value.notificationPrefs
        : {}),
    },
    shopProducts: pruneStaleShopProducts(rawProducts.map(normalizeShopProduct).filter((p) => p.id)),
  };
};

const readAndMaybePersistPrunedState = (rawState) => {
  const beforeCount = Array.isArray(rawState?.shopProducts) ? rawState.shopProducts.length : 0;
  const normalized = normalizeShopAccountState(rawState);
  const afterCount = normalized.shopProducts.length;

  if (isBrowser() && afterCount < beforeCount) {
    try {
      window.localStorage.setItem(SHOP_ACCOUNT_STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent(SHOP_ACCOUNT_STORAGE_EVENT));
    } catch {
      /* ignore quota errors */
    }
  }

  return normalized;
};

/**
 * What `readShopAccountState()` returns during SSR (no `localStorage` there). Exported so
 * a presenter's initial client-render state can call this exact same function instead of
 * hand-duplicating the expression — a copy that drifted out of sync would reintroduce the
 * same class of hydration mismatch this is meant to fix (see useShopAccountPresenter.js).
 */
export const getServerDefaultShopAccountState = () =>
  normalizeShopAccountState({ shopProducts: DEMO_SHOP_PRODUCTS_SEED });

export const readShopAccountState = () => {
  if (!isBrowser()) {
    return getServerDefaultShopAccountState();
  }

  try {
    const stored = window.localStorage.getItem(SHOP_ACCOUNT_STORAGE_KEY);
    if (!stored) {
      return readAndMaybePersistPrunedState({ shopProducts: DEMO_SHOP_PRODUCTS_SEED });
    }
    return readAndMaybePersistPrunedState(JSON.parse(stored));
  } catch {
    return readAndMaybePersistPrunedState({ shopProducts: DEMO_SHOP_PRODUCTS_SEED });
  }
};

export const writeShopAccountState = (partialOrFn) => {
  const current = readShopAccountState();
  const patch = typeof partialOrFn === "function" ? partialOrFn(current) : partialOrFn;
  const next = normalizeShopAccountState({
    ...current,
    ...(patch && typeof patch === "object" ? patch : {}),
  });

  if (isBrowser()) {
    try {
      window.localStorage.setItem(SHOP_ACCOUNT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /**
       * Quota exceeded (a shop avatar is allowed up to 200 KB as a base64 data URL — see
       * useShopAccountPresenter) or storage disabled in private mode. The write is lost,
       * but the returned state still drives the UI; throwing from here took the whole page
       * down, including from inside a FileReader callback where nothing catches it.
       * Matches entities/user's writeAccountState and the pruning write above.
       */
    }
    window.dispatchEvent(new CustomEvent(SHOP_ACCOUNT_STORAGE_EVENT));
  }

  return next;
};

export const shopAccountModel = {
  SHOP_ACCOUNT_STORAGE_KEY,
  SHOP_ACCOUNT_STORAGE_EVENT,
  SHOP_SIDEBAR_IDS,
  SHOP_INNER_TABS,
  SHOP_NOTIFICATIONS_PAGE_TABS,
  DEFAULT_PRODUCT_SWATCH_COLORS,
  DEMO_SHOP_PRODUCTS_SEED,
  defaultShopAccountState,
  normalizeShopProduct,
  readShopAccountState,
  writeShopAccountState,
};

export default shopAccountModel;
