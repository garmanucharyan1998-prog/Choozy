import { FaBalanceScale, FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3C/svg%3E";

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
  <div
    className={`relative shrink-0 overflow-hidden rounded-[20px] ${
      listMode ? "h-[140px] w-[160px] sm:h-[160px] sm:w-[180px]" : "min-h-[228px] sm:min-h-[248px] md:min-h-[268px]"
    }`}
    style={{ backgroundColor: "rgba(245, 245, 245, 1)" }}
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
          product.onToggleWishlist(product.id);
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
    <ProductImageLink product={product} listMode={listMode} />
  </div>
);

const ProductImageLink = ({ product, listMode }) => {
  const imgClass = `mx-auto block object-contain px-4 py-6 ${
    listMode
      ? "h-full max-h-[140px] w-full max-w-[140px] sm:max-h-[160px] sm:max-w-[160px]"
      : "h-[180px] w-full max-w-[220px] sm:h-[200px] sm:max-w-none md:h-[220px]"
  }`;
  const inner = (
    <img
      src={product.image || PLACEHOLDER_IMG}
      alt={product.title}
      className={imgClass}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = PLACEHOLDER_IMG;
      }}
    />
  );
  if (product.href && product.href.startsWith("/")) {
    return (
      <Link to={product.href} className="block outline-none">
        {inner}
      </Link>
    );
  }
  return (
    <a href={product.href} className="block outline-none">
      {inner}
    </a>
  );
};

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
 * @param {{ id: string, title: string, description: string, price: string, image: string, href: string }} product
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
