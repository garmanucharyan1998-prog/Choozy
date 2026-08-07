import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

const BAR_NAVY = "#152147";
const BAR_MUTED = "#dadfe8";
const GRID_STROKE = "#dde3f8";

const formatTick = (value) => (typeof value === "number" ? value.toLocaleString("en-US") : "");

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
  /**
   * Derived from the data instead of a fixed 400 000 ceiling: prices scale per product,
   * so expensive items had bars running past the top of the axis while cheap ones were
   * squashed into invisible slivers.
   */
  const amounts = (data || []).map((d) => d.amount).filter((n) => Number.isFinite(n));
  const maxY = niceCeiling(Math.max(...amounts, 0) * 1.1);
  const yTicks = [1, 2, 3, 4].map((i) => Math.round((maxY / 4) * i));

  return (
    <div className="h-[280px] w-full min-w-0" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
            tickFormatter={formatTick}
            tick={{ fill: "#1f2937", fontSize: 11, fontWeight: 600 }}
            width={56}
          />
          <Bar dataKey="amount" radius={[14, 14, 0, 0]} maxBarSize={56}>
            {data.map((entry, index) => (
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
