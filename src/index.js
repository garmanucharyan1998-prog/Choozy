import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "app/App";
import reportWebVitals from "reportWebVitals";
import { getLocalizedRouteInventory, getPrerenderRouteInventory } from "shared/lib/seo";
import { SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";
import { getHtmlLangForAppLanguage } from "shared/lib/locale";

const container = document.getElementById("root");

const tree = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Prerendered HTML is hydrated instead of re-mounted — mounting would throw the
 * server-written markup away and defeat the purpose of the prerender step.
 */
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, tree);
} else {
  ReactDOM.createRoot(container).render(tree);
}

/** Route lists for the build-time prerender + sitemap generator (harmless at runtime). */
if (typeof window !== "undefined") {
  /** Indexable only — sitemap.xml. */
  window.__CHOOSY_ROUTE_INVENTORY__ = getLocalizedRouteInventory();
  /** Everything that needs an HTML file, so no route falls back to the home page. */
  window.__CHOOSY_PRERENDER_ROUTES__ = getPrerenderRouteInventory();
  window.__CHOOSY_LANGUAGES__ = SUPPORTED_LANGUAGE_CODES.map((code) => ({
    code,
    hreflang: getHtmlLangForAppLanguage(code),
  }));
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
