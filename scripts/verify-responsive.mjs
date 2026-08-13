#!/usr/bin/env node
/**
 * Measures a running build in a real browser at three widths in all three languages (see
 * `npm run verify:responsive`), and fails on the layout defects nothing else here can see.
 *
 * `markupConventions.test.js` scans source, `copyIntegrity.test.js` scans the dictionary and
 * `verify-rendered-pages.mjs` scans SSR HTML — none of them lay anything out. jsdom does not
 * either: every `getBoundingClientRect` it returns is zero, so a component test can assert that
 * a class is present but never that the result fits on a phone. Two real defects that shipped
 * past all of the above are the reason this exists:
 *
 *   - `sr-only` is `position: absolute`, and an absolutely positioned element anchors to its
 *     nearest *positioned* ancestor — `overflow-x: auto` clips but does not position. The compare
 *     table's winner cells leaked their sr-only text out of the scroller, anchored it to the
 *     document at the column's scrolled-out x, and gave the page 55px of horizontal scroll.
 *   - Under `table-fixed`, a `min-width` larger than the declared columns is redistributed across
 *     them, so a two-product pair page inflated its columns until only one product fitted at 360px.
 *
 * Drives headless Chrome over the DevTools Protocol using only Node built-ins — no Puppeteer, no
 * Playwright, no browser download. Requires Node 22+ for the global WebSocket.
 *
 * Usage: node scripts/verify-responsive.mjs http://localhost:4173
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error("Usage: node scripts/verify-responsive.mjs <baseUrl>");
  process.exit(1);
}

if (typeof globalThis.WebSocket !== "function") {
  console.error("This script needs Node 22+ (global WebSocket).");
  process.exit(1);
}

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const DEBUG_PORT = Number(process.env.CDP_PORT || 9339);
/** WCAG 2.2 AA: a control this small needs at least 24x24 CSS px. */
const MIN_TAP_TARGET = 24;
/**
 * Narrower than this and a bar is a swatch, not a measurement: the shortest ratio the catalog
 * produces (a 25,000 AMD accessory beside a 1,290,000 AMD laptop) has to stay distinguishable
 * from the next one up. Set against the narrowest panel the layout can produce — one column on
 * a 360px phone.
 */
const MIN_BAR_TRACK = 90;

