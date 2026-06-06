/**
 * Demo time-series for the shop statistics chart (MVP placeholder until API exists).
 * Each metric has its own scale for the chart.
 */

const days = [11, 12, 13, 14, 15, 16, 17];

const series = (values) => days.map((day, i) => ({ day, value: values[i] ?? 0 }));

export const demoShopStatisticsMetrics = [
  {
    id: "views",
    summaryKey: "shopAccount.statistics.metrics.views.summary",
    series: series([45, 120, 95, 210, 180, 320, 480]),
    yDomain: [0, 500],
    yTicks: [0, 100, 200, 300, 400, 500],
  },
  {
    id: "orders",
    summaryKey: "shopAccount.statistics.metrics.orders.summary",
    series: series([2, 5, 4, 8, 6, 11, 14]),
    yDomain: [0, 16],
    yTicks: [0, 4, 8, 12, 16],
  },
  {
    id: "session",
    summaryKey: "shopAccount.statistics.metrics.session.summary",
    series: series([42, 55, 48, 62, 58, 68, 71]),
    yDomain: [0, 80],
    yTicks: [0, 20, 40, 60, 80],
  },
  {
    id: "revenue",
    summaryKey: "shopAccount.statistics.metrics.revenue.summary",
    series: series([1200, 1800, 1500, 2200, 1900, 2600, 2812]),
    yDomain: [0, 3000],
    yTicks: [0, 750, 1500, 2250, 3000],
  },
];
