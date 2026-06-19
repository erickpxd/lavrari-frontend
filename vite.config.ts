import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import cesium from "vite-plugin-cesium"
import path from "node:path"

export default defineConfig({
  plugins: [
    react(),
    cesium(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Lavrari — RDO SUAPE",
        short_name: "Lavrari",
        description: "Registro Diário de Obras — SUAPE/DINFRA",
        theme_color: "#003366",
        background_color: "#0A1628",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globIgnores: ["**/cesium/**"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/obras") || url.pathname.startsWith("/rdos"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "lavrari-pages" },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
})
