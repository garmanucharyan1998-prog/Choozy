export const mockProducts = [
  {
    id: 1,
    category: "electronics",
    type: "smartphone",
    brand: "Apple",
    model: "iPhone 17 Pro",
    title: "iPhone 17 Pro",
    price: 1299,
    currency: "USD",
    rating: 4.8,
    reviews: 2847,
    image: "https://via.placeholder.com/300x300/007bff/ffffff?text=iPhone+17+Pro",
    inStock: true,
    specs: {
      ram: 12,
      rom: 512,
      display: "6.7\" Super Retina XDR",
      processor: "A19 Pro",
      camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      battery: "4422mAh",
      os: "iOS 18",
      connectivity: ["5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC"],
      colors: ["Space Black", "White", "Blue", "Purple"],
      weight: "221g",
      dimensions: "159.9 x 76.7 x 8.25 mm"
    },
    tags: ["premium", "new", "5g", "camera", "pro"],
    description: "The most advanced iPhone with cutting-edge technology and professional camera system.",
    availability: {
      inStock: true,
      quantity: 45,
      shipping: "Free shipping",
      deliveryTime: "1-2 business days"
    }
  },
  {
    id: 2,
    category: "electronics",
    type: "smartphone",
    brand: "Apple",
    model: "iPhone 17",
    title: "iPhone 17",
    price: 999,
    currency: "USD",
    rating: 4.7,
    reviews: 1923,
    image: "https://via.placeholder.com/300x300/007bff/ffffff?text=iPhone+17",
    inStock: true,
    specs: {
      ram: 8,
      rom: 256,
      display: "6.2\" Super Retina XDR",
      processor: "A19",
      camera: "48MP Main + 12MP Ultra Wide",
      battery: "3850mAh",
      os: "iOS 18",
      connectivity: ["5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC"],
      colors: ["Space Black", "White", "Blue", "Pink"],
      weight: "171g",
      dimensions: "147.6 x 71.6 x 7.8 mm"
    },
    tags: ["popular", "new", "5g", "affordable"],
    description: "The perfect balance of features and value with the latest iPhone technology.",
    availability: {
      inStock: true,
      quantity: 78,
      shipping: "Free shipping",
      deliveryTime: "1-2 business days"
    }
  },
  {
    id: 3,
    category: "electronics",
    type: "smartphone",
    brand: "Samsung",
    model: "Galaxy S25 Ultra",
    title: "Samsung Galaxy S25 Ultra",
    price: 1199,
    currency: "USD",
    rating: 4.6,
    reviews: 2156,
    image: "https://via.placeholder.com/300x300/28a745/ffffff?text=Galaxy+S25",
    inStock: true,
    specs: {
      ram: 16,
      rom: 512,
      display: "6.8\" Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 4",
      camera: "200MP Main + 50MP Periscope + 12MP Ultra Wide + 10MP Telephoto",
      battery: "5000mAh",
      os: "Android 15",
      connectivity: ["5G", "Wi-Fi 7", "Bluetooth 5.4", "NFC", "UWB"],
      colors: ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"],
      weight: "232g",
      dimensions: "162.3 x 79.0 x 8.6 mm"
    },
    tags: ["android", "stylus", "camera", "premium", "ultra"],
    description: "The ultimate Android smartphone with S Pen and professional-grade camera system.",
    availability: {
      inStock: true,
      quantity: 32,
      shipping: "Free shipping",
      deliveryTime: "2-3 business days"
    }
  },
  {
    id: 4,
    category: "electronics",
    type: "smartphone",
    brand: "Google",
    model: "Pixel 9 Pro",
    title: "Google Pixel 9 Pro",
    price: 899,
    currency: "USD",
    rating: 4.5,
    reviews: 1432,
    image: "https://via.placeholder.com/300x300/dc3545/ffffff?text=Pixel+9+Pro",
    inStock: true,
    specs: {
      ram: 12,
      rom: 256,
      display: "6.7\" LTPO OLED",
      processor: "Google Tensor G4",
      camera: "50MP Main + 48MP Ultra Wide + 48MP Telephoto",
      battery: "5050mAh",
      os: "Android 15",
      connectivity: ["5G", "Wi-Fi 7", "Bluetooth 5.3", "NFC"],
      colors: ["Obsidian", "Porcelain", "Bay", "Mint"],
      weight: "213g",
      dimensions: "162.7 x 76.9 x 8.5 mm"
    },
    tags: ["android", "clean", "camera", "ai", "pure"],
    description: "Pure Android experience with advanced AI features and computational photography.",
    availability: {
      inStock: true,
      quantity: 67,
      shipping: "Free shipping",
      deliveryTime: "1-2 business days"
    }
  },
  {
    id: 5,
    category: "electronics",
    type: "smartphone",
    brand: "OnePlus",
    model: "12 Pro",
    title: "OnePlus 12 Pro",
    price: 799,
    currency: "USD",
    rating: 4.4,
    reviews: 987,
    image: "https://via.placeholder.com/300x300/ff6b35/ffffff?text=OnePlus+12",
    inStock: true,
    specs: {
      ram: 16,
      rom: 256,
      display: "6.82\" LTPO AMOLED",
      processor: "Snapdragon 8 Gen 3",
      camera: "50MP Main + 64MP Periscope + 48MP Ultra Wide",
      battery: "5400mAh",
      os: "OxygenOS 15",
      connectivity: ["5G", "Wi-Fi 7", "Bluetooth 5.4", "NFC"],
      colors: ["Silky Black", "Flowy Emerald", "Sunset Orange"],
      weight: "220g",
      dimensions: "164.3 x 75.8 x 9.15 mm"
    },
    tags: ["android", "fast", "charging", "performance"],
    description: "Never settle for less with flagship performance and lightning-fast charging.",
    availability: {
      inStock: true,
      quantity: 89,
      shipping: "Free shipping",
      deliveryTime: "2-3 business days"
    }
  },

  {
    id: 6,
    category: "electronics",
    type: "laptop",
    brand: "Apple",
    model: "MacBook Air M4",
    title: "MacBook Air M4",
    price: 1499,
    currency: "USD",
    rating: 4.9,
    reviews: 3421,
    image: "https://via.placeholder.com/300x300/6f42c1/ffffff?text=MacBook+Air+M4",
    inStock: true,
    specs: {
      ram: 16,
      rom: 512,
      display: "15\" Liquid Retina",
      processor: "Apple M4",
      graphics: "10-core GPU",
      battery: "Up to 18 hours",
      os: "macOS Sequoia",
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "2x Thunderbolt 4", "3.5mm headphone"],
      colors: ["Space Gray", "Silver", "Starlight", "Midnight"],
      weight: "1.51kg",
      dimensions: "340.4 x 237.6 x 15.6 mm"
    },
    tags: ["lightweight", "powerful", "long battery", "premium", "silent"],
    description: "Incredibly thin and light laptop with the power of M4 chip and all-day battery life.",
    availability: {
      inStock: true,
      quantity: 56,
      shipping: "Free shipping",
      deliveryTime: "1-2 business days"
    }
  },
  {
    id: 7,
    category: "electronics",
    type: "laptop",
    brand: "Apple",
    model: "MacBook Pro 16\" M4",
    title: "MacBook Pro 16\" M4",
    price: 2499,
    currency: "USD",
    rating: 4.8,
    reviews: 1876,
    image: "https://via.placeholder.com/300x300/6f42c1/ffffff?text=MacBook+Pro+16",
    inStock: true,
    specs: {
      ram: 32,
      rom: 1024,
      display: "16.2\" Liquid Retina XDR",
      processor: "Apple M4 Pro",
      graphics: "19-core GPU",
      battery: "Up to 22 hours",
      os: "macOS Sequoia",
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "3x Thunderbolt 4", "SDXC", "HDMI", "3.5mm"],
      colors: ["Space Black", "Silver"],
      weight: "2.16kg",
      dimensions: "355.7 x 248.1 x 16.8 mm"
    },
    tags: ["professional", "powerful", "display", "premium", "creative"],
    description: "The most powerful MacBook Pro with M4 Pro chip for professional workflows.",
    availability: {
      inStock: true,
      quantity: 23,
      shipping: "Free shipping",
      deliveryTime: "3-5 business days"
    }
  },
  {
    id: 8,
    category: "electronics",
    type: "laptop",
    brand: "Dell",
    model: "XPS 14",
    title: "Dell XPS 14",
    price: 1299,
    currency: "USD",
    rating: 4.5,
    reviews: 1234,
    image: "https://via.placeholder.com/300x300/17a2b8/ffffff?text=Dell+XPS+14",
    inStock: false,
    specs: {
      ram: 16,
      rom: 512,
      display: "14\" OLED 3.2K",
      processor: "Intel Core i7-1360P",
      graphics: "Intel Iris Xe",
      battery: "Up to 12 hours",
      os: "Windows 11 Home",
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "2x Thunderbolt 4", "microSD"],
      colors: ["Platinum Silver", "Graphite"],
      weight: "1.27kg",
      dimensions: "312.5 x 215.1 x 14.8 mm"
    },
    tags: ["ultrabook", "compact", "oled", "premium"],
    description: "Ultra-compact laptop with stunning OLED display and premium build quality.",
    availability: {
      inStock: false,
      quantity: 0,
      shipping: "Not available",
      deliveryTime: "Out of stock"
    }
  },
  {
    id: 9,
    category: "electronics",
    type: "laptop",
    brand: "ASUS",
    model: "ROG Zephyrus G16",
    title: "ASUS ROG Zephyrus G16",
    price: 1799,
    currency: "USD",
    rating: 4.3,
    reviews: 876,
    image: "https://via.placeholder.com/300x300/fd7e14/ffffff?text=ROG+Zephyrus",
    inStock: true,
    specs: {
      ram: 32,
      rom: 1024,
      display: "16\" QHD+ 165Hz",
      processor: "Intel Core i9-13900H",
      graphics: "NVIDIA RTX 4070",
      battery: "Up to 6 hours",
      os: "Windows 11 Home",
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "USB-C", "HDMI 2.1", "RJ45"],
      colors: ["Eclipse Gray", "Moonlight White"],
      weight: "2.1kg",
      dimensions: "354 x 246 x 19.9 mm"
    },
    tags: ["gaming", "powerful", "rgb", "gaming laptop"],
    description: "High-performance gaming laptop with RTX 4070 and 165Hz display.",
    availability: {
      inStock: true,
      quantity: 12,
      shipping: "Free shipping",
      deliveryTime: "3-5 business days"
    }
  },

  {
    id: 10,
    category: "electronics",
    type: "tablet",
    brand: "Apple",
    model: "iPad Pro 13\" M4",
    title: "iPad Pro 13\" M4",
    price: 1199,
    currency: "USD",
    rating: 4.7,
    reviews: 2341,
    image: "https://via.placeholder.com/300x300/007bff/ffffff?text=iPad+Pro+13",
    inStock: true,
    specs: {
      ram: 16,
      rom: 512,
      display: "13\" Liquid Retina XDR",
      processor: "Apple M4",
      graphics: "10-core GPU",
      battery: "Up to 10 hours",
      os: "iPadOS 18",
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "Thunderbolt 4", "5G (cellular)"],
      colors: ["Space Gray", "Silver"],
      weight: "682g",
      dimensions: "281.6 x 215.5 x 5.1 mm"
    },
    tags: ["large screen", "professional", "stylus", "premium", "creative"],
    description: "The most powerful iPad with M4 chip and stunning 13-inch Liquid Retina XDR display.",
    availability: {
      inStock: true,
      quantity: 34,
      shipping: "Free shipping",
      deliveryTime: "1-2 business days"
    }
  },
  {
    id: 11,
    category: "electronics",
    type: "tablet",
    brand: "Samsung",
    model: "Galaxy Tab S10 Ultra",
    title: "Samsung Galaxy Tab S10 Ultra",
    price: 899,
    currency: "USD",
    rating: 4.4,
    reviews: 1456,
    image: "https://via.placeholder.com/300x300/28a745/ffffff?text=Tab+S10+Ultra",
    inStock: true,
    specs: {
      ram: 12,
      rom: 256,
      display: "14.6\" Super AMOLED",
      processor: "Snapdragon 8 Gen 3",
      graphics: "Adreno 750",
      battery: "11200mAh",
      os: "Android 15",
      connectivity: ["Wi-Fi 6E", "Bluetooth 5.3", "USB-C", "5G (cellular)"],
      colors: ["Graphite", "Beige", "Silver"],
      weight: "732g",
      dimensions: "326.4 x 208.6 x 5.5 mm"
    },
    tags: ["android", "stylus", "multimedia", "large screen"],
    description: "Premium Android tablet with S Pen and stunning 14.6-inch Super AMOLED display.",
    availability: {
      inStock: true,
      quantity: 28,
      shipping: "Free shipping",
      deliveryTime: "2-3 business days"
    }
  },

  {
    id: 12,
    category: "electronics",
    type: "headphones",
    brand: "Apple",
    model: "AirPods Pro 3",
    title: "AirPods Pro 3",
    price: 249,
    currency: "USD",
    rating: 4.6,
    reviews: 4567,
    image: "https://via.placeholder.com/300x300/007bff/ffffff?text=AirPods+Pro+3",
    inStock: true,
    specs: {
      type: "True Wireless",
      driverSize: "11mm",
      battery: "6 hours (earbuds), 30 hours (case)",
      connectivity: ["Bluetooth 5.3", "USB-C"],
      features: ["Active Noise Cancellation", "Transparency Mode", "Spatial Audio", "Find My"],
      colors: ["White"],
      weight: "5.6g per earbud",
      dimensions: "45.2 x 60.9 x 21.7 mm (case)"
    },
    tags: ["wireless", "noise cancellation", "popular", "spatial audio"],
    description: "The most advanced AirPods with enhanced noise cancellation and spatial audio.",
    availability: {
      inStock: true,
      quantity: 156,
      shipping: "Free shipping",
      deliveryTime: "1-2 business days"
    }
  },
  {
    id: 13,
    category: "electronics",
    type: "headphones",
    brand: "Sony",
    model: "WH-1000XM6",
    title: "Sony WH-1000XM6",
    price: 399,
    currency: "USD",
    rating: 4.7,
    reviews: 2891,
    image: "https://via.placeholder.com/300x300/ffc107/ffffff?text=Sony+WH1000XM6",
    inStock: true,
    specs: {
      type: "Over-ear",
      driverSize: "30mm",
      battery: "Up to 30 hours",
      connectivity: ["Bluetooth 5.3", "3.5mm", "USB-C"],
      features: ["Industry-leading Noise Cancellation", "360 Reality Audio", "Quick Attention", "Speak-to-Chat"],
      colors: ["Black", "Silver", "Midnight Blue"],
      weight: "254g",
      dimensions: "210 x 185 x 85 mm"
    },
    tags: ["over-ear", "noise cancellation", "premium", "long battery", "audio quality"],
    description: "Industry-leading noise-canceling headphones with exceptional sound quality.",
    availability: {
      inStock: true,
      quantity: 67,
      shipping: "Free shipping",
      deliveryTime: "1-2 business days"
    }
  },

  {
    id: 14,
    category: "electronics",
    type: "smartwatch",
    brand: "Apple",
    model: "Watch Series 10",
    title: "Apple Watch Series 10",
    price: 399,
    currency: "USD",
    rating: 4.5,
    reviews: 3124,
    image: "https://via.placeholder.com/300x300/007bff/ffffff?text=Watch+Series+10",
    inStock: true,
    specs: {
      display: "45mm Always-On Retina",
      processor: "S10 SiP",
      battery: "Up to 18 hours",
      connectivity: ["GPS", "Cellular", "Wi-Fi", "Bluetooth 5.3"],
      features: ["ECG", "Blood Oxygen", "Fall Detection", "Emergency SOS", "Water Resistant"],
      colors: ["Midnight", "Starlight", "Pink", "Blue", "Red"],
      weight: "38.8g (45mm)",
      dimensions: "45 x 38 x 10.7 mm"
    },
    tags: ["fitness", "health", "smart", "popular", "waterproof"],
    description: "The most advanced Apple Watch with health monitoring and fitness tracking.",
    availability: {
      inStock: true,
      quantity: 89,
      shipping: "Free shipping",
      deliveryTime: "1-2 business days"
    }
  },

  {
    id: 15,
    category: "electronics",
    type: "gaming_console",
    brand: "Sony",
    model: "PlayStation 5 Pro",
    title: "PlayStation 5 Pro",
    price: 599,
    currency: "USD",
    rating: 4.8,
    reviews: 1876,
    image: "https://via.placeholder.com/300x300/003791/ffffff?text=PS5+Pro",
    inStock: false,
    specs: {
      processor: "AMD Zen 2 (Enhanced)",
      graphics: "AMD RDNA 3",
      storage: "1TB NVMe SSD",
      memory: "16GB GDDR6",
      connectivity: ["Wi-Fi 6", "Bluetooth 5.1", "Gigabit Ethernet", "USB-A", "USB-C"],
      features: ["4K Gaming", "Ray Tracing", "3D Audio", "Backward Compatibility"],
      colors: ["White", "Black"],
      weight: "4.5kg",
      dimensions: "390 x 260 x 96 mm"
    },
    tags: ["gaming", "next-gen", "popular", "4k", "ray tracing"],
    description: "The most powerful PlayStation console with enhanced 4K gaming and ray tracing.",
    availability: {
      inStock: false,
      quantity: 0,
      shipping: "Not available",
      deliveryTime: "Pre-order only"
    }
  },

  {
    id: 16,
    category: "electronics",
    type: "tv",
    brand: "Samsung",
    model: "Neo QLED 8K QN95D 75\"",
    title: "Samsung Neo QLED 8K QN95D 75\"",
    price: 3999,
    currency: "USD",
    rating: 4.6,
    reviews: 543,
    image: "https://via.placeholder.com/300x300/1f1f23/ffffff?text=Samsung+8K+TV",
    inStock: true,
    specs: {
      display: "75\" 8K Neo QLED",
      resolution: "7680 x 4320",
      processor: "Neo Quantum Processor 8K",
      connectivity: ["HDMI 2.1 x4", "USB x3", "Wi-Fi 6E", "Bluetooth 5.2", "Ethernet"],
      features: ["Quantum HDR 32X", "Object Tracking Sound", "Gaming Hub", "Smart TV"],
      colors: ["Titan Black"],
      weight: "32.5kg",
      dimensions: "1677 x 963 x 42.6 mm"
    },
    tags: ["8k", "large", "smart tv", "premium", "gaming"],
    description: "Ultimate 8K Neo QLED TV with AI upscaling and gaming features.",
    availability: {
      inStock: true,
      quantity: 8,
      shipping: "Free shipping",
      deliveryTime: "5-7 business days"
    }
  }
];

