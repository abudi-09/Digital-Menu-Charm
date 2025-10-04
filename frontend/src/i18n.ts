import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Languages we support
export const SUPPORTED_LANGS = ["en", "am"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = "app_lang";

// Helper to update <html lang="..."> for a11y/screen readers
function setHtmlLang(lang: string) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", lang);
  }
}

// Load translation JSON dynamically
async function loadLocale(lang: SupportedLang) {
  // Vite supports dynamic import with explicit file names in locales folder
  const messages = await import(`./locales/${lang}.json`);
  return messages.default ?? messages;
}

// Preload default EN synchronously to avoid FOUC
// We'll hydrate additional langs on demand
// We progressively add resource bundles at runtime
const resources: Record<string, { translation: Record<string, unknown> }> = {};

// Attempt to read persisted language
const persisted =
  (typeof window !== "undefined" &&
    (localStorage.getItem(STORAGE_KEY) as SupportedLang)) ||
  "en";

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: persisted,
    resources,
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    detection: {
      // We still prefer localStorage; order ensures storage takes priority
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: STORAGE_KEY,
    },
    returnEmptyString: false,
    react: {
      useSuspense: false,
    },
  });

// Ensure we always have EN loaded first for instant paint
loadLocale("en").then((en) => {
  i18n.addResourceBundle("en", "translation", en, true, true);
  // If current lang is not EN, load it next
  const current = (i18n.language as SupportedLang) || "en";
  setHtmlLang(current);
  if (current !== "en" && SUPPORTED_LANGS.includes(current)) {
    loadLocale(current).then((msgs) => {
      i18n.addResourceBundle(current, "translation", msgs, true, true);
      i18n.changeLanguage(current);
    });
  }
});

// Listen for language changes to persist and update <html lang>
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // ignore persistence errors (e.g., private mode)
  }
  setHtmlLang(lng);
});

// Public API to change language with dynamic load
export async function changeLanguage(lng: SupportedLang) {
  if (!SUPPORTED_LANGS.includes(lng)) return;
  if (!i18n.hasResourceBundle(lng, "translation")) {
    const msgs = await loadLocale(lng);
    i18n.addResourceBundle(lng, "translation", msgs, true, true);
  }
  await i18n.changeLanguage(lng);
}

export default i18n;
