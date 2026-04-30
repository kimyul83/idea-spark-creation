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
 * 초기 언어 결정.
 * 우선순위:
 *  0) 한국 타임존 + 사용자 명시 선택 마커 없음 → 무조건 한국어 (이전 자동감지 캐시 무시)
 *  1) localStorage 명시 선택 (moody_lang_explicit=1 플래그 있을 때만 신뢰)
 *  2) localStorage moody_lang (명시 마커 없어도)
 *  3) 브라우저 언어가 한국어면 한국어
 *  4) 시간대가 Asia/Seoul 이면 한국어
 *  5) 브라우저 언어 매칭
 *  6) 디폴트: 한국어 (Korean-first app)
 */
function detectInitialLang(): string {
  if (typeof window === "undefined") return "ko";
  const supported = SUPPORTED_LANGUAGES.map((l) => l.code) as string[];

  let tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch {}
  const isKorea = tz === "Asia/Seoul";

  const stored = localStorage.getItem("moody_lang");
  const explicitV2 = localStorage.getItem("moody_lang_explicit") === "1";

  // 0) 한국 타임존 + 명시 선택 안 한 사용자 → 무조건 ko (이전 LanguageDetector 가 박아둔 영어 캐시 무시)
  if (isKorea && !explicitV2) {
    localStorage.setItem("moody_lang", "ko");
    return "ko";
  }

  // 1, 2) localStorage 값 사용
  if (stored && supported.includes(stored)) return stored;

  // 3) 브라우저 한국어
  const navLang = (navigator.language ?? "").toLowerCase();
  if (navLang.startsWith("ko")) return "ko";

  // 4) 한국 타임존 (위에서 이미 처리됐지만 isKorea 가 false 일 때 한 번 더)
  if (isKorea) return "ko";

  // 5) 브라우저 언어 매칭
  if (supported.includes(navLang)) return navLang;
  const base = navLang.split("-")[0];
  if (supported.includes(base)) return base;

  // 6) 디폴트: 한국어
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
