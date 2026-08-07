/**
 * Build-time prerender + sitemap generator.
 *
 * The app is client-rendered, so the shipped `index.html` ships an empty `#root`:
 * crawlers and social scrapers that do not execute JS see nothing, and page metadata
 * (title/canonical/hreflang/JSON-LD) only exists after React mounts.
 *
 * This script serves `build/`, visits every indexable URL in a headless browser, waits
 * for React to settle, and writes the resulting HTML back to `build/<route>/index.html`.
 * `src/index.js` hydrates that markup instead of re-mounting it.
 *
 * The URL list comes from `window.__CHOOSY_ROUTE_INVENTORY__` (see
 * `src/shared/lib/seo/routeInventory.js`), so the prerendered pages and sitemap.xml can
 * never drift from the app's own routing.
 *
 * Usage: node scripts/prerender.mjs   (wired to `postbuild`)
 */

import { createServer } from "node:http";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "..", "build");
const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://choosy.com").replace(/\/$/, "");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".map": "application/json",
};

/** Static file server with SPA fallback, mirroring how the site is hosted. */
const startServer = async () => {
  const indexHtml = await readFile(path.join(BUILD_DIR, "index.html"));

  const server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const filePath = path.join(BUILD_DIR, urlPath);

    if (!filePath.startsWith(BUILD_DIR)) {
      res.writeHead(403).end();
      return;
    }

    if (urlPath !== "/" && existsSync(filePath) && !filePath.endsWith(path.sep)) {
      try {
        const body = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(body);
        return;
      } catch {
        /* fall through to the SPA shell */
      }
    }

    res.writeHead(200, { "Content-Type": MIME[".html"] });
    res.end(indexHtml);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, port: server.address().port };
};

/**
 * `<link rel="preload">` for the body font. The hashed filename is only known after the
 * build, so the tag is injected here rather than written into public/index.html — without
 * it the font request waits for the stylesheet and the first paint shows fallback text.
 */
const buildFontPreload = async () => {
  const mediaDir = path.join(BUILD_DIR, "static", "media");
  if (!existsSync(mediaDir)) return "";
  const files = await readdir(mediaDir);
  const regular = files.find((f) => /Regular\.[a-f0-9]+\.woff2$/i.test(f));
  if (!regular) return "";
  return `<link rel="preload" as="font" type="font/woff2" href="/static/media/${regular}" crossorigin>`;
};

const routeToFilePath = (routePath) => {
  const clean = routePath.split("?")[0].split("#")[0];
  const segments = clean.split("/").filter(Boolean);
  return path.join(BUILD_DIR, ...segments, "index.html");
};

/**
 * Query strings cannot be represented as a static file path, so `?category=x` pages are
 * covered by the sitemap only — they resolve through the SPA shell at runtime.
 */
const isPrerenderable = (routePath) => !routePath.includes("?");