const VIEWPORTS = [
  { name: "360 phone", width: 360, height: 740, mobile: true },
  { name: "768 tablet", width: 768, height: 1024, mobile: false },
  { name: "1280 desktop", width: 1280, height: 800, mobile: false },
];
const LOCALES = [
  { code: "am", prefix: "" },
  { code: "ru", prefix: "/ru" },
  { code: "en", prefix: "/en" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Everything below runs in the page. Each check is here rather than in Node because each one
 * needs real layout: computed overflow, painted rectangles, and whether two fixed elements that
 * know nothing about each other happen to land in the same place.
 */
const MEASURE = `(() => {
  const doc = document.documentElement;
  /**
   * The layout viewport, not window.innerWidth: once mobile Chrome zooms out to fit overflowing
   * content, innerWidth grows to match it and the element that caused the overflow stops looking
   * too wide.
   */
  const vw = doc.clientWidth;

  const describe = (el) => {
    const cls = (el.getAttribute("class") || "").trim().split(/\\s+/).slice(0, 3).join(".");
    return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (cls ? "." + cls : "");
  };

  /**
   * A scrolling or clipping ancestor is allowed to hold something wider than the screen — a
   * carousel track and the compare table both legitimately do. So is a closed off-canvas panel,
   * which is fixed and parked wholly outside the viewport by design.
   */
  const isExcused = (el) => {
    let node = el;
    while (node && node !== doc) {
      const style = getComputedStyle(node);
      if (node !== el && style.overflowX !== "visible") return true;
      if (style.position === "fixed") {
        const r = node.getBoundingClientRect();
        if (r.left >= vw - 1 || r.right <= 1) return true;
      }
      node = node.parentElement;
    }
    return false;
  };

  const overflowing = [];
  document.querySelectorAll("body *").forEach((el) => {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    if (rect.right > vw + 1 && !isExcused(el)) {
      overflowing.push({ el: describe(el), right: Math.round(rect.right) });
    }
  });

  const rectOf = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top), bottom: Math.round(r.bottom),
      left: Math.round(r.left), right: Math.round(r.right),
      width: Math.round(r.width), height: Math.round(r.height),
    };
  };
  const overlaps = (a, b) =>
    !!a && !!b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

  /**
   * Matched on the roles and ids the markup already carries rather than on test-only attributes:
   * the tray is the one fixed landmark region, and the radar section is labelled by a fixed id.
   * Class fragments would break on a Tailwind reshuffle; aria-labels differ per locale.
   */
  const tray = rectOf('[role="region"][class*="fixed"]');
  const bottomNav = rectOf("nav.fixed.bottom-0");
  const scrollTop = rectOf('button[class*="fixed"][class*="z-50"]');

  /** Radar: an axis label painted outside the svg's own box is a clipped label. */
  const svg = document.querySelector('[aria-labelledby="compare-radar-heading"] svg');
  let radar = null;
  if (svg) {
    const box = svg.getBoundingClientRect();
    const clippedLabels = [];
    svg.querySelectorAll("text").forEach((node) => {
      const r = node.getBoundingClientRect();
      if (r.width === 0) return;
      if (r.left < box.left - 0.5 || r.right > box.right + 0.5 ||
          r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5) {
        clippedLabels.push(node.textContent);
      }
    });
    radar = {
      width: Math.round(box.width),
      height: Math.round(box.height),
      polygons: svg.querySelectorAll('polygon[fill]:not([fill="none"])').length,
      labels: svg.querySelectorAll("text").length,
      clippedLabels,
    };
  }

  /** How many of the compare table's columns actually fit in its scroll viewport. */
  const table = document.querySelector("table");
  let tableInfo = null;
  if (table) {
    const scroller = table.closest('[class*="overflow-x-auto"]');
    const headCells = [...table.querySelectorAll("thead th")];
    const box = scroller && scroller.getBoundingClientRect();
    tableInfo = {
      headCells: headCells.length,
      visibleCols: box
        ? headCells.filter((th) => {
            const r = th.getBoundingClientRect();
            return r.width > 0 && r.left >= box.left - 1 && r.right <= box.right + 1;
          }).length
        : 0,
      scrollWidth: scroller ? scroller.scrollWidth : null,
      clientWidth: scroller ? scroller.clientWidth : null,
    };
  }

  /**
   * The compare bars. Each attribute panel lays its lanes out as one three-column grid so that
   * every track inside it ends at the same x — two bars at the same ratio have to be the same
   * length, and sizing lanes individually would let a panel's longest printed value shorten
   * only its own track. That invariant lives in a single grid-template-columns, is invisible in
   * the DOM, and jsdom cannot measure it, so it is checked here.
   */
  const barPanels = [];
  document.querySelectorAll('[role="group"][aria-labelledby^="compare-bar-"]').forEach((panel) => {
    const panelBox = panel.getBoundingClientRect();
    const tracks = [...panel.querySelectorAll('[aria-hidden="true"] > .compare-bars__fill')].map(
      (fill) => fill.parentElement.getBoundingClientRect(),
    );
    if (tracks.length === 0) return;
    const widths = tracks.map((r) => r.width);
    const values = [...panel.querySelectorAll(".tabular-nums")].map((el) =>
      el.getBoundingClientRect(),
    );
    barPanels.push({
      key: panel.getAttribute("aria-labelledby").replace("compare-bar-", ""),
      lanes: tracks.length,
      trackWidth: Math.round(Math.min(...widths)),
      /** Anything above a subpixel means the lanes were not sized by one shared grid. */
      trackSpread: Math.round(Math.max(...widths) - Math.min(...widths)),
      /** A value wide enough to leave the panel is a number the visitor cannot read. */
      valueOverflow: Math.round(
        Math.max(0, ...values.map((r) => r.right - panelBox.right + 0.5)),
      ),
    });
  });

  const smallTargets = [];
  document
    .querySelectorAll('[role="region"][class*="fixed"] a, [role="region"][class*="fixed"] button, [aria-labelledby="compare-radar-heading"] button')
    .forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (r.width < ${MIN_TAP_TARGET} || r.height < ${MIN_TAP_TARGET}) {
        smallTargets.push(describe(el) + " " + Math.round(r.width) + "x" + Math.round(r.height));
      }
    });

  const main = document.querySelector("main");

  return {
    lang: doc.lang,
    horizontalScroll: doc.scrollWidth - doc.clientWidth,
    viewportWidth: vw,
    overflowing: overflowing.slice(0, 10),
    trayHeightVar: getComputedStyle(doc).getPropertyValue("--compare-tray-height").trim(),
    tray,
    trayOverlapsNav: overlaps(tray, bottomNav),
    scrollTopOverlapsTray: overlaps(scrollTop, tray),
    mainPadBottom: main ? Math.round(parseFloat(getComputedStyle(main).paddingBottom)) : null,
    radar,
    table: tableInfo,
    barPanels,
    smallTargets,
  };
})()`;

/**
 * The compare table's pinned product strip, measured mid-scroll.
 *
 * Every other check here runs at scroll position 0, and that is exactly how this element shipped
 * invisible: it pinned at `top: 0` underneath a header shell that is itself sticky at the top and
 * ~198px tall, so it painted behind the site's own search bar and no one ever saw it. Nothing that
 * only looks at an unscrolled page can catch that, and jsdom cannot lay any of it out.
 *
 * `occluded` is the real test — not "is it in the DOM" but "does it actually paint": whatever
 * `elementFromPoint` returns at the strip's own centre has to be the strip or something inside it.
 */
const PINNED_STRIP = `(() => {
  const table = document.querySelector("table");
  if (!table) return null;
  const block = table.closest('[class*="overflow-x-auto"]');
  /**
   * The painted header, not the spacer that reserves room for it. Once the header compacts on
   * scroll the two are ~47px apart, and measuring the reservation is exactly the mistake that
   * left the strip hanging in mid-air below the header.
   */
  const shell = document.querySelector("[data-header-shell]");
  const shellBottom = shell ? Math.round(shell.getBoundingClientRect().bottom) : 0;
  const blockRect = block.getBoundingClientRect();
  const strip = [...document.querySelectorAll('[role="region"]')].find((el) => {
    const r = el.getBoundingClientRect();
    return getComputedStyle(el).position === "fixed" && r.height > 0 && r.top < innerHeight / 2;
  });
  const base = {
    shellBottom,
    blockTop: Math.round(blockRect.top),
    blockBottom: Math.round(blockRect.bottom),
  };
  if (!strip) return { ...base, present: false };
  const r = strip.getBoundingClientRect();
  const painted = document.elementFromPoint(
    Math.round(r.left + r.width / 2),
    Math.round(r.top + r.height / 2),
  );
  return {
    ...base,
    present: true,
    top: Math.round(r.top),
    bottom: Math.round(r.bottom),
    underHeader: r.top < shellBottom - 1,
    /** The other direction: pinned to something taller than the header, leaving a visible band. */
    detachedBy: Math.max(0, Math.round(r.top - shellBottom)),
    occluded: !(painted && strip.contains(painted)),
    paintedInstead: painted ? painted.tagName.toLowerCase() : null,
  };
})()`;

/** Puts the table across the pin line — its header gone, most of its rows still on screen. */
const SCROLL_INTO_TABLE = `(() => {
  const table = document.querySelector("table");
  if (!table) return false;
  const block = table.closest('[class*="overflow-x-auto"]');
  scrollTo(0, block.getBoundingClientRect().top + scrollY + Math.round(block.offsetHeight / 2));
  return true;
})()`;

/** And well past its end, where the strip has no table left to label. */
const SCROLL_PAST_TABLE = `(() => {
  const table = document.querySelector("table");
  if (!table) return false;
  const block = table.closest('[class*="overflow-x-auto"]');
  scrollTo(0, block.getBoundingClientRect().bottom + scrollY + 200);
  return true;
})()`;

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      } else if (message.method) {
        (this.handlers.get(message.method) || []).forEach((fn) => fn(message.params));
      }
    });
  }

  send(method, params = {}) {
    this.nextId += 1;
    const id = this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`${method} timed out`));
      }, 30000);
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const list = this.handlers.get(method) || [];
      const fn = (params) => {
        this.handlers.set(method, (this.handlers.get(method) || []).filter((h) => h !== fn));
        resolve(params);
      };
      list.push(fn);
      this.handlers.set(method, list);
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || "evaluate failed");
    }
    return result.result.value;
  }
}

