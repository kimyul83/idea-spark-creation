/**
 * i18next 설정 - 20개국 언어.
 * 브라우저 언어 자동 감지 + localStorage 저장.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ko from "./locales/ko.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";
import zhTW from "./locales/zh-TW.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import it from "./locales/it.json";
import ru from "./locales/ru.json";
import ar from "./locales/ar.json";
import hi from "./locales/hi.json";
import id from "./locales/id.json";
import vi from "./locales/vi.json";
import th from "./locales/th.json";
import tr from "./locales/tr.json";
import pl from "./locales/pl.json";
import nl from "./locales/nl.json";
import sv from "./locales/sv.json";

export const SUPPORTED_LANGUAGES = [
  { code: "ko",    name: "한국어",        flag: "🇰🇷" },
  { code: "en",    name: "English",       flag: "🇺🇸" },
  { code: "ja",    name: "日本語",        flag: "🇯🇵" },
  { code: "zh",    name: "中文 (简体)",   flag: "🇨🇳" },
  { code: "zh-TW", name: "中文 (繁體)",   flag: "🇹🇼" },
  { code: "es",    name: "Español",       flag: "🇪🇸" },
  { code: "fr",    name: "Français",      flag: "🇫🇷" },
  { code: "de",    name: "Deutsch",       flag: "🇩🇪" },
  { code: "pt",    name: "Português",     flag: "🇧🇷" },
  { code: "it",    name: "Italiano",      flag: "🇮🇹" },
  { code: "ru",    name: "Русский",       flag: "🇷🇺" },
  { code: "ar",    name: "العربية",       flag: "🇸🇦" },
  { code: "hi",    name: "हिन्दी",         flag: "🇮🇳" },
  { code: "id",    name: "Indonesia",     flag: "🇮🇩" },
  { code: "vi",    name: "Tiếng Việt",    flag: "🇻🇳" },
  { code: "th",    name: "ไทย",           flag: "🇹🇭" },
  { code: "tr",    name: "Türkçe",        flag: "🇹🇷" },
  { code: "pl",    name: "Polski",        flag: "🇵🇱" },
  { code: "nl",    name: "Nederlands",    flag: "🇳🇱" },
  { code: "sv",    name: "Svenska",       flag: "🇸🇪" },
] as const;

export type LangCode = typeof SUPPORTED_LANGUAGES[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko }, en: { translation: en }, ja: { translation: ja },
      zh: { translation: zh }, "zh-TW": { translation: zhTW }, es: { translation: es },
      fr: { translation: fr }, de: { translation: de }, pt: { translation: pt },
      it: { translation: it }, ru: { translation: ru }, ar: { translation: ar },
      hi: { translation: hi }, id: { translation: id }, vi: { translation: vi },
      th: { translation: th }, tr: { translation: tr }, pl: { translation: pl },
      nl: { translation: nl }, sv: { translation: sv },
    },
    // 비한국어 사용자에겐 영어로 폴백 (한국어는 한국어 그대로).
    // 다른 언어 파일에 누락된 키는 영어로 표시 (UI 영어 = 무난한 디폴트).
    fallbackLng: { default: ["en"], ko: ["ko"] },
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "moody_lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
