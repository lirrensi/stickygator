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
                    theme_color: "#f7f9fc",
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
