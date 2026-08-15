import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";
import { ProductCardImage } from "shared/ui/product-card-image";
import { LocalizedLink } from "shared/ui/link";
import { CompareSeriesToken } from "./CompareSeriesToken";
import { FOCUS_RING } from "./compareStyles";

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
 * Three things about *where* it pins were wrong before, and between them they are the point of
 * this file:
 *
 * 1. It pinned at `top: 0` under a header shell that is itself `sticky top-0` at `z-70` and
 *    ~200px tall on a desktop viewport — so the strip painted underneath it and was never once
 *    visible. `elementFromPoint` at its centre returned the search input.
 * 2. It then pinned to `--header-shell-height`, which is the height the layout *reserves*, not
 *    the header's edge; once the header compacts on scroll the two differ, and the strip hung
 *    47px below it with the table scrolling through the gap. It now measures the painted header
 *    (see `pinOffset`).
 * 3. It was anchored to a sentinel *above* the table, so once passed it stayed for the rest of
 *    the page — still hovering over the radar, the bars and the footer, naming columns of a
 *    table that had scrolled away thousands of pixels earlier. It is now anchored to the table
 *    block itself and leaves with it.
 *
 * `pinnedTop` starts `null` and only a browser-only effect ever sets it, so the server and
 * the first client render agree by construction and this needs no separate hydration gate.
 * A scroll listener rather than an `IntersectionObserver`: the condition is "the block spans
 * the pin line", which is a comparison against a live offset, not a threshold crossing an
 * observer can be configured with once and left alone.
 */

/** What `index.css` reserves for the shell before it has been measured. */
const DEFAULT_HEADER_SHELL_HEIGHT = 132;

/**
 * Below this viewport height the strip is not pinned at all.
 *
 * It is a label bar for the table underneath it, and it only earns its ~50px if there is a
 * useful amount of table left to label. On a landscape phone there is not: measured on a
 * 667x375 viewport, the site header holds 180px at the top and the mobile bottom nav another
 * 92px, so pinning the strip left a 58px slot — one table row — to read four products in. The
 * strip was labelling a table the visitor could no longer see.
 *
 * 500px clears every phone in portrait (the shortest common one is 568px tall) and every
 * tablet and desktop window, so this only ever takes effect in landscape or in a desktop
 * window deliberately squashed to a similar height — exactly the cases where the space is
 * better spent on the table.
 *
 * Compared with `<=`, to match the `short` screen (`max-height: 500px`) that stops the site
 * header pinning. The two have to agree exactly: at a viewport of precisely 500px the header
 * un-pins, and a strip that still pinned would hang at the old header's offset with clear air
 * above it.
 */
const MIN_VIEWPORT_HEIGHT_TO_PIN = 500;

/**
 * The y the strip pins at: the bottom edge of the header shell *as painted right now*.
 *
 * Deliberately not `--header-shell-height`. That variable is the height the layout *reserves*,
 * and `useSiteShellPresenter` only ever republishes it while the header is expanded — on purpose,
 * so the spacer keeps its size and the page does not jump when the header compacts on scroll.
 * The painted header is shorter than the reservation from that moment on: 154px against 201px on
 * a desktop viewport, 151 against 176 on a phone. Pinning to the reservation left the strip
 * floating 47px below the header with the table scrolling through the gap.
 */
