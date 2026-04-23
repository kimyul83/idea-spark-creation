/**
 * 한국어 음성 가이드 (Web Speech API).
 *
 * 브라우저 내장 TTS를 사용해서 호흡 단계마다
 * "숨을 들이마시세요", "참으세요", "내쉬세요" 안내.
 *
 * - 외부 API 불필요, 완전 오프라인 작동
 * - iOS/Android/데스크톱 모두 지원
 * - 사용자가 음소거 토글 가능 (localStorage에 저장)
 */

const MUTE_KEY = "yunseul_tts_muted";

/**
 * 기본값: 음성 OFF (자막으로만 안내).
 * 사용자가 필요하면 설정에서 켤 수 있음.
 */
export const isTtsMuted = (): boolean => {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(MUTE_KEY);
  // 저장된 값 없으면 기본 뮤트 (조용함 선호)
  if (stored === null) return true;
  return stored === "1";
};

export const setTtsMuted = (muted: boolean): void => {
  if (typeof window === "undefined") return;
  if (muted) localStorage.setItem(MUTE_KEY, "1");
  else localStorage.removeItem(MUTE_KEY);
};

let cachedKoreanVoice: SpeechSynthesisVoice | null = null;

const pickKoreanVoice = (): SpeechSynthesisVoice | null => {
  if (cachedKoreanVoice) return cachedKoreanVoice;
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  // 한국어 여성 목소리 우선 (일반적으로 더 부드러움)
  const female = voices.find(
    (v) => v.lang.startsWith("ko") && /female|여성|yuna|sun-hi/i.test(v.name)
  );
  if (female) { cachedKoreanVoice = female; return female; }
  const anyKo = voices.find((v) => v.lang.startsWith("ko"));
  if (anyKo) { cachedKoreanVoice = anyKo; return anyKo; }
  return null;
};

/**
 * 한국어 음성으로 말하기.
 * 뮤트 상태면 즉시 리턴. 이전 utterance는 취소됨.
 */
export const speak = (text: string, opts?: { rate?: number; volume?: number }): void => {
  if (typeof window === "undefined") return;
  if (isTtsMuted()) return;
  if (!("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  // 진행 중인 음성 취소 (중복 방지)
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = opts?.rate ?? 0.92;     // 살짝 느리게 (차분하게)
  utter.volume = opts?.volume ?? 0.85;
  utter.pitch = 1.05;                   // 살짝 높게 (부드러움)

  const voice = pickKoreanVoice();
  if (voice) utter.voice = voice;

  synth.speak(utter);
};

/** 모든 음성 즉시 중단. */
export const stopSpeaking = (): void => {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
};

/**
 * 음성 목록 미리 로드 (iOS는 첫 번째 speak 호출 전까지 빈 배열 리턴하는 경우 있음).
 * 앱 시작 시 한 번 호출하면 이후 pickKoreanVoice가 정상 작동.
 */
export const primeTts = (): void => {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  // voiceschanged 이벤트 리스너 등록 (일부 브라우저는 비동기)
  const load = () => {
    cachedKoreanVoice = null; // 재선택
    pickKoreanVoice();
  };
  window.speechSynthesis.onvoiceschanged = load;
  load();
};

// ─── 호흡 단계별 표준 문구 ─────────────────────────────
export const BREATH_PHRASES = {
  inhale: "숨을 들이마시세요",
  hold1: "잠시 멈추세요",
  exhale: "천천히 내쉬세요",
  hold2: "쉬어요",
} as const;

// 짧은 cycle 호흡 (Wim Hof, 카팔라바티 등) 용 짧은 문구
export const BREATH_PHRASES_SHORT = {
  inhale: "들이",
  hold1: "참고",
  exhale: "내쉬고",
  hold2: "멈춰",
} as const;
