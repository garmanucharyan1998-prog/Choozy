#!/usr/bin/env node
/**
 * Crawls a running build (see `npm run verify:pages`) and checks every indexable page, plus
 * the ComingSoon stubs, a `?ids=` compare selection and a 404 probe, for defects a source-only
 * scan can't see: what actually reaches the DOM after SSR. Complements
 * `shared/lib/seo/markupConventions.test.js` and `shared/i18n/copyIntegrity.test.js`, which
 * check the source and the dictionary but never render a page.
 *
 * Usage: node scripts/verify-rendered-pages.mjs http://localhost:4173
 */
import { JSDOM } from "jsdom";
import { translations } from "../src/shared/i18n/translations.js";

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error("Usage: node scripts/verify-rendered-pages.mjs <baseUrl>");
  process.exit(1);
}

const STUB_ROUTES = ["/products", "/catalog", "/variety"];
const LANG_PREFIXES = { am: "", en: "/en", ru: "/ru" };
const EXPECTED_HTML_LANG = { am: "hy", en: "en", ru: "ru" };
/** The language switcher names Armenian in Armenian on every page, on purpose — not a leak. */
const LANGUAGE_SWITCHER_ARMENIAN = ["Հայերեն", "Հայ"];

const ARMENIAN_LETTER = /[԰-֏]/;
/**
 * `t(path, fallback)` renders the dotted path itself when a key is missing everywhere — but
 * only a path that actually starts with one of the dictionary's own top-level namespaces
 * (`comparePage.`, `productDetail.`, …) is a candidate; a bare word-dot-word match alone also
 * catches the site's own domain ("choosy.com") and, since `textContent` inserts no whitespace
 * between adjacent block elements, sentence-boundary artifacts like "…to work.Skip to content".
 */
const DICTIONARY_NAMESPACES = Object.keys(translations.am);
const RAW_KEY_PATTERN = new RegExp(
  `\\b(?:${DICTIONARY_NAMESPACES.join("|")})(?:\\.[a-zA-Z][a-zA-Z0-9]*){1,}\\b`,
  "g",
);
const MID_WORD_CAPITAL = /\p{L}*\p{Ll}\p{Lu}\p{L}*/gu;

const languageForPath = (pathname) => {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/ru" || pathname.startsWith("/ru/")) return "ru";
  return "am";
};

const stripLanguageSwitcherText = (text) =>
  LANGUAGE_SWITCHER_ARMENIAN.reduce((acc, word) => acc.split(word).join(""), text);

