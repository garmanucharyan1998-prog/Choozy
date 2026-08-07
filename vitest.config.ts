import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Separate from vite.config.ts: `@react-router/dev/vite`'s plugin builds SSR/route
 * manifests, which tests don't need and which conflicts with how Vitest runs — plain
 * `@vitejs/plugin-react` covers JSX transform + Fast Refresh, which is all a unit test
 * needs. `tsconfigPaths` keeps the project's absolute imports (`"pages/home"`, ...)
 * resolving the same way they do everywhere else.
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.js"],
    css: true,
  },
});
