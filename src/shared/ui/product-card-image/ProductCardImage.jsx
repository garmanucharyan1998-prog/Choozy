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
 *
 * Two separate signals, because they are two separate decisions:
 *  - `eager` — this card is above the fold, so do not defer it. Loading was hardcoded to
 *    `"lazy"` here, which deferred the six category tiles that open the home page.
 *  - `lcp` — this is *the* image the Largest Contentful Paint is measured on. It sets
 *    `fetchPriority="high"`, which only means anything if at most one image claims it;
 *    marking a whole row "high" tells the browser nothing it can act on.
 *
 * Intrinsic dimensions ride along too: the CSS reserves the box via `aspect-ratio`, but the
 * `<img>` itself carried no size, which Lighthouse counts against CLS.
 */
const ProductCardImage = ({
  src,
  alt,
  variant = "grid",
  backgroundColor = PRODUCT_CARD_IMAGE_BG,
  className = "",
  eager = false,
  lcp = false,
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
        loading={eager || lcp ? "eager" : "lazy"}
        fetchPriority={lcp ? "high" : undefined}
        width={styles.aspectWidth}
        height={styles.aspectHeight}
        onError={() => setResolvedSrc(PRODUCT_CARD_PLACEHOLDER_IMG)}
      />
      {children}
    </div>
  );
};

export default ProductCardImage;
