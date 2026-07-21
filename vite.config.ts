import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this repo under /average-down-calculator/, so built
  // asset URLs need that prefix. The dev server serves from the root.
  base: command === "build" ? "/average-down-calculator/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
}));
