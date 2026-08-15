# Choozy

A price-comparison front-end for the Armenian electronics market: one product, every shop's
offer, side by side. Server-rendered, trilingual (Armenian / Russian / English) and built
SEO-first — every page a search engine should index is complete in the HTML before any
JavaScript runs.

There is **no backend**. The catalog, the shops, the offers, the dashboards and the search
index are all deterministic mock data that lives in `src/entities/*/model/`. Sign-in checks the
typed credentials against a local account registry and stores a cookie the browser sets on
itself, so the session is a demo of two different dashboards, not an authentication boundary.

**Stack:** React 19 · React Router 7 (framework mode, SSR) · Vite · Tailwind CSS · Vitest ·
Feature-Sliced Design enforced by ESLint.

---

## Quick start

Requires **Node 22+** (`npm run verify:responsive` uses the global `WebSocket`; everything
else is happy on 20).

```bash
npm install
npm run dev          # Vite prints the URL, usually http://localhost:5173
```

Production build and serve:

```bash
npm run build
npm run start        # react-router-serve, port 3000 unless PORT says otherwise
```

Set `VITE_SITE_URL` to the origin the site should be indexed under. It feeds canonical
links, `hreflang`, Open Graph, JSON-LD and `sitemap.xml`, and it is read during render — so
it must be identical on server and client, which is why it is an env var and not
`window.location.origin` (see [siteMeta.js](src/shared/config/siteMeta.js)).

## npm scripts

| Script | What it does |
| --- | --- |
| `dev` | Dev server with HMR. |
| `build` / `start` | Production build, then serve it with SSR. |
| `test` / `test:watch` | Vitest (jsdom). 48 files, 508 tests. |
| `lint` | ESLint — the real gate. Includes the FSD boundary rules. |
| `typecheck` | `react-router typegen` + `tsc --noEmit`. |
| `typegen` | Regenerate React Router's route types on their own. |
| `format` / `format:check` | Prettier over `src/**`. See the caveat below. |
| `verify:pages` | Crawls a **running** build and inspects the rendered DOM. |
| `verify:responsive` | Measures a **running** build in real Chrome at three widths. |

### The two harnesses that need a running server

Unit tests never lay anything out and never render a whole page, so two classes of defect are
invisible to them: a translation key that renders as its own dotted path, and a layout that
overflows a phone. Both harnesses take the base URL of a build you started yourself:

```bash
npm run build
PORT=4173 npm run start &                                   # PowerShell: $env:PORT=4173; npm run start
node scripts/verify-rendered-pages.mjs http://localhost:4173
node scripts/verify-responsive.mjs     http://localhost:4173
```

[verify-rendered-pages.mjs](scripts/verify-rendered-pages.mjs) walks every `<loc>` in
`sitemap.xml` plus the ComingSoon stubs, a `?ids=` compare selection and a 404 probe, and
fails on raw dictionary keys, wrong `<html lang>`, Armenian leaking into a non-Armenian page
and other things only the post-SSR DOM shows. It has already caught defects that passed lint,
typecheck and the whole unit suite.

[verify-responsive.mjs](scripts/verify-responsive.mjs) drives headless Chrome over the
DevTools Protocol using Node built-ins only — no Puppeteer, no browser download. Point it at
another binary with `CHROME_PATH`, move its debug port with `CDP_PORT`.

### Prettier is not a repo-wide gate

`format:check` fails on ~50 files that were already unformatted before it was introduced.
Format the files you fully own and leave the rest alone, or a one-line change arrives as a
thousand-line diff. `npm run lint` is the gate that must be clean.

## Architecture

### Layers

Feature-Sliced Design, imports flowing one way only:

```
pages → widgets → features → entities → shared
```

`app/` (framework routes, SEO inventory) sits above `pages/`; `contexts/` and `hooks/` are
treated as foundational — importable from anywhere, depending only on `shared/`.

This is not a convention kept by hand: [eslint.config.js](eslint.config.js) models every
top-level folder as its own boundary element and `boundaries/dependencies` defaults to
`disallow`, so a reverse import fails `npm run lint`. Same-layer sibling imports are allowed
on purpose. Tests are exempt — a test legitimately reaches for fixtures across layers.

One known inversion is grandfathered in: `shared/` may import `contexts/` for `useLanguage`.
It is debt, not a pattern to copy.

### MVP inside a slice

```
slice-name/
  model/       # data, domain logic, pure functions
  presenter/   # state and view-model preparation (hooks)
  ui/          # rendering only
  index.js     # the slice's public surface
```

Widgets render; presenters decide; models compute. Business logic in a `.jsx` file is a
review comment.

### Routing and SSR

`ssr: true`, and `appDirectory` stays `src/` instead of the framework's default `app/`
([react-router.config.ts](react-router.config.ts)).

[routes.ts](src/routes.ts) declares the route tree **once** and mounts it per language with
`prefix()`: Armenian is the default and lives at `/`, Russian at `/ru`, English at `/en`.
Because the same file is mounted several times, every route carries an explicit unique `id`.
Two shell layouts wrap the tree — a plain one for content pages, a subtler one for the
account dashboards. `sitemap.xml` and `robots.txt` are resource routes with no shell.

`/catalog`, `/products` and `/variety` are deliberate ComingSoon stubs: real routes, real
meta, no invented content.

## Internationalization

