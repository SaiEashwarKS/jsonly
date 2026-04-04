import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: "src/content.tsx",
      formats: ["iife"],
      name: "jsonly",
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "content.[ext]",
      },
    },
    cssCodeSplit: false,
    minify: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    tsconfigPaths: true,
  },
});
