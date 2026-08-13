import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";
import { ProductCardImage } from "shared/ui/product-card-image";
import { LocalizedLink } from "shared/ui/link";

/**
 * A compact recap of the columns being compared, pinned while the table itself is on screen —
 * GSMArena's top complaint from the competitive review was losing track of *which* products a
 * long spec table's rows even belong to.
 *
 * The table's own `<thead>` cannot do this job. Its scroll container is `overflow-x: auto`, and
 * CSS computes the other axis to `auto` alongside it, so the container is a scrollport in both
 * directions; a `position: sticky` header inside it sticks to a box that never scrolls
 * vertically and therefore never moves. Measured in a real browser: with `sticky; top: 200px`
 * on the header cells the row still rode away to -1121px. Hence a separate pinned strip.
 *
 * Two things about *where* it pins were wrong before and are the point of this file:
 *
 * 1. It pinned at `top: 0` under a header shell that is itself `sticky top-0` at `z-70` and
 *    198px tall on a desktop viewport — so the strip painted underneath it and was never once
 *    visible. `elementFromPoint` at its centre returned the search input. It now pins below
 *    the shell, using the `--header-shell-height` the shell already publishes.
 * 2. It was anchored to a sentinel *above* the table, so once passed it stayed for the rest of
 *    the page — still hovering over the radar, the bars and the footer, naming columns of a
 *    table that had scrolled away thousands of pixels earlier. It is now anchored to the table
 *    block itself and leaves with it.
 *
 * `isVisible` starts `false` and only a browser-only effect ever flips it, so the server and
 * the first client render agree by construction and this needs no separate hydration gate.
 * A scroll listener rather than an `IntersectionObserver`: the condition is "the block spans
 * the pin line", which is a comparison against a live offset, not a threshold crossing an
 * observer can be configured with once and left alone.
 */

/** What `index.css` reserves for the shell before it has been measured. */
const DEFAULT_HEADER_SHELL_HEIGHT = 132;

/** The y the strip pins at: the bottom edge of the site's own sticky header shell. */
const pinOffset = () => {
  const declared = getComputedStyle(document.documentElement).getPropertyValue(
    "--header-shell-height",
  );
  const parsed = Number.parseFloat(declared);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_HEADER_SHELL_HEIGHT;
};

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   products: { id: string, title: string, image: string, priceValue: number, href: string }[],
 *   isFixed: boolean,
 *   removeProduct: (id: string) => void,
 *   blockRef: import("react").RefObject<HTMLElement> — the table's own scroll container.
 * }} props
 */
export const CompareStickyHeader = ({ t, products, isFixed, removeProduct, blockRef }) => {
  /** `null` is "not pinned"; a number is the y it is pinned at. One state, so one re-render. */
  const [pinnedTop, setPinnedTop] = useState(null);
  const stripRef = useRef(null);

  useEffect(() => {
    const block = blockRef.current;
    if (!block || typeof window === "undefined") return undefined;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const pin = pinOffset();
      const rect = block.getBoundingClientRect();
      /** Only while the table crosses the pin line: past its top, not yet past its bottom. */
      if (rect.top >= pin || rect.bottom <= pin) {
        setPinnedTop(null);
        return;
      }
      /**
       * Over the last few pixels of the table the strip rides up with it instead of hanging at
       * the pin line until it blinks out — the same slide-out `position: sticky` would give,
       * which is what stops it from covering the section below the table on the way past.
       */
      const height = stripRef.current?.offsetHeight ?? 0;
      setPinnedTop(Math.min(pin, Math.round(rect.bottom - height)));
    };
    /** One measurement per frame at most — this runs on every scroll event. */
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    /** Runs once up front so a restored scroll position is honoured, not just later scrolling. */
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
    /** Re-measures when a column is dropped, which changes the block's height under us. */
  }, [blockRef, products]);

  if (pinnedTop === null) return null;

  const currencySuffix = t("productDetail.currencySuffix");

  return (
    <div
      ref={stripRef}
      /**
       * `z-[60]` sits above the page (the tray is 30, the scroll-to-top button 50) and below the
       * header shell's 70 — the strip hangs off the shell rather than covering the site's own
       * navigation, and the mobile panel scrim at 65 still dims it along with everything else.
       *
       * `top` is inline rather than a class because it is not a constant: it is the pin line
       * until the table starts leaving, and the table's own bottom edge after that.
       */
      style={{ top: `${pinnedTop}px` }}
      className="fixed inset-x-0 z-[60] border-b border-border-blue bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      role="region"
      aria-label={t("comparePage.stickyHeaderAria")}
    >
      {/** The page's own padding scale, so a pinned name sits over the column it belongs to. */}
      <div className="flex items-center gap-3 overflow-x-auto px-2.5 py-2 sm:px-[15px] md:px-[30px] lg:px-[50px] 2xl:px-[100px]">
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
