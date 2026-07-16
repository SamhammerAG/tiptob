import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      external: (id) => id.startsWith("@tiptap/"),
    },
    lib: {
      entry: {
        webComponents: "./src/web-components.ts",
        extensions: "./src/extensions.ts"
      },
      formats: ["es"],
      fileName: (format, name) => {
        return name === "webComponents" ? "web-components.js" : "extensions.js";
      }
    },
    sourcemap: true
  },
  plugins: [svelte(), svgLoader()],
});