export const mockArmenianSuggestions = {
  "բարձր": ["բարձրախոս", "բարձրախոսներ", "շարժական բարձրախոս", "Bluetooth բարձրախոս"],
  "բարձրախոս": ["բարձրախոս", "շարժական բարձրախոս", "Bluetooth բարձրախոս", "JBL բարձրախոս"],
  "շարժական": ["շարժական բարձրախոս", "շարժական հեռախոս", "շարժական սարք"],
  "սմարթֆոն": ["iPhone", "Samsung Galaxy", "Google Pixel", "սմարթֆոն"],
  "հեռախոս": ["iPhone", "Samsung Galaxy", "հեռախոս", "շարժական հեռախոս"],
  "նոութբուկ": ["MacBook", "Dell", "Lenovo", "ASUS նոութբուկ"],
  "կոմպյուտեր": ["նոութբուկ", "դեսկտոփ", "կոմպյուտեր"],
  "պլանշետ": ["iPad", "Samsung Galaxy Tab", "պլանշետ"],
  "լսափող": ["AirPods", "Sony", "Bose", "լսափող"],
  "լսարան": ["լսարան", "լսափող", "Bluetooth լսարան"],
  "ժամացույց": ["Apple Watch", "Samsung Galaxy Watch", "խելացի ժամացույց"],
  "խաղ": ["PlayStation", "Xbox", "Nintendo", "խաղային սարք"],
  "հեռուստացույց": ["Samsung TV", "LG TV", "հեռուստացույց"],
  "լուսանկար": ["կամերա", "լուսանկարիչ", "iPhone կամերա"],
  "կամերա": ["կամերա", "լուսանկարիչ", "GoPro", "DSLR"]
};

