import type { Config } from "@react-router/dev/config";

export default {
  /** Keeps the existing `src/` tree instead of renaming everything to `app/`. */
  appDirectory: "src",
  /** Real SSR — this is the whole point of the migration (see plan Stage 2 / K3). */
  ssr: true,
} satisfies Config;
