import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { CompareSeriesToken } from "./CompareSeriesToken";
import {
  FOCUS_RING,
  SECTION_HEADING,
  SECTION_PAD,
  SECTION_SUBHEADING,
  SURFACE,
  SURFACE_INSET,
} from "./compareStyles";

/**
 * What actually separates these products, in four lines, before the table.
 *
 * This is the section the old page had no equivalent of, and its absence was the page's biggest
 * usability cost: the only way to find out that one phone had twice the storage of another was
 * to read thirty rows and hold four values in your head per row. Comparison-table research is
 * unanimous on this — the tool's job is to do that scanning for the reader, not to lay the data
 * out and wish them luck.
 *
 * Every claim here is bounded by what the catalog can defend. `buildCompareKeyDifferences` only
 * ranks attributes that carry an explicit `direction`, only when a single product wins, and never
 * without the value it beat. So "more storage" is stated; "OLED rather than LCD" is not, because
 * nothing in the data says which of those is better. The count under the list is what points at
 * everything left unranked, and the note says plainly why it was left there.
 */

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   differences: {
 *     key: string, labelKey: string, direction: "higher" | "lower",
 *     winnerId: string, winnerFormatted: string, baselineFormatted: string, deltaPercent: number,
 *   }[],
 *   products: { id: string, title: string }[],
 *   seriesColors: Record<string, string>,
 *   differingSpecCount: number,
 *   onShowDifferences: () => void,
 *   canFilter: boolean,
 * }} props
 */
export const CompareKeyDifferences = ({
  t,
  differences,
  products,
  seriesColors,
  differingSpecCount,
  onShowDifferences,
  canFilter,
}) => {
  const titleById = new Map(products.map((product) => [product.id, product.title]));
  const indexById = new Map(products.map((product, index) => [product.id, index]));
  const betterThanTemplate = t("comparePage.advantages.betterThan");

  return (
    <section
      aria-labelledby="compare-differences-heading"
      className={`${SURFACE} ${SECTION_PAD} flex flex-col gap-4`}
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="compare-differences-heading" className={SECTION_HEADING}>
          {t("comparePage.keyDifferences.heading")}
        </h2>
        <p className={SECTION_SUBHEADING}>{t("comparePage.keyDifferences.intro")}</p>
      </div>

      {differences.length === 0 ? (
        <p className="m-0 text-xs text-text-muted sm:text-sm">
          {t("comparePage.keyDifferences.none")}
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {differences.map((difference) => {
            /**
             * The arrow is the attribute's direction, never the winner's: on price and weight the
             * advantage is the *smaller* number, and an up arrow beside "the leader" there would
             * read as "this one costs more".
             */
            const DirectionIcon = difference.direction === "lower" ? FaArrowDown : FaArrowUp;
            const winnerIndex = indexById.get(difference.winnerId) ?? 0;

            return (
              <li
                key={difference.key}
                className={`${SURFACE_INSET} flex flex-col gap-2 p-3 md:p-4`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/** No `uppercase` — these are Armenian attribute names; see `SECTION_CELL`. */}
                  <p className="m-0 text-[11px] font-semibold tracking-wide text-text-muted sm:text-xs">
                    {t(difference.labelKey)}
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-white px-2 py-0.5 text-[10px] font-bold leading-tight text-emerald-700 sm:text-[11px]">
                    <DirectionIcon className="h-2.5 w-2.5" aria-hidden />
                    <span className="tabular-nums">{difference.deltaPercent}%</span>
                  </span>
                </div>

                <p className="m-0 text-base font-bold tabular-nums text-navy sm:text-lg">
                  {difference.winnerFormatted}
                  <span className="ms-2 text-[11px] font-medium text-text-muted sm:text-xs">
                    {betterThanTemplate
                      .replace("{{percent}}", String(difference.deltaPercent))
                      .replace("{{baseline}}", difference.baselineFormatted)}
                  </span>
                </p>

                <p className="m-0 flex items-center gap-2 text-[11px] font-medium text-navy sm:text-xs">
                  <CompareSeriesToken
                    index={winnerIndex}
                    color={seriesColors[difference.winnerId]}
                  />
                  <span className="line-clamp-1">{titleById.get(difference.winnerId)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-blue pt-3">
        <p className="m-0 text-[11px] text-text-muted sm:text-xs">
          {t("comparePage.keyDifferences.note")}
        </p>
        {canFilter ? (
          <button
            type="button"
            onClick={onShowDifferences}
            className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-link-blue transition-colors hover:bg-hover-blue sm:text-xs ${FOCUS_RING}`}
          >
            {t("comparePage.keyDifferences.seeAll").replace(
              "{{count}}",
              String(differingSpecCount),
            )}
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default CompareKeyDifferences;
