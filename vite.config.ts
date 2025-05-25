import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";


export default defineConfig({
  plugins: [
    react(),
    
  ],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  server: {
    host: true,
    port: 5173,
    // Allow Tempo to access the dev server
    allowedHosts: process.env.TEMPO === "true" ? true : true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://localhost:3001",
        ws: true,
        changeOrigin: true,
      },
      "/server-start": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/file": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      }
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    watch: {},
  },
  publicDir: "public",
});
