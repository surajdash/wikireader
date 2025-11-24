import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  base: './', // Critical for Chrome Extension relative paths
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "" },
        { src: "assets/*", dest: "assets" },
        { src: "styles/*", dest: "styles" }
      ]
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true, // Clear dist on first build step
    rollupOptions: {
      input: {
        reader: path.resolve(__dirname, "reader.html"),
        options: path.resolve(__dirname, "options.html")
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
