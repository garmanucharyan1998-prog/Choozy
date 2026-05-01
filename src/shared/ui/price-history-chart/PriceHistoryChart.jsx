import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const BAR_NAVY = "#152147";
const BAR_MUTED = "#dadfe8";
const GRID_STROKE = "#dde3f8";

const formatTick = (value) =>
  typeof value === "number" ? value.toLocaleString("en-US") : "";

/**
 * Mini price history column chart — dashed horizontal grid, rounded bar tops,
 * optional highlighted bar (navy vs light gray).
 *
 * @param {{ name: string; amount: number; highlight: boolean }[]} data
 */
const PriceHistoryChart = ({ data, ariaLabel }) => {
  const maxY = 400000;
  const yTicks = [100000, 200000, 300000, 400000];

  return (
    <div className="h-[280px] w-full min-w-0" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 8, left: 4, bottom: 8 }}
          barCategoryGap="22%"
        >
          <CartesianGrid
            stroke={GRID_STROKE}
            strokeDasharray="3 3"
            vertical={false}
            horizontal
          />
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
              <Cell key={`cell-${entry.name}-${index}`} fill={entry.highlight ? BAR_NAVY : BAR_MUTED} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;
