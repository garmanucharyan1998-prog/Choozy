import { lazy, Suspense, useEffect, useState } from "react";

/**
 * `leaflet` touches `window`/DOM internals at module-evaluation time (not just render
 * time), which crashes the SSR pass outright — `ReferenceError: window is not defined`
 * the moment the server bundle evaluates the import. A map has no SEO value from being
 * server-rendered anyway, so this gates the real `YerevanMap` behind a mount check:
 * the server (and the client's first render, before hydration) renders the placeholder;
 * only after mount does the effect flip `hasMounted` and the lazy import actually runs,
 * entirely client-side. Matches on both passes, so this doesn't reintroduce a hydration
 * mismatch the way the `Suspense`+`lazy` route-chunk issue (K3) did.
 */
const LazyYerevanMap = lazy(() => import("./YerevanMap"));

const YerevanMapClientOnly = (props) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="h-full w-full min-h-[320px]" role="region" aria-label={props.ariaLabel} />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-full w-full min-h-[320px]" role="region" aria-label={props.ariaLabel} />
      }
    >
      <LazyYerevanMap {...props} />
    </Suspense>
  );
};

export default YerevanMapClientOnly;
