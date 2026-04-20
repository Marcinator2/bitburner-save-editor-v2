import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/bitburner-save-editor-v2/",
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: ["buffer"],
  },
});
