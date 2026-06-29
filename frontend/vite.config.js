// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Vite Configuration
// ============================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      "@platform": path.resolve(__dirname, "./src/platform"),
      "@ui": path.resolve(__dirname, "./src/platform/ui"),
      "@layouts": path.resolve(__dirname, "./src/platform/layout"),
      "@navigation": path.resolve(__dirname, "./src/platform/navigation"),
      "@buttons": path.resolve(__dirname, "./src/platform/buttons"),
      "@permissions": path.resolve(__dirname, "./src/platform/permissions"),
      "@widgets": path.resolve(__dirname, "./src/platform/widgets"),

      "@modules": path.resolve(__dirname, "./src/modules"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@theme": path.resolve(__dirname, "./src/theme"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@config": path.resolve(__dirname, "./src/config"),
    },
  },
});