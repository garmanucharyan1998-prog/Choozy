const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const boundaries = require("eslint-plugin-boundaries");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");

/**
 * Independent lint gate (`npm run lint`), separate from CRA's own build-time
 * ESLint (the `eslintConfig` block in package.json, which react-scripts runs
 * off its own bundled copy). This one exists to enforce the FSD layer
 * direction the project's `.cursor/rules` mandate:
 *
 *   pages -> widgets -> features -> entities -> shared
 *
 * `contexts` and `hooks` aren't named in that doc, but the codebase already
 * treats them as foundational (imported from almost every layer, themselves
 * depending only on `shared`), so they're modelled the same way here. `shared`
 * reaching into `contexts` for `useLanguage` is a real inversion (shared is
 * supposed to be dependency-free) — it's *allowed* below because ~8 files
 * already rely on it, but it's flagged as debt worth revisiting, not a
 * pattern to imitate in new code.
 *
 * Same-layer sibling imports (widget -> widget, entity -> entity) are left
 * unrestricted: the project's own rules only forbid *reverse* direction, and
 * the codebase leans on siblings within a layer in several places.
 */
/**
 * `capture` turns each top-level subfolder into its own element *instance*
 * (pages/home vs. pages/account, ...) rather than treating the whole layer as
 * one blob. Without it, an import between e.g. two different pages is
 * classified as "internal" (same element) and the dependencies rule skips it
 * by default (`checkInternals: false`) — which is exactly the K4 violation
 * this config exists to catch, so this isn't optional.
 */
const elementTypes = [
  /**
   * `root.tsx` and `routes.ts` (React Router's framework convention requires them at
   * the `appDirectory` root, not under `app/**`) are NOT covered by this pattern —
   * eslint-plugin-boundaries only supports "folder mode" for `boundaries/elements`
   * (confirmed via its own debug output: a bare top-level file never resolves to a
   * known element, no matter how the pattern is written), so they're invisible to
   * `boundaries/dependencies` regardless. Verified by hand instead: `root.tsx` only
   * imports `contexts` and `shared/*` (plus `react-router` itself) — consistent with
   * the `app` layer's allowances below. `routes.ts` imports only `@react-router/dev/routes`;
   * its `pages/*`/`widgets/*` references are string path literals for the framework's
   * route config, not ES imports, so there's nothing for a linter to check there at all.
   * Re-check `root.tsx` by hand if its imports change.
   */
  { type: "app", pattern: "app/**" },
  { type: "pages", pattern: "pages/*/**", capture: ["slice"] },
  { type: "widgets", pattern: "widgets/*/**", capture: ["slice"] },
  { type: "features", pattern: "features/*/**", capture: ["slice"] },
  { type: "entities", pattern: "entities/*/**", capture: ["slice"] },
  { type: "shared", pattern: "shared/**" },
  { type: "contexts", pattern: "contexts/**" },
  { type: "hooks", pattern: "hooks/**" },
];

module.exports = [
  {
    ignores: ["build/**", "node_modules/**", "coverage/**", "scripts/**"],
  },
  js.configs.recommended,
  {
    files: ["*.js", "*.cjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
  },
  {
    /**
     * `.ts`/`.tsx` included alongside `.js`/`.jsx` so `root.tsx`/`routes.ts` (framework
     * entry points, real import relationships worth boundary-checking) aren't silently
     * skipped — the default parser can't parse TS syntax (e.g. `satisfies`) at all, so
     * without this they'd just be invisible to every rule below, not merely unchecked.
     * `@typescript-eslint/parser` is a superset of the default JS parser, so it's safe
     * to use for the plain `.js`/`.jsx` files in this block too.
     */
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, ...globals.es2021, ...globals.jest },
    },
    settings: {
      react: { version: "19.0" },
      "boundaries/root-path": "src",
      "boundaries/elements": elementTypes,
      /**
       * The project's `jsconfig.json` sets `baseUrl: "src"`, so imports like
       * `"pages/home/presenter/useHomePagePresenter"` are bare-looking but actually
       * project-relative (CRA's webpack resolves them via an implicit NODE_PATH=src).
       * The boundaries plugin's resolver (eslint-import-resolver-node) doesn't know
       * that convention by default and silently drops anything it can't resolve —
       * which meant every absolute-style import was invisible to the boundaries
       * rules below. Without this, the rule never fires and gives a false "clean".
       */
      "import/resolver": {
        node: { moduleDirectory: ["node_modules", "src"], extensions: [".js", ".jsx"] },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      boundaries,
    },
    rules: {
      ...react.configs.recommended.rules,
      /**
       * Only the two classic hooks rules — same as CRA's own `react-app` config.
       * `eslint-plugin-react-hooks`'s "recommended" preset now also bundles the
       * React Compiler's static-analysis rules (`set-state-in-effect`, `purity`,
       * `immutability`, ...), which flag a lot of ordinary, valid patterns in this
       * codebase (syncing state to route changes, resetting on prop change). That's
       * a separate initiative from this gate's job (FSD boundaries); opting in is a
       * deliberate future decision, not a side effect of adding this config.
       */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ["pages", "widgets", "features", "entities", "shared", "contexts", "hooks"] },
                  },
                },
              },
            },
            {
              from: { element: { type: "pages" } },
              allow: {
                to: {
                  element: { types: { anyOf: ["widgets", "features", "entities", "shared", "contexts", "hooks"] } },
                },
              },
            },
            /**
             * Every `pages/*` slice's own `index.js` barrel re-exports its `ui/`
             * component (`export { default as X } from "./ui/X"`) — legitimate
             * self-composition, not a cross-page dependency. Explicit rather than
             * relying on the plugin's own "internal dependency" auto-skip: that skip
             * turns out to only apply to `import` statements, not `export ... from`
             * re-exports, so barrel files need this spelled out or every page's
             * own index.js trips the K4 check it's meant to catch.
             */
            {
              from: { element: { type: "pages" } },
              allow: { to: { element: { type: "pages", captured: { slice: "{{from.slice}}" } } } },
            },
            {
              from: { element: { type: "widgets" } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ["widgets", "features", "entities", "shared", "contexts", "hooks"] },
                  },
                },
              },
            },
            {
              from: { element: { type: "features" } },
              allow: {
                to: { element: { types: { anyOf: ["features", "entities", "shared", "contexts", "hooks"] } } },
              },
            },
            {
              from: { element: { type: "entities" } },
              allow: { to: { element: { types: { anyOf: ["entities", "shared"] } } } },
            },
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { types: { anyOf: ["shared", "contexts"] } } } },
            },
            {
              from: { element: { type: "contexts" } },
              allow: { to: { element: { type: "shared" } } },
            },
            {
              from: { element: { type: "hooks" } },
              allow: { to: { element: { types: { anyOf: ["contexts", "shared"] } } } },
            },
          ],
        },
      ],
    },
  },
  {
    /**
     * Tests legitimately need cross-layer fixtures (e.g. a `shared/lib/seo` test importing
     * catalog data from `entities` to assert against realistic input) — that's a different
     * concern from production code's architecture, not a boundary violation.
     */
    files: ["src/**/*.test.{js,jsx}"],
    rules: {
      "boundaries/dependencies": "off",
    },
  },
];
