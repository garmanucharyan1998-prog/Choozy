import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";
import { ProductCardImage } from "shared/ui/product-card-image";
import { LocalizedLink } from "shared/ui/link";

/**
 * A compact recap of the columns being compared, pinned to the top of the viewport once the
 * real header (photos, names, remove buttons) has scrolled out of view — GSMArena's top
 * complaint from the competitive review was losing track of *which* products a long spec
 * table's rows even belong to.
 *
 * `isVisible` starts `false` and only an `IntersectionObserver` (browser-only, mount-only)
 * ever flips it — server and first client render agree by construction, so this needs no
 * separate hydration gate the way `localStorage`-backed state does.
 *
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   products: { id: string, title: string, image: string, priceValue: number, href: string }[],
 *   isFixed: boolean,
 *   removeProduct: (id: string) => void,
 *   sentinelRef: import("react").RefObject<HTMLElement>,
 * }} props
 */
export const CompareStickyHeader = ({ t, products, isFixed, removeProduct, sentinelRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return undefined;

    /** Visible once the sentinel — sitting just above the real header row — scrolls past the top. */
    const observer = new IntersectionObserver(([entry]) => setIsVisible(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef]);

  if (!isVisible) return null;

  const currencySuffix = t("productDetail.currencySuffix");

  return (
    <div
      className="fixed inset-x-0 top-0 z-30 border-b border-border-blue bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      role="region"
      aria-label={t("comparePage.stickyHeaderAria")}
    >
      <div className="mx-auto flex max-w-[1300px] items-center gap-3 overflow-x-auto px-3 py-2 md:px-6">
        {products.map((product) => (
          <div key={product.id} className="flex shrink-0 items-center gap-2">
            <LocalizedLink to={product.href} className="shrink-0" aria-hidden="true" tabIndex={-1}>
              <ProductCardImage
                variant="compare"
                className="w-9 md:w-10"
                src={product.image}
                alt=""
              />
            </LocalizedLink>
            <div className="min-w-0">
              <LocalizedLink
                to={product.href}
                className="m-0 block max-w-[9rem] truncate text-xs font-semibold text-navy no-underline hover:underline md:max-w-[14rem] md:text-sm"
              >
                {product.title}
              </LocalizedLink>
              <p className="m-0 text-xs text-text-muted md:text-sm">
                {formatPriceAmd(product.priceValue, currencySuffix)}
              </p>
            </div>
            {isFixed ? null : (
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                aria-label={`${t("comparePage.remove")} — ${product.title}`}
                className="shrink-0 rounded-full p-1 text-text-muted transition-colors hover:text-navy"
              >
                <FaTimes className="h-3 w-3" aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompareStickyHeader;
