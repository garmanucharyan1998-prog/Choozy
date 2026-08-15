import { useEffect, useRef } from "react";
import { FaCheckSquare, FaRegTrashAlt, FaSyncAlt, FaTimes } from "react-icons/fa";
import { FOCUS_RING, MOTION_SAFE } from "../sellerUi";

/**
 * The bulk action bar — on screen only while something is selected (§66).
 *
 * Bulk *refresh* is the reason this exists. The shop's one automatic behaviour removes a
 * listing that has not been refreshed within the deadline, which makes "refresh everything that
 * is about to lapse" the seller's most repeated chore; doing it one row at a time is the single
 * biggest cost in the old dashboard. Filter to "needs refresh", select all, one click.
 *
 * It pins to the bottom of the viewport and does the arithmetic to stay clear of the two other
 * things that live in that corner — the site-wide compare tray and the phone's bottom
 * navigation, both of which publish their height as a CSS variable — and publishes its own
 * height for the third, the scroll-to-top button, which would otherwise land on top of it (§79).
 */
export const ProductBulkBar = ({ t, count, onRefresh, onDelete, onClear }) => {
  const barRef = useRef(null);
  const isVisible = count > 0;

  /**
   * Measured rather than hardcoded, exactly as `CompareTray` publishes its own: the row's height
   * moves with the locale's word lengths and with the viewport, and a stale number here would
   * put the scroll-to-top button back on top of the Delete button it is meant to clear.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (!isVisible) {
      root.style.setProperty("--page-action-bar-height", "0px");
      return () => root.style.removeProperty("--page-action-bar-height");
    }

    const update = () =>
      root.style.setProperty(
        "--page-action-bar-height",
        `${barRef.current?.offsetHeight ?? 0}px`,
      );
    update();

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(update);
      if (barRef.current) resizeObserver.observe(barRef.current);
    }
    window.addEventListener("resize", update);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--page-action-bar-height");
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const selectedLabel = t("shopAccount.products.bulk.selected").replace(
    "{{count}}",
    String(count),
  );

  return (
    <div
      className="sticky z-20 mt-3 px-1"
      style={{
        bottom:
          "calc(var(--compare-tray-height, 0px) + var(--mobile-bottom-nav-height, 0px) + var(--mobile-viewport-offset-bottom, 0px) + 0.75rem)",
      }}
    >
      <div
        ref={barRef}
        className={`flex animate-rise-in flex-wrap items-center gap-x-2 gap-y-2 rounded-[12px] border border-[#2b3a63] bg-navy px-2.5 py-2 text-white shadow-[0_8px_24px_rgba(15,23,42,0.22)] transition motion-reduce:animate-none sm:gap-x-3 sm:px-3 sm:py-2.5 ${MOTION_SAFE}`}
      >
        {/*
          The phrase in full from `sm` up; on a phone the digits alone, beside the icon that
          says what they count. Spelling it out there pushed the two actions onto a second row
          and made the bar 96px tall on a 780px screen — and the sentence is still there for a
          screen reader, which never had the space problem.
        */}
        <p className="m-0 flex shrink-0 items-center gap-1.5 text-[13px] font-semibold tabular-nums sm:text-sm">
          <FaCheckSquare className="h-3.5 w-3.5 sm:hidden" aria-hidden="true" />
          <span aria-hidden="true" className="sm:hidden">
            {count}
          </span>
          <span className="sr-only sm:not-sr-only">{selectedLabel}</span>
        </p>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/20 sm:gap-2 sm:px-3 sm:text-sm ${FOCUS_RING}`}
          >
            <FaSyncAlt className="h-3 w-3" aria-hidden="true" />
            {t("shopAccount.products.refresh")}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-[#b91c1c] px-2.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#991b1b] sm:gap-2 sm:px-3 sm:text-sm ${FOCUS_RING}`}
          >
            <FaRegTrashAlt className="h-3 w-3" aria-hidden="true" />
            {t("shopAccount.products.delete")}
          </button>
          <button
            type="button"
            onClick={onClear}
            aria-label={t("shopAccount.products.bulk.clear")}
            title={t("shopAccount.products.bulk.clear")}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white ${FOCUS_RING}`}
          >
            <FaTimes className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductBulkBar;
