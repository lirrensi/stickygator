// src/i18n.js
import { createI18n } from "vue-i18n";

// Load locale messages dynamically
function loadLocaleMessages() {
    const locales = import.meta.glob("./locale/*.json", { eager: true });
    const messages = {};

    for (const path in locales) {
        // @ts-ignore
        const locale: any = path.match(/\/([^/]+)\.json$/)[1]; // Extract 'en', 'fr', etc.
        messages[locale] = (locales[path] as any).default;
    }
    return messages;
}

const messages = loadLocaleMessages();

const i18n = createI18n({
    locale: "en", // Default language
    fallbackLocale: "en", // Fallback language
    messages,
});

export function getAllLocales() {
    return Object.keys(messages); // Returns an array of locales, e.g., ['en', 'fr']
}

export function switchLocale(locale: string) {
    i18n.global.locale = locale;
}

export function tt(key: string, params?: Record<string, unknown>) {
    // @ts-ignore
    return i18n.global.t(key, params);
}

export default i18n;
