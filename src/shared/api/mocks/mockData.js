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

export const mockTopProducts = [
  {
    id: "top-1",
    title: "Apple iPhone 16 Pro Max 1TB Black Titanium",
    price: "489,600 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/smartphone.png",
  },
  {
    id: "top-2",
    title: "SONY: Ականջակալներ",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/earphones.png",
  },
  {
    id: "top-3",
    title: "SLING: Դրամապանակ",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/bag.png",
  },
  {
    id: "top-4",
    title: "Sigma 30mm f/1.4 Contemporary DC DN",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/objective.png",
  },
  {
    id: "top-5",
    title: "Apple MacBook Pro 14",
    price: "1,200,000 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/smartphone.png",
  },
  {
    id: "top-6",
    title: "Sony 4K TV",
    price: "450,000 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/bag.png",
  },
];

export const mockVarietyProducts = [
  {
    id: "var-1",
    title: "Apple iPhone 16 Pro Max 1TB Black Titanium",
    price: "489,600 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/smartphone.png",
  },
  {
    id: "var-2",
    title: "SONY: Ականջակալներ",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/earphones.png",
  },
  {
    id: "var-3",
    title: "SLING: Դրամապանակ",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/bag.png",
  },
  {
    id: "var-4",
    title: "Sigma 30mm f/1.4 Contemporary DC DN",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/objective.png",
  },
  {
    id: "var-5",
    title: "Apple MacBook Pro 14",
    price: "1,200,000 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/smartphone.png",
  },
  {
    id: "var-6",
    title: "Sony 4K TV",
    price: "450,000 AMD",
    description: "Choosy-ը նոր առցանգ շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/bag.png",
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
