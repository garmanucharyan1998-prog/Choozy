/**
 * The card frame reserves a 4:3 box in CSS (`aspect-ratio`); the `<img>` declares the same
 * ratio as intrinsic dimensions so the browser — and Lighthouse — can reserve space before
 * any CSS loads. The numbers are a ratio, not the served pixel size.
 */
export const PRODUCT_IMAGE_ASPECT_WIDTH = 4;
export const PRODUCT_IMAGE_ASPECT_HEIGHT = 3;

export const PRODUCT_CARD_PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3C/svg%3E";

export const PRODUCT_CARD_IMAGE_BG = "transparent";

export const PRODUCT_CARD_IMAGE_VARIANTS = {
  grid: {
    shell: "product-card-image product-card-image--grid",
    img: "product-card-image__media",
  },
  carousel: {
    shell: "product-card-image product-card-image--carousel",
    img: "product-card-image__media",
  },
  list: {
    shell: "product-card-image product-card-image--list",
    img: "product-card-image__media",
  },
};
