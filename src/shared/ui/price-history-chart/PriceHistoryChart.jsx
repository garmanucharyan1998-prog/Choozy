import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { formatAmd } from "shared/lib/formatAmd";

const BAR_NAVY = "#152147";
const BAR_MUTED = "#dadfe8";
const GRID_STROKE = "#dde3f8";

/**
 * One height, declared once. The box class and the value handed to `initialDimension` have to
 * agree — a mismatch would make Recharts' first paint the wrong size and then resize, which is
 * the flicker the initial dimension exists to avoid. `PriceHistoryChartClientOnly` renders a
 * placeholder of the same height, so the three must not drift apart.
 */
const CHART_HEIGHT = 280;
const CHART_BOX = "h-[280px]";

/**
 * Mini price history column chart — dashed horizontal grid, rounded bar tops,
 * optional highlighted bar (navy vs light gray).
 *
 * @param {{ name: string; amount: number; highlight: boolean }[]} data
 */
/** Rounds up to a clean step so the axis ends on a readable number. */
const niceCeiling = (value) => {
  if (!Number.isFinite(value) || value <= 0) return 100000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = magnitude / 2;
  return Math.ceil(value / step) * step;
};

const PriceHistoryChart = ({ data, ariaLabel }) => {
  /** Guarded once, up front — the render below used to trust `data` while this line didn't. */
  const rows = Array.isArray(data) ? data : [];

  /**
   * Derived from the data instead of a fixed 400 000 ceiling: prices scale per product,
   * so expensive items had bars running past the top of the axis while cheap ones were
   * squashed into invisible slivers.
   */
  const amounts = rows.map((d) => d.amount).filter((n) => Number.isFinite(n));
  const maxY = niceCeiling(Math.max(...amounts, 0) * 1.1);
  const yTicks = [1, 2, 3, 4].map((i) => Math.round((maxY / 4) * i));

  return (
    <div className={`${CHART_BOX} w-full min-w-0`} role="img" aria-label={ariaLabel}>
      {/**
       * `initialDimension` defaults to `{ width: -1, height: -1 }`, and Recharts renders once at
       * that size before its ResizeObserver reports — logging "The width(-1) and height(-1) of
       * chart should be greater than 0" three times per page load on every product page. The
       * client-only wrapper already removed the server-side half of this; the browser half is
       * this prop. The height is not a guess (the box above fixes it at 280px); the width is a
       * starting value the first measurement immediately replaces.
       */}
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 320, height: CHART_HEIGHT }}
      >
        <BarChart
          data={rows}
          margin={{ top: 12, right: 8, left: 4, bottom: 8 }}
          barCategoryGap="22%"
        >
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} horizontal />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#1f2937", fontSize: 11, fontWeight: 600 }}
            interval={0}
          />
          <YAxis
            domain={[0, maxY]}
            ticks={yTicks}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatAmd}
            tick={{ fill: "#1f2937", fontSize: 11, fontWeight: 600 }}
            width={56}
          />
          <Bar dataKey="amount" radius={[14, 14, 0, 0]} maxBarSize={56}>
            {rows.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}-${index}`}
                fill={entry.highlight ? BAR_NAVY : BAR_MUTED}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;
