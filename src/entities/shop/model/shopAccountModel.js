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

/**
 * `description` starts empty, not a literal Armenian sentence: this shape is shared by every
 * locale, and a seller who signed in as English or Russian used to see the shop's "about"
 * text in Armenian regardless. The dashboard falls back to the translated
 * `shopAccount.defaultShopDescription` when this is empty (see ShopAccountDashboardWidget).
 */
export const defaultShopProfile = {
  shopName: "TechZone Electronics",
  description: "",
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

/**
 * Reference point for demo `createdAt` timestamps — a fixed literal, not `Date.now()`: this
 * module can run at build time and at request time, and a moving "now" would make a demo
 * listing's age (and therefore its position in the "newest first" sort in
 * `useShopAccountPresenter`) silently drift between them.
 */
const DEMO_SEED_BASE_MS = 1_730_000_000_000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * `index` is a listing's position in `DEMO_SHOP_PRODUCTS_SEED` below (0 = newest). Previously
 * every row's `createdAt` sat within 5 seconds of the others (1730000003000..1730000008300) —
 * large enough to look like a real timestamp but not a real chronology, since "newest first"
 * over a 5-second window is really just "array order with extra steps". Spread over ~6 months
 * instead, so the seller's product table reads like an account that has actually been
 * listing things over time.
 */
const daysBeforeBase = (index) => DEMO_SEED_BASE_MS - (2 + index * 3) * ONE_DAY_MS;

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
    createdAt: daysBeforeBase(0),
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
    createdAt: daysBeforeBase(1),
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
    createdAt: daysBeforeBase(2),
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
    createdAt: daysBeforeBase(3),
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
    createdAt: daysBeforeBase(4),
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
    createdAt: daysBeforeBase(5),
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
    createdAt: daysBeforeBase(6),
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
    createdAt: daysBeforeBase(7),
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
    createdAt: daysBeforeBase(8),
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
    createdAt: daysBeforeBase(9),
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
    createdAt: daysBeforeBase(10),
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
    createdAt: daysBeforeBase(11),
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
    createdAt: daysBeforeBase(12),
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
    createdAt: daysBeforeBase(13),
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
    createdAt: daysBeforeBase(14),
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
  {
    id: "demo-sp-16",
    title: "Google Pixel 9 128GB Wintergreen",
    description: "",
    descriptionKey: "",
    price: "385,000",
    priceAmd: 385_000,
    image: "",
    category: "Smartphones",
    createdAt: daysBeforeBase(15),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 12gb", "256 / 12gb"],
    colors: [
      { id: "wintergreen", hex: "#8fae9c" },
      { id: "obsidian", hex: "#1c1c1e" },
      { id: "porcelain", hex: "#f2efe9" },
    ],
  },
  {
    id: "demo-sp-17",
    title: "Xiaomi 14T Pro 512GB Titan Gray",
    description: "",
    descriptionKey: "",
    price: "445,000",
    priceAmd: 445_000,
    image: "",
    category: "Smartphones",
    createdAt: daysBeforeBase(16),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 12gb", "512 / 12gb"],
    colors: [
      { id: "titan-gray", hex: "#4a4a4d" },
      { id: "black", hex: "#1c1c1e" },
    ],
  },
  {
    id: "demo-sp-18",
    title: "OnePlus 12 256GB Flowy Emerald",
    description: "",
    descriptionKey: "",
    price: "465,000",
    priceAmd: 465_000,
    image: "",
    category: "Smartphones",
    createdAt: daysBeforeBase(17),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 12gb", "512 / 16gb"],
    colors: [
      { id: "emerald", hex: "#1f5f4a" },
      { id: "black", hex: "#1c1c1e" },
    ],
  },
  {
    id: "demo-sp-19",
    title: "Samsung Galaxy Z Fold6 512GB Navy",
    description: "",
    descriptionKey: "",
    price: "950,000",
    priceAmd: 950_000,
    image: "",
    category: "Smartphones",
    createdAt: daysBeforeBase(18),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 12gb", "512 / 12gb"],
    colors: [
      { id: "navy", hex: "#1e2a4a" },
      { id: "silver-shadow", hex: "#c7c7cc" },
    ],
  },
  {
    id: "demo-sp-20",
    title: "Apple iPhone 15 Plus 256GB Blue",
    description: "",
    descriptionKey: "",
    price: "495,000",
    priceAmd: 495_000,
    image: "",
    category: "Smartphones",
    createdAt: daysBeforeBase(19),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 6gb", "256 / 6gb"],
    colors: [
      { id: "blue", hex: "#4a6fa5" },
      { id: "black", hex: "#1c1c1e" },
      { id: "pink", hex: "#e8a0a8" },
    ],
  },
  {
    id: "demo-sp-21",
    title: "Honor Magic6 Pro 512GB Black",
    description: "",
    descriptionKey: "",
    price: "520,000",
    priceAmd: 520_000,
    image: "",
    category: "Smartphones",
    createdAt: daysBeforeBase(20),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 12gb", "512 / 12gb"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-22",
    title: "Motorola Edge 50 Pro 256GB Luxe Lavender",
    description: "",
    descriptionKey: "",
    price: "285,000",
    priceAmd: 285_000,
    image: "",
    category: "Smartphones",
    createdAt: daysBeforeBase(21),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 12gb"],
    colors: [
      { id: "lavender", hex: "#9d92c9" },
      { id: "black", hex: "#1c1c1e" },
    ],
  },
  {
    id: "demo-sp-23",
    title: "ASUS ROG Strix G16 RTX 4070 1TB Black",
    description: "",
    descriptionKey: "",
    price: "990,000",
    priceAmd: 990_000,
    image: "",
    category: "Laptops",
    createdAt: daysBeforeBase(22),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["16 / 1TB", "32 / 1TB"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-24",
    title: "Acer Aspire 5 15 512GB Silver",
    description: "",
    descriptionKey: "",
    price: "320,000",
    priceAmd: 320_000,
    image: "",
    category: "Laptops",
    createdAt: daysBeforeBase(23),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["8 / 512gb", "16 / 512gb"],
    colors: [{ id: "silver", hex: "#e3e4e6" }],
  },
  {
    id: "demo-sp-25",
    title: "Microsoft Surface Laptop 6 256GB Platinum",
    description: "",
    descriptionKey: "",
    price: "640,000",
    priceAmd: 640_000,
    image: "",
    category: "Laptops",
    createdAt: daysBeforeBase(24),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["256 / 16gb", "512 / 16gb"],
    colors: [
      { id: "platinum", hex: "#e8e8e8" },
      { id: "black", hex: "#1c1c1e" },
    ],
  },
  {
    id: "demo-sp-26",
    title: "LG Gram 16 512GB White",
    description: "",
    descriptionKey: "",
    price: "720,000",
    priceAmd: 720_000,
    image: "",
    category: "Laptops",
    createdAt: daysBeforeBase(25),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["16 / 512gb", "32 / 1TB"],
    colors: [{ id: "white", hex: "#f5f5f7" }],
  },
  {
    id: "demo-sp-27",
    title: "HP Pavilion Plus 14 512GB Ceramic White",
    description: "",
    descriptionKey: "",
    price: "480,000",
    priceAmd: 480_000,
    image: "",
    category: "Laptops",
    createdAt: daysBeforeBase(26),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["16 / 512gb"],
    colors: [{ id: "ceramic-white", hex: "#f2f0eb" }],
  },
  {
    id: "demo-sp-28",
    title: "MSI Modern 14 256GB Urban Silver",
    description: "",
    descriptionKey: "",
    price: "340,000",
    priceAmd: 340_000,
    image: "",
    category: "Laptops",
    createdAt: daysBeforeBase(27),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["8 / 256gb", "16 / 512gb"],
    colors: [{ id: "urban-silver", hex: "#c7c7cc" }],
  },
  {
    id: "demo-sp-29",
    title: "Bose QuietComfort Ultra Earbuds Black",
    description: "",
    descriptionKey: "",
    price: "150,000",
    priceAmd: 150_000,
    image: "",
    category: "Audio",
    createdAt: daysBeforeBase(28),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [
      { id: "black", hex: "#1c1c1e" },
      { id: "white", hex: "#f5f5f7" },
    ],
  },
  {
    id: "demo-sp-30",
    title: "JBL Live 770NC Wireless Headphones Blue",
    description: "",
    descriptionKey: "",
    price: "68,000",
    priceAmd: 68_000,
    image: "",
    category: "Audio",
    createdAt: daysBeforeBase(29),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [
      { id: "blue", hex: "#3d5a80" },
      { id: "black", hex: "#1c1c1e" },
    ],
  },
  {
    id: "demo-sp-31",
    title: "Sennheiser Momentum True Wireless 4 Graphite",
    description: "",
    descriptionKey: "",
    price: "145,000",
    priceAmd: 145_000,
    image: "",
    category: "Audio",
    createdAt: daysBeforeBase(30),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "graphite", hex: "#3a3a3c" }],
  },
  {
    id: "demo-sp-32",
    title: "Marshall Motif II ANC Earbuds Black",
    description: "",
    descriptionKey: "",
    price: "98,000",
    priceAmd: 98_000,
    image: "",
    category: "Audio",
    createdAt: daysBeforeBase(31),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-33",
    title: "Sonos Era 100 Smart Speaker White",
    description: "",
    descriptionKey: "",
    price: "175,000",
    priceAmd: 175_000,
    image: "",
    category: "Audio",
    createdAt: daysBeforeBase(32),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [
      { id: "white", hex: "#f5f5f7" },
      { id: "black", hex: "#1c1c1e" },
    ],
  },
  {
    id: "demo-sp-34",
    title: "Anker Soundcore Space One Headphones Black",
    description: "",
    descriptionKey: "",
    price: "52,000",
    priceAmd: 52_000,
    image: "",
    category: "Audio",
    createdAt: daysBeforeBase(33),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-35",
    title: "Samsung Galaxy Tab S9 FE 128GB Mint",
    description: "",
    descriptionKey: "",
    price: "245,000",
    priceAmd: 245_000,
    image: "",
    category: "Tablets",
    createdAt: daysBeforeBase(34),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 6gb", "256 / 8gb"],
    colors: [
      { id: "mint", hex: "#7ec8b8" },
      { id: "silver", hex: "#e3e4e6" },
    ],
  },
  {
    id: "demo-sp-36",
    title: "Lenovo Tab P12 256GB Storm Gray",
    description: "",
    descriptionKey: "",
    price: "195,000",
    priceAmd: 195_000,
    image: "",
    category: "Tablets",
    createdAt: daysBeforeBase(35),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 8gb", "256 / 8gb"],
    colors: [{ id: "storm-gray", hex: "#5a5d63" }],
  },
  {
    id: "demo-sp-37",
    title: "Apple iPad mini 7 128GB Purple",
    description: "",
    descriptionKey: "",
    price: "325,000",
    priceAmd: 325_000,
    image: "",
    category: "Tablets",
    createdAt: daysBeforeBase(36),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 8gb", "256 / 8gb"],
    colors: [
      { id: "purple", hex: "#7c6fa5" },
      { id: "starlight", hex: "#f5f0e8" },
    ],
  },
  {
    id: "demo-sp-38",
    title: "Xiaomi Redmi Pad Pro 256GB Graphite Gray",
    description: "",
    descriptionKey: "",
    price: "165,000",
    priceAmd: 165_000,
    image: "",
    category: "Tablets",
    createdAt: daysBeforeBase(37),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 8gb", "256 / 8gb"],
    colors: [{ id: "graphite", hex: "#3a3a3c" }],
  },
  {
    id: "demo-sp-39",
    title: "Huawei MatePad 11.5 256GB Space Gray",
    description: "",
    descriptionKey: "",
    price: "210,000",
    priceAmd: 210_000,
    image: "",
    category: "Tablets",
    createdAt: daysBeforeBase(38),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["128 / 8gb", "256 / 8gb"],
    colors: [{ id: "space-gray", hex: "#4a4a4d" }],
  },
  {
    id: "demo-sp-40",
    title: "Apple Watch SE 44mm Midnight",
    description: "",
    descriptionKey: "",
    price: "175,000",
    priceAmd: 175_000,
    image: "",
    category: "Wearables",
    createdAt: daysBeforeBase(39),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["40mm", "44mm"],
    colors: [
      { id: "midnight", hex: "#2e3642" },
      { id: "starlight", hex: "#f5f0e8" },
    ],
  },
  {
    id: "demo-sp-41",
    title: "Samsung Galaxy Watch FE 40mm Black",
    description: "",
    descriptionKey: "",
    price: "105,000",
    priceAmd: 105_000,
    image: "",
    category: "Wearables",
    createdAt: daysBeforeBase(40),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["40mm"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-42",
    title: "Garmin Forerunner 265 Black",
    description: "",
    descriptionKey: "",
    price: "285,000",
    priceAmd: 285_000,
    image: "",
    category: "Wearables",
    createdAt: daysBeforeBase(41),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-43",
    title: "Amazfit Balance 2 Black",
    description: "",
    descriptionKey: "",
    price: "115,000",
    priceAmd: 115_000,
    image: "",
    category: "Wearables",
    createdAt: daysBeforeBase(42),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-44",
    title: "Xiaomi Smart Band 9 Pro Black",
    description: "",
    descriptionKey: "",
    price: "45,000",
    priceAmd: 45_000,
    image: "",
    category: "Wearables",
    createdAt: daysBeforeBase(43),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-45",
    title: "LG 34WP65C 34-inch UltraWide Curved Monitor",
    description: "",
    descriptionKey: "",
    price: "245,000",
    priceAmd: 245_000,
    image: "",
    category: "Monitors",
    createdAt: daysBeforeBase(44),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-46",
    title: "Samsung ViewFinity S8 27-inch 4K Monitor",
    description: "",
    descriptionKey: "",
    price: "285,000",
    priceAmd: 285_000,
    image: "",
    category: "Monitors",
    createdAt: daysBeforeBase(45),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "white", hex: "#f5f5f7" }],
  },
  {
    id: "demo-sp-47",
    title: "BenQ PD2705U 27-inch 4K Designer Monitor",
    description: "",
    descriptionKey: "",
    price: "335,000",
    priceAmd: 335_000,
    image: "",
    category: "Monitors",
    createdAt: daysBeforeBase(46),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "graphite", hex: "#3a3a3c" }],
  },
  {
    id: "demo-sp-48",
    title: "AOC 24G2 24-inch 144Hz Gaming Monitor",
    description: "",
    descriptionKey: "",
    price: "95,000",
    priceAmd: 95_000,
    image: "",
    category: "Monitors",
    createdAt: daysBeforeBase(47),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-49",
    title: "Sony PlayStation 5 DualSense Edge Controller",
    description: "",
    descriptionKey: "",
    price: "95,000",
    priceAmd: 95_000,
    image: "",
    category: "Gaming",
    createdAt: daysBeforeBase(48),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "white", hex: "#ffffff" }],
  },
  {
    id: "demo-sp-50",
    title: "Microsoft Xbox Elite Series 2 Controller",
    description: "",
    descriptionKey: "",
    price: "105,000",
    priceAmd: 105_000,
    image: "",
    category: "Gaming",
    createdAt: daysBeforeBase(49),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-51",
    title: "Nintendo Switch Lite Turquoise",
    description: "",
    descriptionKey: "",
    price: "145,000",
    priceAmd: 145_000,
    image: "",
    category: "Gaming",
    createdAt: daysBeforeBase(50),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [
      { id: "turquoise", hex: "#3fa9a0" },
      { id: "gray", hex: "#8e8e93" },
    ],
  },
  {
    id: "demo-sp-52",
    title: "Steam Deck OLED 512GB",
    description: "",
    descriptionKey: "",
    price: "385,000",
    priceAmd: 385_000,
    image: "",
    category: "Gaming",
    createdAt: daysBeforeBase(51),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["512gb", "1TB"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-53",
    title: "Sony ZV-E10 II Mirrorless Vlogging Camera",
    description: "",
    descriptionKey: "",
    price: "495,000",
    priceAmd: 495_000,
    image: "",
    category: "Cameras",
    createdAt: daysBeforeBase(52),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Body only", "Kit"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-54",
    title: "DJI Osmo Pocket 3 Creator Combo",
    description: "",
    descriptionKey: "",
    price: "385,000",
    priceAmd: 385_000,
    image: "",
    category: "Cameras",
    createdAt: daysBeforeBase(53),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard", "Creator Combo"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-55",
    title: "Canon PowerShot G7X Mark III",
    description: "",
    descriptionKey: "",
    price: "385,000",
    priceAmd: 385_000,
    image: "",
    category: "Cameras",
    createdAt: daysBeforeBase(54),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-56",
    title: "Insta360 X4 360 Action Camera",
    description: "",
    descriptionKey: "",
    price: "295,000",
    priceAmd: 295_000,
    image: "",
    category: "Cameras",
    createdAt: daysBeforeBase(55),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-57",
    title: "TCL C845 55-inch Mini LED 4K TV",
    description: "",
    descriptionKey: "",
    price: "385,000",
    priceAmd: 385_000,
    image: "",
    category: "TV",
    createdAt: daysBeforeBase(56),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ['55"', '65"'],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-58",
    title: "Hisense A6K 43-inch 4K Smart TV",
    description: "",
    descriptionKey: "",
    price: "165,000",
    priceAmd: 165_000,
    image: "",
    category: "TV",
    createdAt: daysBeforeBase(57),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ['43"', '50"'],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-59",
    title: "Sony BRAVIA 3 50-inch LED 4K TV",
    description: "",
    descriptionKey: "",
    price: "345,000",
    priceAmd: 345_000,
    image: "",
    category: "TV",
    createdAt: daysBeforeBase(58),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ['50"', '55"'],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-60",
    title: "Logitech G29 Racing Wheel",
    description: "",
    descriptionKey: "",
    price: "195,000",
    priceAmd: 195_000,
    image: "",
    category: "Accessories",
    createdAt: daysBeforeBase(59),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
  },
  {
    id: "demo-sp-61",
    title: "TP-Link Deco X20 Mesh Wi-Fi Router (3-pack)",
    description: "",
    descriptionKey: "",
    price: "78,000",
    priceAmd: 78_000,
    image: "",
    category: "Accessories",
    createdAt: daysBeforeBase(60),
    availability: "in_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "white", hex: "#f5f5f7" }],
  },
  {
    id: "demo-sp-62",
    title: "Anker PowerCore 20000 Power Bank",
    description: "",
    descriptionKey: "",
    price: "38,000",
    priceAmd: 38_000,
    image: "",
    category: "Accessories",
    createdAt: daysBeforeBase(61),
    availability: "out_of_stock",
    logoLabel: "",
    badgeKey: "",
    shopUrlLabel: "",
    productUrl: "",
    variants: ["Standard"],
    colors: [{ id: "black", hex: "#1c1c1e" }],
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
