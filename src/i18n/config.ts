/**
 * i18next 설정 - 20개국 언어.
 * 브라우저 언어 자동 감지 + localStorage 저장.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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

/**
 * 초기 언어 결정 — 우선순위:
 *  1) localStorage (사용자가 명시적으로 선택한 언어)
 *  2) 브라우저 언어가 한국어면 한국어
 *  3) 시간대가 Asia/Seoul 이면 한국어 (영어 브라우저로 한국에서 접속한 경우 — Lovable 프리뷰 iframe 등)
 *  4) 브라우저 언어 (지원 목록 내에서)
 *  5) 기본 한국어 (Korean-first app)
 */
function detectInitialLang(): string {
  if (typeof window === "undefined") return "ko";
  const supported = SUPPORTED_LANGUAGES.map((l) => l.code) as string[];

  // 1) 사용자 명시 선택
  const stored = localStorage.getItem("moody_lang");
  if (stored && supported.includes(stored)) return stored;

  // 2) 브라우저 언어가 한국어
  const navLang = (navigator.language ?? "").toLowerCase();
  if (navLang.startsWith("ko")) return "ko";

  // 3) 시간대가 Asia/Seoul → 한국 사용자
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Seoul") return "ko";
  } catch {}

  // 4) 브라우저 언어 코드 매칭 (zh-TW 같은 케이스 우선 매칭)
  if (supported.includes(navLang)) return navLang;
  const base = navLang.split("-")[0];
  if (supported.includes(base)) return base;

  // 5) 디폴트: 한국어
  return "ko";
}

i18n
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
    lng: detectInitialLang(),
    // 키 누락 시 폴백: 한국어 → 영어 (한국어가 가장 완성도 높은 기준 언어)
    fallbackLng: ["ko", "en"],
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
  });

export default i18n;
