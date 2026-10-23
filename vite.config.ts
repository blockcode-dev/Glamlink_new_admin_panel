/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, open: true },
  preview: { port: 3000 },
  build: {
    // Same output folder CRA used, so deploy scripts don't change.
    outDir: "build",
    // Production builds drop every console.* call. Error logs print whole axios errors,
    // request headers (the admin token) included. Dev and tests keep them.
    rolldownOptions: { output: { minify: { compress: { dropConsole: true } } } },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    restoreMocks: true,
    env: {
      VITE_API_BASE_URL: "https://api.test/api/v1/",
      VITE_IMAGE_BASE_URL: "https://api.test/api/v1/images/",
      VITE_VIDEO_BASE_URL: "https://api.test/api/v1/videos/",
      VITE_GOOGLE_MAPS_API_KEY: "test",
    },
  },
});