- [translations.js](src/shared/i18n/translations.js) is the **Armenian base** dictionary —
  the complete key space.
- [en.overrides.js](src/shared/i18n/locales/en.overrides.js) and
  [ru.overrides.js](src/shared/i18n/locales/ru.overrides.js) override it; `buildLocale`
  merges them.
- `t(path, fallback)` has **no parameter interpolation**: it resolves a dotted path to a string
  and nothing else. Per-item copy therefore needs per-item keys, and the handful of strings
  that do take a value carry a literal `{{count}}` the call site replaces itself.

Two test files hold the line, and they are strict on purpose:

- `localeCoverage.test.js` — every path exists in all three locales.
- `copyIntegrity.test.js` — no placeholder copy, no hard line breaks, no market outside
  Armenia, no unsubstantiated counts, no category the catalog does not carry, no camelCase
  leaking into English/Russian prose (brand names whitelisted), no Armenian string literals
  outside the dictionary (small allowlist), and **no English-style Title Case in Armenian**,
  which is a real orthographic error rather than a style preference.

## SEO

Semantic landmarks, a single `h1` per page, informative `alt` text and descriptive links are
checked by `shared/lib/seo/markupConventions.test.js`. `buildPageMeta` assembles title,
description, canonical, `hreflang` and social tags; JSON-LD is built per page type
(organization, catalog, product, comparison). `app/seo/routeInventory.js` is the one list of
indexable routes, and both `sitemap.xml` and its tests read from it, so a new page cannot be
half-registered. `<lastmod>` comes from a hand-maintained
[contentRevision.js](src/shared/config/contentRevision.js) — a date stamped by `new Date()`
would claim content changed whenever the server restarted.

## Demo data

| | |
| --- | --- |
| Products | 108 across 11 categories (`smartphones` … `accessories`) |
| Shops | 12, each with its own price position, category coverage, rating and terms |
| Offers | ~840 rows generated from the two above |
| Photos | 127 Unsplash frames, one fixed crop, each verified by eye |
| Brands | 38 |
| Search | 45 Armenian suggestions, 16 synonym groups covering am / en / ru |
| Dashboards | 62 seller products, 28 days of statistics, 12 payments, 12+12 notifications |

[productCatalog.js](src/entities/product/model/productCatalog.js) is the single source of
truth. The home carousels, the filter page, related products and the search index are all
views over it ([productSelectors.js](src/entities/product/model/productSelectors.js)) or
generated from it at read time (offers, specs, price history, galleries). Product ids are
**append-only** — they are embedded in saved wishlists, compare slugs and the sitemap.

Anything that renders during SSR is derived from a **seeded hash of the product id**, never
from `Math.random()` or the clock: a value that differs between server and client is a
hydration mismatch on every page. (`Date.now()` appears only where a visitor creates
something in the browser at runtime, e.g. a seller adding a listing.)

The recurring defect in mock data is *one value repeated across many rows* — one description
for twelve shops, one photo for eight laptops, three identical payment dates. Each fix here is
guarded by a test that asserts **variety**, not merely presence: prices must differ, the
cheapest shop must vary across the catalog, no photo may be the cover of more than two
products, badges must be earned.

## Demo accounts

Sign-in requires an account that exists in this browser. Two are seeded so the dashboards work
without registering:

| Email | Password | Lands on |
| --- | --- | --- |
| `buyer.demo@choosy.am` | any | `/account` — wishlist, recently viewed, profile |
| `seller.demo@choosy.am` | any | `/account/shop-account` — listings, statistics, finance |

An unknown email is rejected with "wrong email or password" rather than silently signing you in
as a buyer with an empty account. The seeded pair has no password on file, so any password opens
them — an account can only have a *wrong* password once it has one at all. Registration stores a
hash (`sha256`, in the same localStorage registry as the role), and changing the password from
the account page updates it, so accounts created here are checked for real from then on.

None of this is authentication. The registry is localStorage the visitor can edit, the hash is
unsalted and computed in the browser, and the session cookie is one the browser sets on itself.
It exists so the login form can be wrong, which is a UX property rather than a security one.

Registration remembers which role an email chose (localStorage), and a role is decided once —
re-registering an address does not flip it.

## Repository layout

```
scripts/                 the two rendered-build harnesses
src/
  root.tsx  routes.ts    framework entry points (must stay at the appDirectory root)
  app/                   resource routes, session actions, redirects, SEO inventory
  pages/                 13 route entry points
  widgets/               21 composed blocks (header, footer, dashboards, compare, …)
  features/              17 interactions (filtering, compare, login, wishlist, …)
  entities/              14 business entities — the mock data and domain logic live here
  shared/                ui, lib, i18n, config, assets
  contexts/              language, session, offer-variant filter
eslint.config.js         FSD boundaries, documented rule by rule
vitest.config.ts         separate from vite.config.ts on purpose
```

## Conventions worth knowing before the first commit

- **`npm run lint` and `npm run typecheck` must be clean, and the full suite must pass.**
  For anything touching copy, routes or layout, run the two rendered-build harnesses too.
- New copy goes in the Armenian base first, then both override files. A key missing from one
  locale fails `localeCoverage`.
- Comments explain **why**, not what — the surrounding code sets the bar, and it is a high
  one. A non-obvious decision without a reason recorded next to it tends to be re-broken.
- Adding mock data means adding *different* mock data, and a test that proves it differs.
