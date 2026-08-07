/**
 * Demo related products for the single product page carousel.
 * Replace with API data when backend integration is available.
 */

import { getProductDetailHref } from "entities/product-detail";

const DESC =
  "Recommended product with strong specs, realistic pricing, and a clean marketplace preview.";

const IMG_CROP = "auto=format&fit=crop&w=1200&h=900&q=85";

const IMG = {
  iphoneOrange: `https://images.unsplash.com/photo-1592750475338-74b7b21085ab?${IMG_CROP}`,
  macbook: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?${IMG_CROP}`,
  samsungPhone: `https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?${IMG_CROP}`,
  headphones: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?${IMG_CROP}`,
  earbuds: `https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?${IMG_CROP}`,
  watch: `https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?${IMG_CROP}`,
  lens: `https://images.unsplash.com/photo-1502920917128-1aa500764cbd?${IMG_CROP}`,
  tablet: `https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?${IMG_CROP}`,
};

export const mockRelatedProducts = [
  {
    id: "rel-1",
    title: "Apple iPhone 17 Pro Max 256GB Cosmic Orange",
    price: "739,000 դր.",
    description: DESC,
    image: IMG.iphoneOrange,
    href: getProductDetailHref("fp-1", "Apple iPhone 17 Pro Max 256GB Cosmic Orange"),
  },
  {
    id: "rel-2",
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: "165,000 դր.",
    description: DESC,
    image: IMG.headphones,
    href: getProductDetailHref("fp-3", "Sony WH-1000XM5 Wireless Headphones"),
  },
  {
    id: "rel-3",
    title: "Samsung Galaxy S25 Ultra 512GB Titanium Black",
    price: "615,000 դր.",
    description: DESC,
    image: IMG.samsungPhone,
    href: getProductDetailHref("fp-4", "Samsung Galaxy S25 Ultra 512GB Titanium Black"),
  },
  {
    id: "rel-4",
    title: "Apple Watch Ultra 2 Titanium",
    price: "419,000 դր.",
    description: DESC,
    image: IMG.watch,
    href: getProductDetailHref("fp-13", "Apple Watch Ultra 2 Titanium"),
  },
  {
    id: "rel-5",
    title: "Sigma 30mm f/1.4 Contemporary DC DN",
    price: "185,000 դր.",
    description: DESC,
    image: IMG.lens,
    href: getProductDetailHref("fp-5", "Sigma 30mm f/1.4 Contemporary DC DN"),
  },
  {
    id: "rel-6",
    title: "Apple MacBook Pro 14 M4 Pro 512GB Space Black",
    price: "1,290,000 դր.",
    description: DESC,
    image: IMG.macbook,
    href: getProductDetailHref("fp-2", "Apple MacBook Pro 14 M4 Pro 512GB Space Black"),
  },
  {
    id: "rel-7",
    title: "Apple AirPods Pro 2 USB-C",
    price: "129,000 դր.",
    description: DESC,
    image: IMG.earbuds,
    href: getProductDetailHref("fp-12", "Apple AirPods Pro 2 USB-C"),
  },
  {
    id: "rel-8",
    title: "Samsung Galaxy Tab S10 Ultra 256GB",
    price: "585,000 դր.",
    description: DESC,
    image: IMG.tablet,
    href: getProductDetailHref("fp-10", "Samsung Galaxy Tab S10 Ultra 256GB"),
  },
];
