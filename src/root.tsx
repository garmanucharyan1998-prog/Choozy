import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  useRouteError,
  redirect,
} from "react-router";
import { LanguageProvider, SessionProvider, useLanguage } from "contexts";
import { readSessionFromRequest } from "entities/session";
import {
  canonicalizePathname,
  getHtmlLangForAppLanguage,
  getLanguageFromPath,
} from "shared/lib/locale";
import { ScrollToTopButton } from "shared/ui/scroll-to-top";
import { NotFoundContent } from "shared/ui/not-found-content";
import { getTranslator } from "shared/i18n";
import type { Route } from "./+types/root";
import "./index.css";

/**
 * Folds a trailing slash (`/ru/filter/`), a doubled slash (`//`) and a capitalized path
 * (`/Account`) onto the one canonical form, so a page is never reachable at two URLs and
 * no guard can be slipped past by casing. A real server-side redirect now that there's a
 * real server — previously a client component swapped in a `<Navigate>` after the wrong
 * page had already rendered once.
 *
 * Compares against the full canonical form rather than testing for a trailing slash: the
 * old shape turned `//` into an empty `Location`, which browsers resolve back to the same
 * URL — a redirect loop.
 */
export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const canonicalPathname = canonicalizePathname(url.pathname);
  if (canonicalPathname !== url.pathname) {
    throw redirect(`${canonicalPathname}${url.search}${url.hash}`, 301);
  }
  return { session: readSessionFromRequest(request) };
}

/**
 * HTML is revalidated on every request. Prices and offers are the point of this site, so a
 * cached document would be worse than useless — but a validator still lets an unchanged page
 * come back as a 304. Applies to every route: React Router uses the root `headers` export
 * unless a leaf route exports its own (the resource routes for sitemap/robots do).
 */
export function headers() {
  return { "Cache-Control": "public, max-age=0, must-revalidate" };
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

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <SessionProvider session={loaderData?.session}>
      <LanguageProvider>
        <SkipToContentLink />
        <Outlet />
        <ScrollToTopButton />
      </LanguageProvider>
    </SessionProvider>
  );
}

/**
 * Root error boundary. React Router's own convention — it catches errors thrown during
 * SSR too, not just client-side render errors after hydration the way a hand-rolled
 * class boundary would. `LanguageProvider` isn't guaranteed to be mounted when this
 * renders (a `loader` can throw before the tree below it ever does), so the heading/message
 * are looked up directly from the dictionary instead of via `useLanguage()`, which would
 * throw a second error if called outside its provider.
 *
 * Three things this had to learn:
 *  - A thrown `Response` (a guard's 404, say) used to render the generic "something went
 *    wrong" block with `String(error)` — literally "[object Response]" — instead of a real
 *    not-found page.
 *  - No route-level `meta` matches an errored route, and neither this file nor either shell
 *    layout exports one, so error pages went out with an empty `<title>`. React 19 hoists a
 *    `<title>` rendered anywhere in the tree into `<head>`.
 *  - `error.message` was printed into the page, handing visitors raw server error text. It
 *    is now development-only.
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const { pathname } = useLocation();
  const language = getLanguageFromPath(pathname);
  const t = getTranslator(language);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <title>{t("notFoundPage.seoTitle")}</title>
        <meta name="robots" content="noindex, follow" />
        <LanguageProvider>
          <NotFoundContent />
        </LanguageProvider>
      </>
    );
  }

  const status = isRouteErrorResponse(error) ? error.status : 500;
  const detail = error instanceof Error ? error.message : String(error);

  return (
    <>
      <title>{`${status} — ${t("errorBoundary.heading")}`}</title>
      <meta name="robots" content="noindex, follow" />
      <div className="min-h-[50vh] bg-white px-5 py-10 text-start font-sans">
        <p className="text-lg font-semibold text-red-700">{t("errorBoundary.heading")}</p>
        <p className="pt-1 text-sm text-text-muted">{t("errorBoundary.message")}</p>
        {import.meta.env.DEV ? (
          <pre className="max-w-[90vw] whitespace-pre-wrap break-words pt-3 text-sm text-[#333]">
            {detail}
          </pre>
        ) : null}
      </div>
    </>
  );
}
