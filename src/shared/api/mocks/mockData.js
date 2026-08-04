export const mockProducts = [
  {
    id: 1,
    category: "electronics",
    type: "smartphone",
    brand: "Apple",
    model: "iPhone 17 Pro",
    title: "iPhone 17 Pro",
    price: 1299,
    priceNum: 1299,
    currency: "USD",
    rating: 4.8,
    image: "https://via.placeholder.com/300x300/007bff/ffffff?text=iPhone+17+Pro",
    inStock: true,
    specs: {
      connectivity: ["5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC"],
      colors: ["Space Black", "White", "Blue", "Purple"],
    },
    tags: ["premium", "new", "5g", "camera", "pro"],
    description: "The most advanced iPhone with a professional camera system.",
  },
  {
    id: 2,
    category: "electronics",
    type: "smartphone",
    brand: "Samsung",
    model: "Galaxy S25 Ultra",
    title: "Samsung Galaxy S25 Ultra",
    price: 1199,
    priceNum: 1199,
    currency: "USD",
    rating: 4.7,
    image: "https://via.placeholder.com/300x300/28a745/ffffff?text=Galaxy+S25",
    inStock: true,
    specs: {
      connectivity: ["5G", "Wi-Fi 7", "Bluetooth 5.4", "NFC"],
      colors: ["Titanium Black", "Titanium Gray", "Titanium Violet"],
    },
    tags: ["android", "stylus", "camera", "premium", "ultra"],
    description: "High-end Android flagship with S Pen and premium cameras.",
  },
  {
    id: 3,
    category: "electronics",
    type: "laptop",
    brand: "Apple",
    model: "MacBook Air M4",
    title: "MacBook Air M4",
    price: 1499,
    priceNum: 1499,
    currency: "USD",
    rating: 4.9,
    image: "https://via.placeholder.com/300x300/6f42c1/ffffff?text=MacBook+Air+M4",
    inStock: true,
    specs: {
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "Thunderbolt 4"],
      colors: ["Space Gray", "Silver", "Midnight"],
    },
    tags: ["lightweight", "powerful", "battery", "premium"],
    description: "Thin and light laptop with excellent performance.",
  },
  {
    id: 4,
    category: "electronics",
    type: "laptop",
    brand: "Dell",
    model: "XPS 14",
    title: "Dell XPS 14",
    price: 1299,
    priceNum: 1299,
    currency: "USD",
    rating: 4.5,
    image: "https://via.placeholder.com/300x300/17a2b8/ffffff?text=Dell+XPS+14",
    inStock: false,
    specs: {
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "Thunderbolt 4"],
      colors: ["Platinum Silver", "Graphite"],
    },
    tags: ["ultrabook", "compact", "oled", "premium"],
    description: "Compact ultrabook with OLED display.",
  },
  {
    id: 5,
    category: "electronics",
    type: "headphones",
    brand: "Sony",
    model: "WH-1000XM6",
    title: "Sony WH-1000XM6",
    price: 399,
    priceNum: 399,
    currency: "USD",
    rating: 4.7,
    image: "https://via.placeholder.com/300x300/ffc107/ffffff?text=Sony+WH1000XM6",
    inStock: true,
    specs: {
      connectivity: ["Bluetooth 5.3", "3.5mm", "USB-C"],
      colors: ["Black", "Silver"],
    },
    tags: ["wireless", "noise cancellation", "premium"],
    description: "Top-tier wireless noise-canceling headphones.",
  },
  {
    id: 6,
    category: "electronics",
    type: "tablet",
    brand: "Apple",
    model: "iPad Pro 13\" M4",
    title: "iPad Pro 13\" M4",
    price: 1199,
    priceNum: 1199,
    currency: "USD",
    rating: 4.7,
    image: "https://via.placeholder.com/300x300/007bff/ffffff?text=iPad+Pro+13",
    inStock: true,
    specs: {
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "Thunderbolt 4"],
      colors: ["Space Gray", "Silver"],
    },
    tags: ["tablet", "stylus", "premium", "creative"],
    description: "Powerful iPad with desktop-class performance.",
  },
  {
    id: 7,
    category: "electronics",
    type: "smartwatch",
    brand: "Apple",
    model: "Watch Series 10",
    title: "Apple Watch Series 10",
    price: 399,
    priceNum: 399,
    currency: "USD",
    rating: 4.5,
    image: "https://via.placeholder.com/300x300/007bff/ffffff?text=Watch+Series+10",
    inStock: true,
    specs: {
      connectivity: ["GPS", "Cellular", "Wi-Fi", "Bluetooth 5.3"],
      colors: ["Midnight", "Starlight", "Blue"],
    },
    tags: ["fitness", "health", "smart"],
    description: "Smartwatch for health tracking and daily use.",
  },
  {
    id: 8,
    category: "electronics",
    type: "gaming_console",
    brand: "Sony",
    model: "PlayStation 5 Pro",
    title: "PlayStation 5 Pro",
    price: 599,
    priceNum: 599,
    currency: "USD",
    rating: 4.8,
    image: "https://via.placeholder.com/300x300/003791/ffffff?text=PS5+Pro",
    inStock: false,
    specs: {
      connectivity: ["Wi-Fi 6", "Bluetooth 5.1", "Ethernet"],
      colors: ["White", "Black"],
    },
    tags: ["gaming", "next-gen", "4k", "ray tracing"],
    description: "Next-gen gaming console for high-performance play.",
  },
];

