/**
 * Dev-only helper: injects the prerendered markup for a route into public/index.html so
 * the development bundle hydrates it and prints React's full mismatch diff.
 * Run `node scripts/hydration-debug.mjs <route>` then start the dev server;
 * run `node scripts/hydration-debug.mjs --restore` when done.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");
const tpl = path.join(root, "public", "index.html");
const bak = path.join(root, "public", "index.html.bak");

if (process.argv[2] === "--restore") {
  if (existsSync(bak)) { copyFileSync(bak, tpl); rmSync(bak); console.log("restored"); }
  process.exit(0);
}

const route = process.argv[2] || "/";
const file = path.join(root, "build", ...route.split("/").filter(Boolean), "index.html");
const built = readFileSync(file, "utf8");
const start = built.indexOf('<div id="root">') + '<div id="root">'.length;
const end = built.lastIndexOf("</div></body>");
const inner = built.slice(start, end);

if (!existsSync(bak)) copyFileSync(tpl, bak);
const collector =
  '<script>window.__hyd=[];var _ce=console.error;console.error=function(){window.__hyd.push(Array.from(arguments).map(String).join(" | "));_ce.apply(console,arguments);};</script>';
let out = readFileSync(bak, "utf8");
out = out.replace("</head>", collector + "</head>");
out = out.replace('<div id="root"></div>', '<div id="root">' + inner + "</div>");
writeFileSync(tpl, out);
console.log(`injected ${route} (${inner.length} chars)`);
