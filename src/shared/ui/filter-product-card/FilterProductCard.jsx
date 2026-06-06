import { FaBalanceScale, FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ProductCardImage } from "shared/ui/product-card-image";

const FONT_STACK = '"Montserrat arm", Montserrat, sans-serif';

const TITLE_STYLE = {
  fontFamily: FONT_STACK,
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "24px",
  color: "rgba(21, 33, 71, 1)",
};

const DESC_STYLE = {
  fontFamily: FONT_STACK,
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "24px",
  color: "rgba(105, 105, 105, 1)",
};

const PRICE_STYLE = {
  fontFamily: FONT_STACK,
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "24px",
  color: "rgba(21, 33, 71, 1)",
};

const ACTION_BTN =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[rgba(21,33,71,1)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f8f9fc] active:scale-[0.98]";

const ImgWrap = ({ listMode, product }) => (
  <ProductCardImage
    variant={listMode ? "list" : "grid"}
    className={listMode ? "shrink-0" : "w-full shrink-0"}
    src={product.image}
    alt={product.title}
    href={product.href}
    external={Boolean(product.href && !product.href.startsWith("/"))}
  >
    <div className="pointer-events-auto absolute right-3 top-3 z-10 flex flex-col gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          product.onToggleCompare(product.id);
        }}
        aria-pressed={product.inCompare}
        aria-label={product.compareAria}
        className={ACTION_BTN}
      >
        <FaBalanceScale className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          product.onToggleWishlist(product);
        }}
        aria-pressed={product.inWishlist}
        aria-label={product.wishlistAria}
        className={ACTION_BTN}
      >
        {product.inWishlist ? (
          <FaHeart className="h-4 w-4 text-active-blue" aria-hidden />
        ) : (
          <FaRegHeart className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  </ProductCardImage>
);

const ProductTextLink = ({ product, omitTopMargin }) => {
  const inner = (
    <div className={`${omitTopMargin ? "mt-0" : "mt-3"} flex min-w-0 flex-col gap-1 text-start`}>
      <h3 className="m-0 line-clamp-2" style={TITLE_STYLE}>
        {product.title}
      </h3>
      <p className="m-0 line-clamp-2" style={DESC_STYLE} title={product.description}>
        {product.description}
      </p>
      <p className="m-0 mt-0.5" style={PRICE_STYLE}>
        {product.price}
      </p>
    </div>
  );
  if (product.href && product.href.startsWith("/")) {
    return (
      <Link to={product.href} className="no-underline outline-none">
        {inner}
      </Link>
    );
  }
  return (
    <a href={product.href} className="no-underline outline-none">
      {inner}
    </a>
  );
};

/**
 * @param {(product: { id: string, title: string, description: string, price: string, image: string, href: string }) => void} onToggleWishlist
 */
const FilterProductCard = ({
  product,
  listMode,
  inCompare,
  inWishlist,
  onToggleCompare,
  onToggleWishlist,
  compareAria,
  wishlistAria,
}) => {
  const p = {
    ...product,
    inCompare,
    inWishlist,
    onToggleCompare,
    onToggleWishlist,
    compareAria,
    wishlistAria,
  };

  if (listMode) {
    return (
      <article className="flex flex-row gap-4 rounded-xl border border-border-blue/40 bg-white p-3 text-start shadow-sm sm:p-4">
        <ImgWrap listMode product={p} />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <ProductTextLink product={product} omitTopMargin />
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col text-start">
      <ImgWrap listMode={false} product={p} />
      <ProductTextLink product={product} />
    </article>
  );
};

export default FilterProductCard;
