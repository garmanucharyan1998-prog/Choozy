import { FaTimes } from "react-icons/fa";
import { LocalizedLink } from "shared/ui/link";
import { ProductCardImage } from "shared/ui/product-card-image";
import { useCompareTrayPresenter } from "../presenter/useCompareTrayPresenter";

/**
 * The compare selection, visible from anywhere on the site.
 *
 * Before this, a selection built across the catalog was represented by a number in the header and
 * nothing else: no way to see *what* was in it, drop one, or reach the comparison, short of
 * navigating to `/compare` and hoping. The bar is the smallest thing that fixes all three.
 *
 * It sits above the mobile bottom navigation rather than over it, using the same
 * `--mobile-bottom-nav-height` / `--mobile-viewport-offset-bottom` variables the header already
 * publishes — the second one keeps it steady while mobile browser chrome slides in and out during
 * scroll. `z-30` puts it under that navigation and under the mobile menu drawer, so an open panel
 * covers the bar instead of the bar punching through it.
 *
 * "Clear all" is desktop-only on purpose. At 360px the row has room for the thumbnails, the count
 * and one primary action, and the capability is not lost: every thumbnail carries its own remove
 * button and the compare page itself still offers "clear all".
 */
export const CompareTray = () => {
  const { t, isVisible, trayRef, products, count, maxItems, canCompare, removeProduct, clearAll } =
    useCompareTrayPresenter();

  if (!isVisible) return null;

  const countLabel = t("comparePage.tray.count")
    .replace("{{count}}", String(count))
    .replace("{{max}}", String(maxItems));

  return (
    <div
      ref={trayRef}
      role="region"
      aria-label={t("comparePage.tray.ariaLabel")}
      /**
       * Slides up from the edge it lives on when the first product joins the selection, so the
       * bar reads as arriving rather than as content that was always there and only now got
       * painted. `motion-reduce:animate-none` for anyone who asked for less (§34).
       */
      className="fixed inset-x-0 z-30 animate-rise-in border-t border-border-blue bg-white shadow-[0_-4px_18px_rgba(21,33,71,0.10)] motion-reduce:animate-none"
      style={{
        bottom:
          "calc(var(--mobile-bottom-nav-height, 0px) + var(--mobile-viewport-offset-bottom, 0px))",
      }}
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-2.5 py-2 sm:gap-3 sm:px-[15px] md:px-[30px] md:py-2.5 lg:px-[50px] 2xl:px-[100px]">
        <ul className="m-0 flex min-w-0 flex-1 list-none items-center gap-2 overflow-x-auto p-0 sm:gap-3">
          {products.map((product) => (
            <li key={product.id} className="relative shrink-0 pe-1.5 pt-1.5">
              <LocalizedLink
                to={product.href}
                title={product.title}
                className="block w-10 rounded-lg sm:w-12 md:w-14"
              >
                <ProductCardImage variant="compare" src={product.image} alt={product.title} />
              </LocalizedLink>
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                aria-label={`${t("comparePage.remove")} — ${product.title}`}
                /** 24px is the WCAG 2.2 AA floor for a target this small; 20 was under it. */
                className="absolute end-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-border-blue bg-white text-text-muted transition-colors hover:bg-hover-blue hover:text-navy"
              >
                <FaTimes className="h-2.5 w-2.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        {/**
         * The digits carry the count for anyone looking at it; the sentence next to them carries
         * the same fact to a screen reader, which would otherwise hear a bare "2 / 4".
         */}
        <p className="m-0 shrink-0 text-xs font-semibold text-navy sm:text-sm" aria-hidden="true">
          {count}/{maxItems}
        </p>
        <span className="sr-only">{countLabel}</span>

        <button
          type="button"
          onClick={clearAll}
          className="hidden shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-link-blue transition-colors hover:bg-hover-blue sm:inline-flex sm:text-sm"
        >
          {t("comparePage.clearAll")}
        </button>

        {canCompare ? (
          <LocalizedLink
            to="/compare"
            className="shrink-0 rounded-pill bg-navy px-3 py-2 text-xs font-semibold text-white no-underline transition-colors hover:bg-active-blue sm:px-4 sm:text-sm"
          >
            {t("comparePage.tray.compareCta")}
          </LocalizedLink>
        ) : (
          /** A disabled-looking button that never becomes enabled reads as broken; this says why. */
          <p className="m-0 shrink-0 text-[11px] text-text-muted sm:text-xs">
            {t("comparePage.tray.needMore")}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompareTray;