/**
 * Discovers what to compare from the running site rather than hard-coding product ids that go
 * stale the next time the catalog grows: the sitemap names the pair pages, and each pair page
 * links back to `/compare?ids=…` with its own two ids. Pairs are generated within one category,
 * so growing the set through pairs that share an id keeps every id in the same category — which
 * is what the selection rules require.
 */
const discoverFixtures = async () => {
  const res = await fetch(`${baseUrl}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml fetch failed: ${res.status}`);
  const xml = await res.text();
  const slugs = [
    ...new Set(
      [...xml.matchAll(/<loc>[^<]*\/compare\/([^<]+)<\/loc>/g)].map((match) => match[1]),
    ),
  ];
  if (slugs.length === 0) throw new Error("no /compare/<pair> pages in the sitemap");

  const idsForSlug = async (slug) => {
    const page = await fetch(`${baseUrl}/compare/${slug}`);
    const html = await page.text();
    const link = html.match(/href="[^"]*\?ids=([^"&]+)"/);
    return link ? decodeURIComponent(link[1]).split(",") : [];
  };

  const selection = new Set(await idsForSlug(slugs[0]));
  for (const slug of slugs.slice(1)) {
    if (selection.size >= 4) break;
    const ids = await idsForSlug(slug);
    /** Sharing an id proves the same category without needing the catalog module here. */
    if (ids.some((id) => selection.has(id))) ids.forEach((id) => selection.add(id));
  }

  return { pairSlug: slugs[0], compareIds: [...selection].slice(0, 4).join(",") };
};

const launchChrome = () => {
  const binary = CHROME_CANDIDATES.find((path) => existsSync(path));
  if (!binary) {
    console.error(
      `No Chrome/Edge found. Set CHROME_PATH, or install one of:\n${CHROME_CANDIDATES.join("\n")}`,
    );
    process.exit(1);
  }
  const userDataDir = mkdtempSync(join(tmpdir(), "choosy-responsive-"));
  const child = spawn(
    binary,
    [
      "--headless=new",
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  return { child, userDataDir };
};

const main = async () => {
  const { pairSlug, compareIds } = await discoverFixtures();
  const pages = [
    { id: "home", path: "/" },
    { id: "catalog", path: "/filter?category=smartphones" },
    { id: "compare", path: `/compare?ids=${compareIds}` },
    { id: "pair", path: `/compare/${pairSlug}` },
  ];
  console.log(`Comparing ${compareIds.split(",").length} products; pair page ${pairSlug}\n`);

  const { child, userDataDir } = launchChrome();
  let endpoint = null;
  for (let attempt = 0; attempt < 60 && !endpoint; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const targets = await res.json();
      endpoint = targets.find((target) => target.type === "page")?.webSocketDebuggerUrl ?? null;
    } catch {
      await sleep(250);
    }
  }
  if (!endpoint) {
    child.kill();
    throw new Error("Chrome did not expose a debugging endpoint");
  }

  const ws = new WebSocket(endpoint);
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  const cdp = new Cdp(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  const findings = [];
  const rows = [];

  for (const viewport of VIEWPORTS) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
    });

    for (const locale of LOCALES) {
      /** Seed the selection on the origin first — localStorage is per-origin, not per-page. */
      await cdp.send("Page.navigate", { url: `${baseUrl}${locale.prefix || "/"}` });
      await cdp.once("Page.loadEventFired");
      await cdp.evaluate(
        `localStorage.setItem("choozy.compare.v1", ${JSON.stringify(compareIds)}), 1`,
      );

      for (const page of pages) {
        await cdp.send("Page.navigate", { url: `${baseUrl}${locale.prefix}${page.path}` });
        await cdp.once("Page.loadEventFired");
        /** Hydration, the mount gates, and the observer that publishes the tray's height. */
        await sleep(700);

        const label = `${viewport.name.padEnd(12)} ${locale.code} ${page.id.padEnd(8)}`;
        let m;
        try {
          m = await cdp.evaluate(MEASURE);
        } catch (error) {
          findings.push(`${label}: measurement failed — ${error.message}`);
          continue;
        }
        rows.push({ label, ...m });

        if (m.horizontalScroll > 1) {
          findings.push(`${label}: page scrolls horizontally by ${m.horizontalScroll}px`);
        }
        m.overflowing.forEach((item) =>
          findings.push(`${label}: past the viewport — ${item.el} right=${item.right}`),
        );
        if (m.trayOverlapsNav) findings.push(`${label}: compare tray overlaps the bottom nav`);
        if (m.scrollTopOverlapsTray) {
          findings.push(`${label}: scroll-to-top button overlaps the compare tray`);
        }
        (m.radar?.clippedLabels ?? []).forEach((text) =>
          findings.push(`${label}: radar axis label clipped — "${text}"`),
        );
        m.smallTargets.forEach((target) =>
          findings.push(`${label}: tap target under ${MIN_TAP_TARGET}px — ${target}`),
        );
        (m.barPanels ?? []).forEach((panel) => {
          if (panel.trackSpread > 1) {
            findings.push(
              `${label}: compare bars "${panel.key}" tracks differ by ${panel.trackSpread}px — equal ratios would draw unequal bars`,
            );
          }
          if (panel.valueOverflow > 0) {
            findings.push(
              `${label}: compare bars "${panel.key}" value runs ${panel.valueOverflow}px past its panel`,
            );
          }
          if (panel.trackWidth < MIN_BAR_TRACK) {
            findings.push(
              `${label}: compare bars "${panel.key}" track is only ${panel.trackWidth}px — the bar stops carrying the comparison`,
            );
          }
        });
        if (m.tray && m.mainPadBottom !== null && m.tray.height > m.mainPadBottom) {
          findings.push(
            `${label}: tray ${m.tray.height}px exceeds main's bottom padding ${m.mainPadBottom}px — content hides under it`,
          );
        }

        /** Scroll-dependent, so it runs after everything measured at rest. */
        if (m.table) {
          await cdp.evaluate(SCROLL_INTO_TABLE);
          await sleep(250);
          const pinned = await cdp.evaluate(PINNED_STRIP);
          if (!pinned?.present) {
            findings.push(
              `${label}: no pinned product strip while the table spans the viewport (block ${pinned?.blockTop}..${pinned?.blockBottom})`,
            );
          } else {
            if (pinned.underHeader) {
              findings.push(
                `${label}: pinned strip starts at ${pinned.top}, above the header shell's ${pinned.shellBottom} — it sits behind the site header`,
              );
            }
            if (pinned.detachedBy > 1) {
              findings.push(
                `${label}: pinned strip floats ${pinned.detachedBy}px below the header (strip at ${pinned.top}, header ends at ${pinned.shellBottom}) — the table scrolls through the gap`,
              );
            }
            if (pinned.occluded) {
              findings.push(
                `${label}: pinned strip is covered — <${pinned.paintedInstead}> paints at its centre`,
              );
            }
            rows[rows.length - 1].pinned = pinned;
          }

          await cdp.evaluate(SCROLL_PAST_TABLE);
          await sleep(250);
          const after = await cdp.evaluate(PINNED_STRIP);
          if (after?.present) {
            findings.push(
              `${label}: pinned strip still shown ${after.top}..${after.bottom} after its table ended at ${after.blockBottom}`,
            );
          }
          await cdp.evaluate("scrollTo(0, 0), 1");
          await sleep(150);
        }
      }
    }
  }

  console.log("--- measurements ---");
  rows.forEach((row) => {
    console.log(
      [
        row.label,
        `lang=${row.lang}`,
        `hscroll=${row.horizontalScroll}`,
        row.tray ? `tray=${row.tray.width}x${row.tray.height}` : "tray=-",
        `var=${row.trayHeightVar || "-"}`,
        row.radar
          ? `radar=${row.radar.width}x${row.radar.height} poly=${row.radar.polygons} axes=${row.radar.labels}`
          : "radar=-",
        row.table
          ? `cols=${row.table.visibleCols}/${row.table.headCells} scroll=${row.table.scrollWidth}/${row.table.clientWidth}`
          : "table=-",
        row.barPanels?.length
          ? `bars=${row.barPanels.length}p/${row.barPanels[0].lanes}l track=${Math.min(
              ...row.barPanels.map((panel) => panel.trackWidth),
            )}px`
          : "bars=-",
        row.pinned ? `pinned=${row.pinned.top}..${row.pinned.bottom}` : "pinned=-",
      ].join("  "),
    );
  });

  console.log(`\n--- findings ---`);
  if (findings.length === 0) console.log("None.");
  else findings.forEach((finding) => console.log(`- ${finding}`));
  console.log(`\n${findings.length} finding(s) over ${rows.length} page renders.`);

  ws.close();
  child.kill();
  try {
    rmSync(userDataDir, { recursive: true, force: true });
  } catch {
    /** Chrome may still hold a handle; the directory is disposable either way. */
  }

  if (findings.length > 0) process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
