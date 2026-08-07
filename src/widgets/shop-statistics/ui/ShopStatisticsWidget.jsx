import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useLanguage } from "contexts";
import { demoShopStatisticsMetrics } from "../model/demoShopStatistics";

const LINE_STROKE = "#3a4fe0";
const GRID_STROKE = "#e8eaf1";

const MainCard = ({ children, className = "" }) => (
  <div className={`rounded-[12px] border border-[#e1e6ef] bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const ShopStatisticsWidget = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const active = demoShopStatisticsMetrics[activeIndex] ?? demoShopStatisticsMetrics[0];
  const chartData = active.series;

  const labelKeys = useMemo(
    () => [
      "shopAccount.statistics.metrics.views.label",
      "shopAccount.statistics.metrics.orders.label",
      "shopAccount.statistics.metrics.session.label",
      "shopAccount.statistics.metrics.revenue.label",
    ],
    [],
  );

  return (
    <MainCard className="overflow-hidden p-0">
      <div className="flex flex-col gap-2 border-b border-[#e1e6ef] px-4 py-5 md:px-8 md:py-6">
        <h2 className="m-0 text-lg font-bold text-navy md:text-xl">
          {t("shopAccount.statistics.sectionTitle")}
        </h2>
        <p className="m-0 text-sm leading-relaxed text-text-muted">
          {t("shopAccount.statistics.intro")}
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-0 border-b border-[#e1e6ef] sm:grid-cols-4"
        role="tablist"
        aria-label={t("shopAccount.statistics.metricTabsAria")}
      >
        {demoShopStatisticsMetrics.map((metric, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={metric.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`shop-stat-tab-${metric.id}`}
              aria-controls="shop-statistics-chart"
              onClick={() => setActiveIndex(index)}
              className={`relative flex min-h-[88px] flex-col items-stretch justify-end border-0 px-4 py-4 text-start transition sm:min-h-[96px] md:px-6 ${
                selected ? "bg-white" : "bg-[#fbfcff] hover:bg-[#f4f6fb]"
              }`}
            >
              <span
                className={`absolute left-0 right-0 top-0 h-0.5 rounded-none transition-colors ${
                  selected ? "bg-navy" : "bg-transparent"
                }`}
                aria-hidden="true"
              />
              <span className="flex flex-col gap-1.5">
                <span
                  className={`text-xs font-medium leading-tight ${
                    selected ? "text-text-muted" : "text-text-muted"
                  }`}
                >
                  {t(labelKeys[index])}
                </span>
                <span
                  className={`block text-lg font-bold tabular-nums leading-none md:text-xl ${
                    selected ? "text-navy" : "font-semibold text-text-muted"
                  }`}
                >
                  {t(metric.summaryKey)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="px-2 pb-4 pt-2 md:px-4 md:pb-6 md:pt-4"
        id="shop-statistics-chart"
        role="tabpanel"
        aria-labelledby={`shop-stat-tab-${active.id}`}
      >
        <div
          className="h-[260px] w-full min-w-0 md:h-[300px]"
          role="img"
          aria-label={t("shopAccount.statistics.chartAria")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid stroke={GRID_STROKE} strokeDasharray="0" vertical={false} horizontal />
              <XAxis
                dataKey="day"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#696969", fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis
                orientation="right"
                domain={active.yDomain}
                ticks={active.yTicks}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#696969", fontSize: 11 }}
                width={40}
                tickFormatter={(v) => (typeof v === "number" ? v.toLocaleString("hy-AM") : v)}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={LINE_STROKE}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: LINE_STROKE, stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainCard>
  );
};

export default ShopStatisticsWidget;
