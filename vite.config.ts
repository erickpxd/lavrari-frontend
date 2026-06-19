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
      includeAssets: ["favicon.svg", "assets/logos/simbolo-icon.png"],
      manifest: {
        name: "Laurari — RDO SUAPE",
        short_name: "Laurari",
        description: "Registro Diário de Obras — SUAPE/DINFRA",
        theme_color: "#2A1712",
        background_color: "#FAF8F4",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "assets/logos/simbolo-icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "assets/logos/simbolo-icon.png",
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
            // Só cacheia navegações do próprio app — nunca respostas de outra
            // origem (API/object storage), evitando servir 403 antigos de mídia.
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin &&
              (url.pathname.startsWith("/obras") ||
                url.pathname.startsWith("/rdos")),
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
