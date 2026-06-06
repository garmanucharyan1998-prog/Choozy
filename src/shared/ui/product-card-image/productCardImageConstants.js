export const PRODUCT_CARD_PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3C/svg%3E";

export const PRODUCT_CARD_IMAGE_BG = "transparent";

export const PRODUCT_CARD_IMAGE_VARIANTS = {
  grid: {
    shell: "product-card-image product-card-image--grid",
    link: "product-card-image__link",
    img: "product-card-image__media",
  },
  carousel: {
    shell: "product-card-image product-card-image--carousel",
    link: "product-card-image__link",
    img: "product-card-image__media",
  },
  list: {
    shell: "product-card-image product-card-image--list",
    link: "product-card-image__link",
    img: "product-card-image__media",
  },
};

export const handleProductCardImageError = (event) => {
  event.target.onerror = null;
  event.target.src = PRODUCT_CARD_PLACEHOLDER_IMG;
};
