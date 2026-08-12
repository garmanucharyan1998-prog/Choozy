/**
 * One horizontal bar per product per numeric attribute — the winner draws at full width,
 * everyone else proportionally to their own raw value, which is always printed as text next to
 * the bar so colour is never the only carrier of the comparison (`buildCompareBars` guarantees
 * bar width and printed value agree, since both come from the same raw number).
 *
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   bars: import("entities/product-compare").COMPARE_ATTRIBUTES extends never ? never : {
 *     key: string,
 *     labelKey: string,
 *     bars: { productId: string, formatted: string, ratio: number, isWinner: boolean, deltaPercent: number | null }[],
 *   }[],
 *   products: { id: string, title: string }[],
 *   seriesColors: Record<string, string>,
 * }} props
 */
export const CompareBars = ({ t, bars, products, seriesColors }) => {
  if (!bars || bars.length === 0) return null;

  const titleById = new Map(products.map((product) => [product.id, product.title]));

  return (
    <section
      aria-labelledby="compare-bars-heading"
      className="flex flex-col gap-4 rounded-2xl border border-border-blue bg-white p-4 md:p-6"
    >
      <h2 id="compare-bars-heading" className="m-0 text-base font-bold text-navy sm:text-lg md:text-xl">
        {t("comparePage.bars.heading")}
      </h2>
      <div className="flex flex-col gap-5">
        {bars.map((row) => (
          <div key={row.key} className="flex flex-col gap-2">
            <p className="m-0 text-xs font-semibold text-navy sm:text-sm">{t(row.labelKey)}</p>
            <div className="flex flex-col gap-2">
              {row.bars.map((bar) => (
                <div key={bar.productId} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: seriesColors[bar.productId] }}
                    aria-hidden="true"
                  />
                  <span className="w-16 shrink-0 truncate text-[11px] text-text-muted sm:text-xs md:w-32 md:text-sm">
                    {titleById.get(bar.productId)}
                  </span>
                  <span
                    className="h-2.5 flex-1 overflow-hidden rounded-full bg-subtle-bg"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(bar.ratio, 0) * 100}%`,
                        backgroundColor: seriesColors[bar.productId],
                      }}
                    />
                  </span>
                  <span className="w-20 shrink-0 text-end text-[11px] font-semibold text-navy sm:text-xs md:w-24 md:text-sm">
                    {bar.formatted}
                    {bar.isWinner && bar.deltaPercent ? (
                      <span className="ms-1 text-emerald-600">+{bar.deltaPercent}%</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CompareBars;
