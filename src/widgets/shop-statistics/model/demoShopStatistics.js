/**
 * Demo time-series for the shop statistics chart (MVP placeholder until API exists).
 * Each metric has its own scale for the chart.
 *
 * A full 28-day window, not 7: a week-long trend line is thin evidence of anything, and the
 * chart's own x-axis renders every point (`interval={0}` isn't set here, but the underlying
 * `LineChart` had exactly 7 dots to work with) — a shop owner comparing this month to last
 * needs more than a week of history to look at.
 */

const days = Array.from({ length: 28 }, (_, i) => i + 1);

const series = (values) => days.map((day, i) => ({ day, value: values[i] ?? 0 }));

export const demoShopStatisticsMetrics = [
  {
    id: "views",
    summaryKey: "shopAccount.statistics.metrics.views.summary",
    series: series([
      40, 55, 48, 62, 58, 75, 90, 85, 110, 95, 130, 150, 140, 175, 160, 200, 220, 195, 240, 260,
      230, 290, 310, 275, 340, 380, 420, 480,
    ]),
    yDomain: [0, 500],
    yTicks: [0, 100, 200, 300, 400, 500],
  },
  {
    id: "orders",
    summaryKey: "shopAccount.statistics.metrics.orders.summary",
    series: series([
      1, 2, 2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11, 13, 12, 14, 13, 14,
    ]),
    yDomain: [0, 16],
    yTicks: [0, 4, 8, 12, 16],
  },
  {
    id: "session",
    summaryKey: "shopAccount.statistics.metrics.session.summary",
    series: series([
      38, 42, 40, 45, 43, 48, 46, 50, 49, 53, 51, 55, 54, 58, 56, 60, 59, 63, 61, 65, 64, 67, 66,
      69, 68, 70, 69, 71,
    ]),
    yDomain: [0, 80],
    yTicks: [0, 20, 40, 60, 80],
  },
  {
    id: "revenue",
    summaryKey: "shopAccount.statistics.metrics.revenue.summary",
    series: series([
      900, 1100, 1000, 1250, 1150, 1400, 1300, 1550, 1450, 1700, 1600, 1850, 1750, 1950, 1900,
      2050, 2000, 2150, 2100, 2250, 2200, 2350, 2300, 2450, 2500, 2600, 2700, 2812,
    ]),
    yDomain: [0, 3000],
    yTicks: [0, 750, 1500, 2250, 3000],
  },
];
