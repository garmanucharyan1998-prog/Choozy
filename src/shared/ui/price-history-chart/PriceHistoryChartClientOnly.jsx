import { lazy, Suspense, useEffect, useState } from "react";

/**
 * `ResponsiveContainer` measures its container to size the chart, which is meaningless
 * during SSR (no layout engine on the server) — it renders with `width(-1) height(-1)`
 * and Recharts logs a console warning. A price chart has no SEO value from being
 * server-rendered either, so this gates it behind a mount check the same way
 * `YerevanMapClientOnly` gates the map: server and first client render both show the
 * placeholder (same height, so no layout shift), the real chart mounts only after.
 */
const LazyPriceHistoryChart = lazy(() => import("./PriceHistoryChart"));

const ChartPlaceholder = ({ ariaLabel }) => (
  <div className="h-[280px] w-full min-w-0" role="img" aria-label={ariaLabel} />
);

const PriceHistoryChartClientOnly = (props) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <ChartPlaceholder ariaLabel={props.ariaLabel} />;
  }

  return (
    <Suspense fallback={<ChartPlaceholder ariaLabel={props.ariaLabel} />}>
      <LazyPriceHistoryChart {...props} />
    </Suspense>
  );
};

export default PriceHistoryChartClientOnly;
