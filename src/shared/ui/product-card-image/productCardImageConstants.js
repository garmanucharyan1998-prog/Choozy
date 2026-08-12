export const PRODUCT_CARD_PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3C/svg%3E";

export const PRODUCT_CARD_IMAGE_BG = "transparent";

/**
 * Each variant's CSS frame (`ProductCardImage.css`) reserves its own box via `aspect-ratio`;
 * `aspectWidth`/`aspectHeight` declare that same ratio as the `<img>`'s intrinsic dimensions
 * so the browser — and Lighthouse — can reserve space before any CSS loads. These are a
 * ratio, not the served pixel size. A single shared 4:3 pair here used to feed every variant,
 * including `list` (a 140–160px square in CSS) — mismatched intrinsic dimensions are exactly
 * the kind of thing Lighthouse counts against CLS, so each variant carries its own.
 */
export const PRODUCT_CARD_IMAGE_VARIANTS = {
  grid: {
    shell: "product-card-image product-card-image--grid",
    img: "product-card-image__media",
    aspectWidth: 4,
    aspectHeight: 3,
  },
  carousel: {
    shell: "product-card-image product-card-image--carousel",
    img: "product-card-image__media",
    aspectWidth: 4,
    aspectHeight: 3,
  },
  list: {
    shell: "product-card-image product-card-image--list",
    img: "product-card-image__media",
    aspectWidth: 1,
    aspectHeight: 1,
  },
  /** Comparison table column headers and the compare tray — see COMPARE_PAGE.md. */
  compare: {
    shell: "product-card-image product-card-image--compare",
    img: "product-card-image__media",
    aspectWidth: 1,
    aspectHeight: 1,
  },
};
