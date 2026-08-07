import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
  redirect,
} from "react-router";
import { LanguageProvider, useLanguage } from "contexts";
import { getHtmlLangForAppLanguage, getLanguageFromPath } from "shared/lib/locale";
import { ScrollToTopButton, ScrollToTopOnNavigate } from "shared/ui/scroll-to-top";
import { getTranslator } from "shared/i18n";
import type { Route } from "./+types/root";
import "./index.css";

/**
 * Collapses a trailing slash (`/ru/filter/`) onto the canonical form so a page is never
 * reachable at two URLs. A real server-side redirect now that there's a real server —
 * previously a client component swapped in a `<Navigate>` after the wrong page had
 * already rendered once.
 */
export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    const canonical = `${url.pathname.replace(/\/+$/, "")}${url.search}${url.hash}`;
    throw redirect(canonical, 301);
  }
  return null;
}

/**
 * The document shell. Rendered for both the happy path and `ErrorBoundary` below, so it
 * can't assume any route has actually matched — no `useLanguage()` here, just the raw
 * pathname. `lang` is computed straight from the URL instead of patched in by an effect
 * after mount, which is only possible because there's now a real SSR pass to compute it
 * correctly the first time.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const htmlLang = getHtmlLangForAppLanguage(getLanguageFromPath(pathname));

  return (
    <html lang={htmlLang}>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#152147" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <Meta />
        <Links />
      </head>
      <body>
        <noscript>Այս կայքի աշխատանքի համար անհրաժեշտ է միացնել JavaScript-ը։</noscript>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Lets keyboard users jump past the header, category bar and search before reaching
 * page content. Visible only while focused.
 */
const SkipToContentLink = () => {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      {t("a11y.skipToContent")}
    </a>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <SkipToContentLink />
      <ScrollToTopOnNavigate />
      <Outlet />
      <ScrollToTopButton />
    </LanguageProvider>
  );
}

/**
 * Root error boundary. React Router's own convention — it catches errors thrown during
 * SSR too, not just client-side render errors after hydration the way a hand-rolled
 * class boundary would. `LanguageProvider` isn't guaranteed to be mounted when this
 * renders (a `loader` can throw before the tree below it ever does), so the heading/message
 * are looked up directly from the dictionary instead of via `useLanguage()`, which would
 * throw a second error if called outside its provider.
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const { pathname } = useLocation();
  const t = getTranslator(getLanguageFromPath(pathname));
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="min-h-[50vh] bg-white px-5 py-10 text-start font-sans">
      <p className="text-lg font-semibold text-red-700">{t("errorBoundary.heading")}</p>
      <p className="pt-1 text-sm text-text-muted">{t("errorBoundary.message")}</p>
      <pre className="max-w-[90vw] whitespace-pre-wrap break-words pt-3 text-sm text-[#333]">
        {message}
      </pre>
    </div>
  );
}
