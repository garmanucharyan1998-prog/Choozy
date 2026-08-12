import { useMemo, useState } from "react";
import { RadarChart } from "shared/ui/radar-chart";

/**
 * The radar section: the shape of a comparison at a glance, above the per-attribute bars that
 * give the same comparison its numbers.
 *
 * Three outlines is the ceiling even though four products can be compared. A fourth translucent
 * polygon over the same grid stops being readable as a distinct shape — the overlaps swamp it —
 * so the fourth product gets a legend chip that swaps it in rather than a fourth layer. Every
 * chip stays live: clicking a fourth at the cap retires the longest-shown one instead of doing
 * nothing, which is the failure mode of a disabled control that looks clickable.
 *
 * The scores are relative to the category's own catalog, not absolute quality, and the note under
 * the chart says so. A radar that silently normalizes is a radar that implies the cheapest phone
 * in a category is bad at being a phone.
 */

/** Kept exported so the widget test asserts the cap rather than hard-coding the same 3. */
export const MAX_RADAR_OVERLAYS = 3;
/** Two outlines is the floor: one outline is a profile, not a comparison. */
const MIN_RADAR_OVERLAYS = 2;

const CHIP_BASE =
  "inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-start text-xs font-medium transition-colors sm:text-sm";

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   radar: { axes: { id: string, labelKey: string }[], items: { id: string, values: number[] }[] },
 *   products: { id: string, title: string }[],
 *   seriesColors: Record<string, string>,
 * }} props
 */
export const CompareRadar = ({ t, radar, products, seriesColors }) => {
  const [chosenIds, setChosenIds] = useState(null);

  /**
   * Derived from `radar` rather than from a `radar?.items ?? []` local: the fallback array would
   * be a fresh identity on every render, and this memo would never actually memoize.
   */
  const activeIds = useMemo(() => {
    const available = (radar?.items ?? []).map((item) => item.id);
    const auto = available.slice(0, MAX_RADAR_OVERLAYS);
    if (!chosenIds) return auto;
    /**
     * A chosen product can leave the comparison entirely (a removed column, a shared link with a
     * different selection). Falling back to the default beats drawing a gap or an empty chart.
     */
    const stillHere = chosenIds.filter((id) => available.includes(id));
    return stillHere.length >= MIN_RADAR_OVERLAYS ? stillHere.slice(0, MAX_RADAR_OVERLAYS) : auto;
  }, [radar, chosenIds]);

  const axes = radar?.axes ?? [];
  const items = radar?.items ?? [];

  /**
   * `buildRadarData` already returns no axes when fewer than three attributes are shared, so this
   * hides the whole section rather than framing an empty card.
   */
  if (axes.length < 3 || items.length < MIN_RADAR_OVERLAYS) return null;

  const titleById = new Map(products.map((product) => [product.id, product.title]));
  const valuesById = new Map(items.map((item) => [item.id, item.values]));

  const chartAxes = axes.map((axis) => ({ id: axis.id, label: t(axis.labelKey) }));
  const chartItems = activeIds.map((id) => ({
    id,
    label: titleById.get(id) ?? id,
    color: seriesColors[id],
    values: valuesById.get(id) ?? [],
  }));

  /** With two products the floor and the ceiling meet, so a toggle could never do anything. */
  const isInteractive = items.length > MIN_RADAR_OVERLAYS;
  const isCapped = items.length > MAX_RADAR_OVERLAYS;

  const toggleItem = (id) => {
    setChosenIds(() => {
      if (activeIds.includes(id)) {
        if (activeIds.length <= MIN_RADAR_OVERLAYS) return activeIds;
        return activeIds.filter((activeId) => activeId !== id);
      }
      /** At the cap the longest-shown outline steps aside, so no chip is ever a dead control. */
      if (activeIds.length >= MAX_RADAR_OVERLAYS) return [...activeIds.slice(1), id];
      return [...activeIds, id];
    });
  };

  return (
    <section
      aria-labelledby="compare-radar-heading"
      className="flex flex-col gap-4 rounded-2xl border border-border-blue bg-white p-4 md:p-6"
    >
      <h2
        id="compare-radar-heading"
        className="m-0 text-base font-bold text-navy sm:text-lg md:text-xl"
      >
        {t("comparePage.radar.heading")}
      </h2>

      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8">
        <div className="w-full max-w-[340px] shrink-0 md:max-w-[400px]">
          <RadarChart
            axes={chartAxes}
            items={chartItems}
            ariaLabel={t("comparePage.radar.ariaLabel")}
          />
        </div>

        <div
          role="group"
          aria-label={t("comparePage.radar.legendAria")}
          className="flex w-full flex-col gap-2 md:w-auto md:max-w-[16rem]"
        >
          {items.map((item) => {
            const isActive = activeIds.includes(item.id);
            const color = seriesColors[item.id];
            const title = titleById.get(item.id) ?? item.id;
            /**
             * The dot is filled when the outline is on screen and hollow when it is not, so the
             * chip's state survives being read by someone who cannot tell the two greens apart —
             * `aria-pressed` carries the same fact to a screen reader.
             */
            const dot = (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full border-2"
                style={{
                  borderColor: color,
                  backgroundColor: isActive ? color : "transparent",
                }}
                aria-hidden="true"
              />
            );

            if (!isInteractive) {
              return (
                <span
                  key={item.id}
                  className={`${CHIP_BASE} border-border-blue text-navy`}
                >
                  {dot}
                  <span className="truncate">{title}</span>
                </span>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-pressed={isActive}
                className={`${CHIP_BASE} ${
                  isActive
                    ? "border-border-blue bg-white text-navy"
                    : "border-border-blue bg-subtle-bg text-text-muted"
                } hover:bg-hover-blue`}
              >
                {dot}
                <span className="truncate">{title}</span>
              </button>
            );
          })}

          {isCapped ? (
            <p className="m-0 text-[11px] text-text-muted sm:text-xs">
              {t("comparePage.radar.capNote")}
            </p>
          ) : null}
        </div>
      </div>

      <p className="m-0 text-[11px] text-text-muted sm:text-xs">
        {t("comparePage.radar.scaleNote")}
      </p>
    </section>
  );
};

export default CompareRadar;