const pinOffset = () => {
  const shell = document.querySelector("[data-header-shell]");
  if (shell) {
    /**
     * Whatever the shell measures, including nothing. A header that has scrolled away has a
     * bottom edge at or above 0 and is covering nothing, so the pin line is the top of the
     * viewport. This used to fall through to the *reserved* height in that case, which would
     * park the strip ~176px down a screen with clear air above it — reachable now that the
     * header stops pinning on short viewports, and wrong before that too for any header that
     * happened to be scrolled past.
     */
    return Math.max(0, shell.getBoundingClientRect().bottom);
  }
  /** No shell in the tree at all — a component test, or the widget mounted on its own. */
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
export const CompareStickyHeader = ({
  t,
  products,
  seriesColors,
  isFixed,
  removeProduct,
  blockRef,
}) => {
  /** `null` is "not pinned"; a number is the y it is pinned at. One state, so one re-render. */
  const [pinnedTop, setPinnedTop] = useState(null);
  const stripRef = useRef(null);

  useEffect(() => {
    const block = blockRef.current;
    if (!block || typeof window === "undefined") return undefined;

    let frame = 0;
    const measure = () => {
      frame = 0;
      /** Re-read every measurement, not just on mount: rotating a phone changes this one. */
      if (window.innerHeight <= MIN_VIEWPORT_HEIGHT_TO_PIN) {
        setPinnedTop(null);
        return;
      }
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

    /**
     * The header's height animates over 300ms as it compacts. Scrolling usually keeps firing
     * through that, but a visitor who stops exactly at the threshold would otherwise leave the
     * strip parked at the pre-animation offset.
     */
    const shell = document.querySelector("[data-header-shell]");
    const shellObserver =
      shell && typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (shellObserver) shellObserver.observe(shell);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (shellObserver) shellObserver.disconnect();
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
      {/**
       * The page's own padding scale, so the strip lines up with the table under it.
       *
       * The scrollbar here is a phone affordance and nothing else. Every entry used to be
       * `shrink-0` at every width, so four Armenian titles at their `14rem` cap overflowed a
       * 1440px window by ~110px and the strip grew a full-width horizontal scrollbar on a desktop
       * — chrome pinned over the table, costing a row of it, to scroll content that had room to
       * fit. From `md` up the entries share the width instead and their titles truncate into it;
       * comparison is capped at four products, so that always resolves. Below `md` they keep
       * their intrinsic width and scroll, because a phone genuinely cannot hold four of them.
       *
       * `overflow-x-auto` stays on at every width deliberately: it is inert once the row fits,
       * and if anything ever does exceed the space it scrolls rather than bleeding off the page.
       */}
      <div className="flex items-center gap-4 overflow-x-auto px-2.5 py-2 sm:px-[15px] md:px-[30px] lg:px-[50px] 2xl:px-[100px]">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex shrink-0 items-center gap-2 md:min-w-0 md:flex-1 md:shrink"
          >
            {/**
             * Sized by the wrapper — see the note in `CompareColumnHeader`.
             *
             * Out of the way between `md` and `lg`, and only there. That band is where four
             * entries share a viewport barely wider than they are, and 48px of thumbnail per
             * entry is the difference between a readable name and "Samsu…". The thumbnail is
             * already `aria-hidden` with an empty `alt` — it repeats what the title and the
             * numbered token say — so it is the one part of an entry that can leave without
             * taking information with it. Below `md` entries keep their own width and scroll,
             * so the space is there and the thumbnail stays.
             */}
            <LocalizedLink
              to={product.href}
              className="block w-9 shrink-0 md:hidden lg:block lg:w-10"
              aria-hidden="true"
              tabIndex={-1}
            >
              <ProductCardImage variant="compare" src={product.image} alt="" />
            </LocalizedLink>
            {/**
             * The floor that stops a shared row from cutting a price. Flex shrinking is otherwise
             * unbounded here (`min-w-0` is what lets the title truncate at all), and at 768px it
             * squeezed entries to 161px and rendered "135,00…" — a price with its last digits
             * eaten reads as a different, smaller price. 6.5rem holds the widest formatted price
             * plus its indent, so the title absorbs the pressure and the number never does; if a
             * locale ever needs more than the row can give, the strip scrolls instead of lying.
             */}
            <div className="min-w-0 md:min-w-[6.5rem]">
              {/**
               * The same numbered token the cards, the column headers and the chart legends use.
               * A recap strip is read while scrolling past it, so "which of the four is this"
               * has to be answerable without reading a truncated Armenian title.
               */}
              <span className="flex items-center gap-1.5">
                <CompareSeriesToken index={index} color={seriesColors?.[product.id]} />
                {/**
                 * A fixed `14rem` cap from `md` up was what made the row overflow: four of them
                 * plus their images and buttons is wider than a 1440px window. Above `md` the cap
                 * comes from the share of the row this entry was given instead, which is what
                 * makes the strip fit any width. `truncate` zeroes the flex minimum size, so the
                 * link shrinks inside its own row rather than pushing the price out of the strip.
                 */}
                <LocalizedLink
                  to={product.href}
                  className={`m-0 block max-w-[8rem] truncate text-xs font-semibold text-navy no-underline hover:underline md:max-w-none md:text-sm ${FOCUS_RING}`}
                >
                  {product.title}
                </LocalizedLink>
              </span>
              <p className="m-0 whitespace-nowrap ps-[1.625rem] text-[11px] font-semibold tabular-nums text-text-muted md:text-xs">
                {formatPriceAmd(product.priceValue, currencySuffix)}
              </p>
            </div>
            {isFixed ? null : (
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                aria-label={`${t("comparePage.remove")} — ${product.title}`}
                className={`shrink-0 rounded-full p-1.5 text-text-muted transition-colors hover:bg-subtle-bg hover:text-navy ${FOCUS_RING}`}
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