const buildSitemap = (inventory, languages) => {
  const urls = inventory
    .map((route) => {
      const alternates = languages
        .map(
          (lang) =>
            `    <xhtml:link rel="alternate" hreflang="${lang.hreflang}" href="${SITE_URL}${route.byLanguage[lang.code]}"/>`,
        )
        .join("\n");
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${route.byLanguage[languages[0].code]}"/>`;

      return languages
        .map(
          (lang) => `  <url>
    <loc>${SITE_URL}${route.byLanguage[lang.code]}</loc>
${alternates}
${xDefault}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
        )
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
};

const run = async () => {
  let puppeteer;
  try {
    ({ default: puppeteer } = await import("puppeteer"));
  } catch {
    console.error(
      "[prerender] puppeteer is not installed — skipping prerender.\n" +
        "            Install it with `npm i -D puppeteer` to ship prerendered HTML.",
    );
    process.exitCode = 0;
    return;
  }

  const { server, port } = await startServer();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/`, { waitUntil: "networkidle0" });

    const inventory = await page.evaluate(() => window.__CHOOSY_ROUTE_INVENTORY__ || []);
    const prerenderRoutes = await page.evaluate(
      () => window.__CHOOSY_PRERENDER_ROUTES__ || window.__CHOOSY_ROUTE_INVENTORY__ || [],
    );
    const languages = await page.evaluate(() =>
      (window.__CHOOSY_LANGUAGES__ || []).length ? window.__CHOOSY_LANGUAGES__ : null,
    );

    if (!inventory.length) {
      throw new Error(
        "window.__CHOOSY_ROUTE_INVENTORY__ is empty — check src/index.js exposes the route inventory.",
      );
    }

    const langCodes = Object.keys(inventory[0].byLanguage);
    const langList =
      languages ||
      langCodes.map((code) => ({
        code,
        hreflang: { am: "hy", ru: "ru", en: "en" }[code] || code,
      }));

    const targets = new Set();
    prerenderRoutes.forEach((route) => {
      langCodes.forEach((code) => {
        const routePath = route.byLanguage[code];
        if (isPrerenderable(routePath)) targets.add(routePath);
      });
    });

    const fontPreload = await buildFontPreload();

    let written = 0;
    for (const routePath of targets) {
      await page.goto(`${origin}${routePath}`, { waitUntil: "networkidle0" });
      /** Product carousels resolve through a mocked async layer — wait for real content. */
      await page
        .waitForFunction(() => document.querySelector("h1") !== null, { timeout: 15000 })
        .catch(() => {});

      const html = await page.evaluate(() => {
        /**
         * Strip state that only exists after the client has run, so the shipped HTML
         * matches React's first render and hydration does not bail out:
         *  - Swiper writes classes and inline transforms onto the DOM imperatively;
         *  - layout metrics are published as CSS variables on <html>.
         * The product markup itself (what crawlers read) is untouched.
         */
        const SWIPER_RUNTIME_CLASSES = [
          "swiper-initialized",
          "swiper-horizontal",
          "swiper-vertical",
          "swiper-backface-hidden",
          "swiper-android",
          "swiper-ios",
          "swiper-slide-active",
          "swiper-slide-next",
          "swiper-slide-prev",
          "swiper-slide-visible",
          "swiper-slide-fully-visible",
        ];
        document
          .querySelectorAll(".swiper, .swiper-wrapper, .swiper-slide")
          .forEach((el) => {
            el.classList.remove(...SWIPER_RUNTIME_CLASSES);
            el.style.removeProperty("transform");
            el.style.removeProperty("transition-duration");
            el.style.removeProperty("width");
            el.style.removeProperty("margin-right");
            if (!el.getAttribute("style")) el.removeAttribute("style");
            if (!el.getAttribute("class")) el.removeAttribute("class");
          });

        document.documentElement.style.removeProperty("--header-shell-height");
        document.documentElement.style.removeProperty("--header-height");
        document.documentElement.style.removeProperty("--mobile-bottom-nav-height");
        document.documentElement.style.removeProperty("--mobile-viewport-offset-bottom");
        if (!document.documentElement.getAttribute("style")) {
          document.documentElement.removeAttribute("style");
        }

        return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
      });
      const outFile = routeToFilePath(routePath);
      await mkdir(path.dirname(outFile), { recursive: true });
      await writeFile(outFile, fontPreload ? html.replace("</head>", `${fontPreload}</head>`) : html, "utf8");
      written += 1;
    }

    /**
     * Empty shell for URLs with no prerendered file (unknown product ids, typos).
     * Serving `index.html` there would hand out home-page markup — wrong content for
     * crawlers and a guaranteed hydration mismatch. Point the host's SPA fallback and
     * its 404 handler at this file.
     */
    const shell = await readFile(path.join(BUILD_DIR, "index.html"), "utf8");
    const emptyShell = shell.replace(
      /<div id="root">[\s\S]*<\/div>(\s*<\/body>)/,
      '<div id="root"></div>$1',
    );
    await writeFile(path.join(BUILD_DIR, "404.html"), emptyShell, "utf8");
    await writeFile(path.join(BUILD_DIR, "app-shell.html"), emptyShell, "utf8");

    const sitemap = buildSitemap(inventory, langList);
    await writeFile(path.join(BUILD_DIR, "sitemap.xml"), sitemap, "utf8");

    console.log(
      `[prerender] wrote ${written} HTML files, an empty app shell (404.html / app-shell.html) ` +
        `and a sitemap with ${inventory.length * langCodes.length} URLs`,
    );
  } finally {
    await browser.close();
    server.close();
  }
};

run().catch((error) => {
  console.error("[prerender] failed:", error);
  process.exitCode = 1;
});
