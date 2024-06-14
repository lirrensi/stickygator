import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default ({ mode }) =>
    defineConfig({
        base: mode === "browser" ? "/sssticky/" : "/",

        plugins: [
            vue(),
            legacy(),
            VitePWA({
                registerType: "autoUpdate",
                manifest: {
                    theme_color: "#ffffff",
                    display: "standalone",
                    description: "Elegant sticky notes app",
                    icons: [
                        {
                            src: "icons/pwa-192x192.png",
                            sizes: "192x192",
                            type: "image/png",
                            purpose: "any",
                        },
                        {
                            src: "icons/pwa-512x512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "any",
                        },
                        {
                            src: "icons/pwa-maskable-192x192.png",
                            sizes: "192x192",
                            type: "image/png",
                            purpose: "maskable",
                        },
                        {
                            src: "icons/pwa-maskable-512x512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "maskable",
                        },
                    ],
                },
                workbox: {
                    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
                },
            }),
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        test: {
            globals: true,
            environment: "jsdom",
        },
    });
