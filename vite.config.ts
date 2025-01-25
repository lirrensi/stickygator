import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";

// Plugin imports
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

// Function to create a list of plugins based on the mode
function createPlugins(mode) {
    const plugins: any = [vue()];

    // Conditionally add plugins if mode is "browser"
    if (mode === "browser") {
        plugins.push(
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
        );
    }

    return plugins;
}

// Export the final configuration
export default ({ mode }) =>
    defineConfig({
        base: mode === "browser" ? "/sssticky/" : "./",
        plugins: createPlugins(mode),
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