export const mockPopularSearches = [
  "iPhone 17 Pro",
  "MacBook Air M4",
  "Samsung Galaxy S25",
  "AirPods Pro 3",
  "PlayStation 5 Pro",
  "iPad Pro 13\"",
  "Sony WH-1000XM6",
  "Apple Watch Series 10"
];

export const mockCategories = [
  { id: "electronics", name: "Electronics", icon: "🔌", count: 16 },
  { id: "smartphones", name: "Smartphones", icon: "📱", count: 5 },
  { id: "laptops", name: "Laptops", icon: "💻", count: 4 },
  { id: "tablets", name: "Tablets", icon: "📋", count: 2 },
  { id: "headphones", name: "Headphones", icon: "🎧", count: 2 },
  { id: "smartwatches", name: "Smartwatches", icon: "⌚", count: 1 },
  { id: "gaming", name: "Gaming", icon: "🎮", count: 1 },
  { id: "tvs", name: "TVs", icon: "📺", count: 1 }
];

export const mockBrands = [
  { id: "apple", name: "Apple", logo: "🍎", productCount: 8 },
  { id: "samsung", name: "Samsung", logo: "📱", productCount: 3 },
  { id: "sony", name: "Sony", logo: "🎮", productCount: 2 },
  { id: "dell", name: "Dell", logo: "💻", productCount: 1 },
  { id: "asus", name: "ASUS", logo: "⚡", productCount: 1 },
  { id: "google", name: "Google", logo: "🔍", productCount: 1 },
  { id: "oneplus", name: "OnePlus", logo: "➕", productCount: 1 }
];

export const getProductsByCategory = (category) => {
  return mockProducts.filter(product => product.category === category);
};

export const getProductsByType = (type) => {
  return mockProducts.filter(product => product.type === type);
};

export const getProductsByBrand = (brand) => {
  return mockProducts.filter(product => product.brand.toLowerCase() === brand.toLowerCase());
};

export const getProductsByPriceRange = (min, max) => {
  return mockProducts.filter(product => product.price >= min && product.price <= max);
};

export const getInStockProducts = () => {
  return mockProducts.filter(product => product.inStock);
};

export default {
  products: mockProducts,
  categories: mockCategories,
  brands: mockBrands,
  popularSearches: mockPopularSearches,
  armenianSuggestions: mockArmenianSuggestions
};