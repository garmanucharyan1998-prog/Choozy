import { useEffect, useState } from "react";
import { ProgressiveImage } from "shared/ui/progressive-image";
import {
  PRODUCT_CARD_IMAGE_BG,
  PRODUCT_CARD_IMAGE_VARIANTS,
  PRODUCT_CARD_PLACEHOLDER_IMG,
} from "./productCardImageConstants";
import "./ProductCardImage.css";

/**
 * Product photo frame — `object-fit: contain` keeps the whole product visible.
 * Shows a low-res preview first, then swaps to the original once loaded.
 *
 * Intentionally NOT a link: cards use a single stretched link around the title, so the
 * product is not announced twice by screen readers and crawlers see one anchor per card.
 * Overlay actions are passed as `children`.
 */
const ProductCardImage = ({
  src,
  alt,
  variant = "grid",
  backgroundColor = PRODUCT_CARD_IMAGE_BG,
  className = "",
  children,
}) => {
  const styles = PRODUCT_CARD_IMAGE_VARIANTS[variant] ?? PRODUCT_CARD_IMAGE_VARIANTS.grid;
  const initialSrc = src || PRODUCT_CARD_PLACEHOLDER_IMG;
  const [resolvedSrc, setResolvedSrc] = useState(initialSrc);

  useEffect(() => {
    setResolvedSrc(src || PRODUCT_CARD_PLACEHOLDER_IMG);
  }, [src]);

  const shellStyle =
    backgroundColor && backgroundColor !== "transparent" ? { backgroundColor } : undefined;

  return (
    <div className={`${styles.shell} ${className}`.trim()} style={shellStyle}>
      <ProgressiveImage
        src={resolvedSrc}
        alt={alt}
        imgClassName={styles.img}
        loading="lazy"
        onError={() => setResolvedSrc(PRODUCT_CARD_PLACEHOLDER_IMG)}
      />
      {children}
    </div>
  );
};

export default ProductCardImage;