export const mockArmenianSuggestions = {
  բարձր: ["բարձրախոս", "շարժական բարձրախոս", "Bluetooth բարձրախոս"],
  սմարթֆոն: ["iPhone", "Samsung Galaxy", "Google Pixel", "սմարթֆոն"],
  հեռախոս: ["iPhone", "Samsung Galaxy", "հեռախոս"],
  նոութբուկ: ["MacBook", "Dell", "ASUS նոութբուկ"],
  պլանշետ: ["iPad", "Samsung Galaxy Tab", "պլանշետ"],
  լսափող: ["AirPods", "Sony", "Bose", "լսափող"],
  ժամացույց: ["Apple Watch", "Samsung Galaxy Watch", "խելացի ժամացույց"],
  խաղ: ["PlayStation", "Xbox", "Nintendo", "խաղային սարք"],
};

export const mockPopularSearches = [
  "iPhone 17 Pro",
  "MacBook Air M4",
  "Samsung Galaxy S25 Ultra",
  "Sony WH-1000XM6",
  "PlayStation 5 Pro",
  "iPad Pro 13\" M4",
];

export const mockCategories = [
  { id: "electronics", name: "Electronics", icon: "🔌", count: 8 },
  { id: "smartphones", name: "Smartphones", icon: "📱", count: 2 },
  { id: "laptops", name: "Laptops", icon: "💻", count: 2 },
  { id: "tablets", name: "Tablets", icon: "📋", count: 1 },
  { id: "headphones", name: "Headphones", icon: "🎧", count: 1 },
  { id: "smartwatches", name: "Smartwatches", icon: "⌚", count: 1 },
  { id: "gaming", name: "Gaming", icon: "🎮", count: 1 },
];

export const mockBrands = [
  { id: "apple", name: "Apple", logo: "🍎", productCount: 4 },
  { id: "samsung", name: "Samsung", logo: "📱", productCount: 1 },
  { id: "sony", name: "Sony", logo: "🎮", productCount: 2 },
  { id: "dell", name: "Dell", logo: "💻", productCount: 1 },
];

/** High-quality display crop; ProgressiveImage derives a tiny preview automatically. */
const PRODUCT_IMG_CROP = "auto=format&fit=crop&w=1200&h=900&q=85";

const PRODUCT_IMAGES = {
  iphoneOrange: `https://images.unsplash.com/photo-1592750475338-74b7b21085ab?${PRODUCT_IMG_CROP}`,
  macbook: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?${PRODUCT_IMG_CROP}`,
  samsungPhone: `https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?${PRODUCT_IMG_CROP}`,
  headphones: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?${PRODUCT_IMG_CROP}`,
  earbuds: `https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?${PRODUCT_IMG_CROP}`,
  watch: `https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?${PRODUCT_IMG_CROP}`,
  lens: `https://images.unsplash.com/photo-1502920917128-1aa500764cbd?${PRODUCT_IMG_CROP}`,
  tablet: `https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?${PRODUCT_IMG_CROP}`,
  tv: `https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?${PRODUCT_IMG_CROP}`,
  gamingLaptop: `https://images.unsplash.com/photo-1593642632823-8f785ba67e45?${PRODUCT_IMG_CROP}`,
};

