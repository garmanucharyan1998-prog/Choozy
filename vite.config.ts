import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * `@react-router/dev/vite` bundles its own React/JSX + Fast Refresh handling —
 * no separate `@vitejs/plugin-react` needed. `tsconfigPaths` reads `baseUrl: "src"`
 * from tsconfig.json so the project's existing absolute imports (`"pages/home"`,
 * `"shared/lib/seo"`, ...) keep resolving the same way they did under CRA's
 * implicit NODE_PATH=src.
 */
export default defineConfig({
  plugins: [tsconfigPaths(), reactRouter()],
});
