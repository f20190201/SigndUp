import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function copyExtensionFiles() {
  return {
    name: "copy-extension-files",
    closeBundle() {
      fs.copyFileSync(
        resolve(__dirname, "manifest.json"),
        resolve(__dirname, "dist/manifest.json")
      );
      const iconsDir = resolve(__dirname, "dist/icons");
      if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);
      fs.readdirSync(resolve(__dirname, "public/icons")).forEach((file) => {
        fs.copyFileSync(
          resolve(__dirname, `public/icons/${file}`),
          resolve(__dirname, `dist/icons/${file}`)
        );
      });
    },
  };
}

export default defineConfig({
  root: "src",
  plugins: [react(), copyExtensionFiles()],
  build: {
    copyPublicDir: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        background: resolve(__dirname, "src/background/index.ts"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background/index.js";
          if (chunk.name === "content") return "content/index.js";
          return "[name].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    outDir: "../dist",
    emptyOutDir: true,
  },
});