export const mockTopProducts = [
  {
    id: "top-1",
    title: "Apple iPhone 17 Pro Max 256GB Cosmic Orange",
    price: "739,000 AMD",
    descriptionKey: "carouselProducts.top.top-1.description",
    image: PRODUCT_IMAGES.iphoneOrange,
  },
  {
    id: "top-2",
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: "165,000 AMD",
    descriptionKey: "carouselProducts.top.top-2.description",
    image: PRODUCT_IMAGES.headphones,
  },
  {
    id: "top-3",
    title: "Samsung Galaxy S25 Ultra 512GB Titanium Black",
    price: "615,000 AMD",
    descriptionKey: "carouselProducts.top.top-3.description",
    image: PRODUCT_IMAGES.samsungPhone,
  },
  {
    id: "top-4",
    title: "Sigma 30mm f/1.4 Contemporary DC DN",
    price: "185,000 AMD",
    descriptionKey: "carouselProducts.top.top-4.description",
    image: PRODUCT_IMAGES.lens,
  },
  {
    id: "top-5",
    title: "Apple MacBook Pro 14 M4 Pro 512GB Space Black",
    price: "1,290,000 AMD",
    descriptionKey: "carouselProducts.top.top-5.description",
    image: PRODUCT_IMAGES.macbook,
  },
  {
    id: "top-6",
    title: "Samsung Neo QLED 55-inch 4K Smart TV",
    price: "525,000 AMD",
    descriptionKey: "carouselProducts.top.top-6.description",
    image: PRODUCT_IMAGES.tv,
  },
];

export const mockVarietyProducts = [
  {
    id: "var-1",
    title: "Apple iPhone 17 Pro 128GB Natural Titanium",
    price: "629,000 AMD",
    descriptionKey: "carouselProducts.variety.var-1.description",
    image: PRODUCT_IMAGES.iphoneOrange,
  },
  {
    id: "var-2",
    title: "Apple AirPods Pro 2 USB-C",
    price: "129,000 AMD",
    descriptionKey: "carouselProducts.variety.var-2.description",
    image: PRODUCT_IMAGES.earbuds,
  },
  {
    id: "var-3",
    title: "Apple Watch Ultra 2 Titanium",
    price: "419,000 AMD",
    descriptionKey: "carouselProducts.variety.var-3.description",
    image: PRODUCT_IMAGES.watch,
  },
  {
    id: "var-4",
    title: "Samsung Galaxy Tab S10 Ultra 256GB",
    price: "585,000 AMD",
    descriptionKey: "carouselProducts.variety.var-4.description",
    image: PRODUCT_IMAGES.tablet,
  },
  {
    id: "var-5",
    title: "Apple MacBook Air 13 M3 256GB Midnight",
    price: "690,000 AMD",
    descriptionKey: "carouselProducts.variety.var-5.description",
    image: PRODUCT_IMAGES.macbook,
  },
  {
    id: "var-6",
    title: "Lenovo Legion 5 16-inch RTX Gaming Laptop",
    price: "790,000 AMD",
    descriptionKey: "carouselProducts.variety.var-6.description",
    image: PRODUCT_IMAGES.gamingLaptop,
  },
];

export const getProductsByCategory = (category) => {
  return mockProducts.filter((product) => product.category === category);
};

export const getProductsByType = (type) => {
  return mockProducts.filter((product) => product.type === type);
};

export const getProductsByBrand = (brand) => {
  return mockProducts.filter((product) => product.brand.toLowerCase() === brand.toLowerCase());
};

export const getProductsByPriceRange = (min, max) => {
  return mockProducts.filter((product) => product.price >= min && product.price <= max);
};

export const getInStockProducts = () => {
  return mockProducts.filter((product) => product.inStock);
};

const mockData = {
  products: mockProducts,
  topProducts: mockTopProducts,
  varietyProducts: mockVarietyProducts,
  categories: mockCategories,
  brands: mockBrands,
  popularSearches: mockPopularSearches,
  armenianSuggestions: mockArmenianSuggestions,
};

export default mockData;
