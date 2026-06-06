import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PRODUCT_CARD_IMAGE_BG,
  PRODUCT_CARD_IMAGE_VARIANTS,
  PRODUCT_CARD_PLACEHOLDER_IMG,
} from "./productCardImageConstants";
import "./ProductCardImage.css";

/**
 * Product photo fills the card frame via background-size: cover (no letterbox padding).
 */
const ProductCardImage = ({
  src,
  alt,
  href,
  external = false,
  linkTarget,
  linkRel,
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

  const shellStyle = {
    backgroundImage: `url("${resolvedSrc}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    ...(backgroundColor && backgroundColor !== "transparent" ? { backgroundColor } : {}),
  };

  const useAnchor = external || (href && !href.startsWith("/"));

  const hitTarget =
    href &&
    (useAnchor ? (
      <a
        href={href}
        target={linkTarget}
        rel={linkRel}
        className={styles.link}
        aria-label={alt}
      />
    ) : (
      <Link to={href} target={linkTarget} rel={linkRel} className={styles.link} aria-label={alt} />
    ));

  return (
    <div className={`${styles.shell} ${className}`.trim()} style={shellStyle}>
      <img
        src={resolvedSrc}
        alt={alt}
        className="sr-only"
        onError={() => setResolvedSrc(PRODUCT_CARD_PLACEHOLDER_IMG)}
      />
      {hitTarget}
      {children}
    </div>
  );
};

export default ProductCardImage;
