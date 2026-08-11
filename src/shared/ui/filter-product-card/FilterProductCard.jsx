import { FaBalanceScale, FaHeart, FaRegHeart } from "react-icons/fa";
import { ProductCardImage } from "shared/ui/product-card-image";
import { LocalizedLink } from "shared/ui/link";

/** Responsive type scale — fixed inline px stayed oversized in the 2-column mobile grid. */
const TITLE_CLASS =
  "m-0 line-clamp-2 text-xs font-bold leading-tight text-navy sm:text-sm md:text-base";
const DESC_CLASS =
  "m-0 line-clamp-2 text-[11px] leading-snug text-text-muted sm:text-xs md:text-sm";
const PRICE_CLASS = "m-0 pt-0.5 text-sm font-semibold text-navy md:text-base";

const ACTION_BTN =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[rgba(21,33,71,1)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f8f9fc] active:scale-[0.98]";

const ImgWrap = ({ listMode, product, eager, lcp }) => (
  <ProductCardImage
    variant={listMode ? "list" : "grid"}
    className={listMode ? "shrink-0" : "w-full shrink-0"}
    src={product.image}
    alt={product.title}
    eager={eager}
    lcp={lcp}
  >
    <div className="pointer-events-auto absolute right-3 top-3 z-20 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => product.onToggleCompare(product.id)}
        aria-pressed={product.inCompare}
        aria-label={product.compareAria}
        className={ACTION_BTN}
      >
        <FaBalanceScale className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => product.onToggleWishlist(product)}
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

/**
 * Single stretched link per card: the title stays the anchor text (good for crawlers and
 * screen readers) while `after:inset-0` keeps the whole card clickable.
 */
const ProductTextLink = ({ product, priceLabel, descriptionText, omitTopPadding }) => (
  <LocalizedLink
    to={product.href}
    className={`flex min-w-0 flex-col gap-1 text-start no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
      omitTopPadding ? "" : "pt-3"
    }`}
  >
    <h3 className={TITLE_CLASS}>{product.title}</h3>
    <p className={DESC_CLASS} title={descriptionText}>
      {descriptionText}
    </p>
    <p className={PRICE_CLASS}>{priceLabel || product.price}</p>
  </LocalizedLink>
);

/**
 * @param {(product: { id: string, title: string, description: string, price: string, image: string, href: string }) => void} onToggleWishlist
 */
const FilterProductCard = ({
  product,
  priceLabel,
  descriptionText,
  eager = false,
  lcp = false,
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
      <article className="relative flex flex-row gap-4 rounded-xl border border-border-blue/40 bg-white p-3 text-start shadow-sm sm:p-4">
        <ImgWrap listMode product={p} eager={eager} lcp={lcp} />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <ProductTextLink
            product={product}
            priceLabel={priceLabel}
            descriptionText={descriptionText}
            omitTopPadding
          />
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex h-full flex-col text-start">
      <ImgWrap listMode={false} product={p} eager={eager} lcp={lcp} />
      <ProductTextLink product={product} priceLabel={priceLabel} descriptionText={descriptionText} />
    </article>
  );
};

export default FilterProductCard;
