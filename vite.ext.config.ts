import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false, // Don't wipe the app build
    lib: {
      entry: {
        background: path.resolve(__dirname, "background.ts"),
        contentScript: path.resolve(__dirname, "contentScript.ts")
      },
      formats: ["es"], // Use ES modules
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      output: {
        // Ensure we don't add hash to these files so manifest.json can reference them stably
        entryFileNames: "[name].js"
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
