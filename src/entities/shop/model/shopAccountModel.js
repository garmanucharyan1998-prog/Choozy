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
export const DEFAULT_PRODUCT_SWATCH_COLORS = ["#E8B923", "#111111", "#FFFFFF", "#6B8EAE"];

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
  shopName: "Shop Shop Electronics",
  description:
    "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ գնորդների և վաճառողների համար, ովքեր գնահատում են որակը և անհատականացումը։",
  email: "test2025@gmail.com",
  phoneLocal: "93001002",
  website: "testwebsite.com",
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
    variants: ["256GB / 12 GB", "256GB / 12 GB", "1 TB / 12 GB"],
    colors: [
      { id: "yellow", hex: "#E8B923" },
      { id: "black", hex: "#1c1c1e" },
      { id: "white", hex: "#FFFFFF" },
      { id: "blue", hex: "#4A90D9" },
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
    variants: ["256GB / 12 GB", "512GB / 12 GB"],
    colors: [
      { id: "gray", hex: "#8E8E93" },
      { id: "black", hex: "#1c1c1e" },
      { id: "violet", hex: "#5B4B8A" },
      { id: "yellow", hex: "#E8B923" },
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
    variants: ["128GB / 16 GB", "256GB / 16 GB"],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "white", hex: "#F5F5F7" },
      { id: "pink", hex: "#E8A0A8" },
      { id: "hazel", hex: "#9A8B7A" },
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
    variants: ["256GB / 16 GB", "512GB / 24 GB"],
    colors: [
      { id: "starlight", hex: "#F5F0E8" },
      { id: "silver", hex: "#E3E4E6" },
      { id: "midnight", hex: "#2E3642" },
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
      { id: "white", hex: "#F5F5F7" },
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
    variants: ["256GB / 8 GB", "512GB / 8 GB"],
    colors: [
      { id: "space-black", hex: "#1c1c1e" },
      { id: "silver", hex: "#E3E4E6" },
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
      { id: "silver", hex: "#C4C4C4" },
      { id: "blue", hex: "#3D5A80" },
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
    variants: ["32GB / 1 TB", "64GB / 2 TB"],
    colors: [
      { id: "platinum", hex: "#E8E8E8" },
      { id: "graphite", hex: "#3A3A3C" },
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
    variants: ["128GB / 8 GB", "256GB / 8 GB"],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "white", hex: "#F5F5F7" },
      { id: "mint", hex: "#7EC8B8" },
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
      { id: "white", hex: "#FFFFFF" },
      { id: "neon-red", hex: "#E60012" },
      { id: "neon-blue", hex: "#00AEDF" },
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
      { id: "white", hex: "#F5F5F7" },
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
      { id: "silver", hex: "#C7C7CC" },
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
      { id: "graphite", hex: "#3C3C43" },
      { id: "pale-gray", hex: "#D1D1D6" },
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
    variants: ["32GB / 1 TB", "16GB / 512 GB"],
    colors: [
      { id: "eclipse", hex: "#2B2B2D" },
      { id: "white", hex: "#F5F5F7" },
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
      { id: "blue", hex: "#0077B6" },
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
    base.availability === "out_of_stock" || base.availability === "in_stock" ? base.availability : "in_stock";

  const descriptionKey =
    typeof base.descriptionKey === "string" && base.descriptionKey.trim() ? base.descriptionKey.trim() : "";

  let badgeKey = typeof base.badgeKey === "string" && base.badgeKey.trim() ? base.badgeKey.trim() : "";
  if (badgeKey && !BADGE_KEY_WHITELIST.has(badgeKey)) {
    badgeKey = "";
  }

  let priceAmd;
  if (typeof base.priceAmd === "number" && Number.isFinite(base.priceAmd)) {
    priceAmd = base.priceAmd;
  } else {
    const priceStr = typeof base.price === "string" ? base.price.replace(/[^\d]/g, "") : "";
    priceAmd = priceStr ? parseInt(priceStr, 10) : undefined;
  }

  const createdAt = typeof base.createdAt === "number" ? base.createdAt : Date.now();
  const lastRefreshedAt = typeof base.lastRefreshedAt === "number" ? base.lastRefreshedAt : Date.now();

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

/**
 * @param {{ lastRefreshedAt?: number; createdAt?: number }} product
 * @param {number} [now]
 */
export const isShopProductStale = (product, now = Date.now()) => {
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
    description: typeof value.description === "string" ? value.description : defaultShopProfile.description,
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
      ...(value.notificationPrefs && typeof value.notificationPrefs === "object" ? value.notificationPrefs : {}),
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

export const readShopAccountState = () => {
  if (!isBrowser()) {
    return normalizeShopAccountState({ shopProducts: DEMO_SHOP_PRODUCTS_SEED });
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
    window.localStorage.setItem(SHOP_ACCOUNT_STORAGE_KEY, JSON.stringify(next));
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