/** Builds the URL list: every sitemap entry, the stubs, one `?ids=` selection, and a 404 probe. */
const collectUrls = async () => {
  const res = await fetch(`${baseUrl}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml fetch failed: ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const sitemapUrls = locs.map((u) => u.replace(/^https?:\/\/[^/]+/, ""));

  const stubUrls = Object.values(LANG_PREFIXES).flatMap((prefix) =>
    STUB_ROUTES.map((stub) => `${prefix}${stub}`),
  );

  const idsUrls = Object.values(LANG_PREFIXES).map(
    (prefix) => `${prefix}/compare?ids=fp-1,fp-4`,
  );

  return {
    checked: [...new Set([...sitemapUrls, ...stubUrls, ...idsUrls])],
    notFoundProbe: "/this-page-does-not-exist-choosy-verify",
  };
};

/** @returns {{ issues: string[], report: { path: string, h1to3: string[], midWordCaps: string[] } }} */
const checkPage = async (path) => {
  const issues = [];
  const url = `${baseUrl}${path}`;
  const language = languageForPath(new URL(url).pathname);

  const res = await fetch(url);
  if (!res.ok) {
    issues.push(`status ${res.status}`);
    return { issues, report: null };
  }

  /**
   * `textContent` concatenates every descendant text node with no separator, so two adjacent
   * elements with no whitespace between them in the source ("...Monitors</span><p>seo.filter…")
   * fuse into one word ("Monitorsseo.filter…") — real leaked text disappears from every
   * word-boundary-anchored check below. Padding every tag boundary with a space is crude but
   * only ever adds whitespace, never merges two things that should stay apart.
   */
  const html = (await res.text()).replace(/>/g, "> ");
  const dom = new JSDOM(html);
  const { document } = dom.window;
  document.querySelectorAll("script").forEach((node) => node.remove());

  const htmlLang = document.documentElement.getAttribute("lang");
  if (htmlLang !== EXPECTED_HTML_LANG[language]) {
    issues.push(`<html lang="${htmlLang}">, expected "${EXPECTED_HTML_LANG[language]}"`);
  }

  const bodyText = document.body?.textContent ?? "";

  if (language !== "am") {
    const withoutSwitcher = stripLanguageSwitcherText(bodyText);
    if (ARMENIAN_LETTER.test(withoutSwitcher)) {
      const sample = withoutSwitcher.match(new RegExp(`.{0,20}${ARMENIAN_LETTER.source}.{0,20}`));
      issues.push(`Armenian text leaked into ${language}: "${sample?.[0]?.trim()}"`);
    }
  }

  const rawKeys = [...new Set([...bodyText.matchAll(RAW_KEY_PATTERN)].map((m) => m[0]))];
  if (rawKeys.length > 0) {
    issues.push(`possible raw translation key(s): ${rawKeys.slice(0, 5).join(", ")}`);
  }

  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    const bare = href.replace(/^\/(en|ru)(?=\/|$)/, "");
    if (STUB_ROUTES.includes(bare)) issues.push(`link to stub route: ${href}`);
  });

  if (path.includes("/compare")) {
    const table = document.querySelector("table");
    const compareFrames = document.querySelectorAll(".product-card-image--compare");
    /** Scoped to the comparison table itself — a `<table>` exists only on a non-empty page,
     *  and this excludes unrelated `object-cover` uses elsewhere (e.g. the flagcdn.com
     *  language-switcher icons), which were never part of this rule. */
    const objectCoverImgs = table
      ? [...table.querySelectorAll("img")].filter((img) =>
          (img.getAttribute("class") || "").includes("object-cover"),
        )
      : [];
    if (table && compareFrames.length === 0) {
      issues.push("compare page has no 1:1 product-card-image frame");
    }
    if (objectCoverImgs.length > 0) {
      issues.push(`${objectCoverImgs.length} product photo(s) still use object-cover`);
    }
  }

  const h1to3 = [...document.querySelectorAll("h1, h2, h3")].map((el) => el.textContent.trim());
  const midWordCaps = [];
  document.querySelectorAll("*").forEach((el) => {
    if (el.children.length > 0) return;
    const style = el.getAttribute("class") || "";
    if (!/\buppercase\b/.test(style)) return;
    const text = el.textContent.trim();
    if (!text) return;
    const words = [...text.matchAll(MID_WORD_CAPITAL)].map((m) => m[0]);
    if (words.length > 0) midWordCaps.push(`${text.slice(0, 40)} (${words.join(", ")})`);
  });

  return { issues, report: { path, h1to3, midWordCaps } };
};

const main = async () => {
  const { checked, notFoundProbe } = await collectUrls();
  console.log(`Checking ${checked.length} URLs against ${baseUrl}...\n`);

  let failures = 0;
  const c3Report = [];

  for (const path of checked) {
    const { issues, report } = await checkPage(path);
    if (issues.length > 0) {
      failures += 1;
      console.log(`FAIL ${path}`);
      issues.forEach((issue) => console.log(`     - ${issue}`));
    }
    if (report) c3Report.push(report);
  }

  const probeRes = await fetch(`${baseUrl}${notFoundProbe}`);
  if (probeRes.status !== 404) {
    failures += 1;
    console.log(`FAIL ${notFoundProbe}\n     - expected 404, got ${probeRes.status}`);
  }

  console.log(`\n${checked.length + 1 - failures}/${checked.length + 1} checks passed.`);

  const withMidWordCaps = c3Report.filter((r) => r.midWordCaps.length > 0);
  console.log(`\n--- C3 report (non-fatal): uppercase text with mid-word capitals ---`);
  if (withMidWordCaps.length === 0) {
    console.log("None found.");
  } else {
    withMidWordCaps.forEach((r) => {
      console.log(`${r.path}:`);
      r.midWordCaps.forEach((entry) => console.log(`  - ${entry}`));
    });
  }

  if (failures > 0) process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
