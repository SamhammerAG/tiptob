import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// separate from vite.config.ts - that one builds the library with @tiptap/* marked as external and
// bundled into rollup's lib mode, neither of which vitest should apply when running tests.
export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
