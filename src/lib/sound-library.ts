/**
 * 사운드 라이브러리 자동 분류 엔진.
 *
 * /public/sounds/ 에 업로드된 mp3 파일명을 읽고
 * 키워드 기반으로 카테고리 매핑.
 *
 * 15개 음악 상황(Core 6 + Mood 4 + Travel 5) + 효과음(glass/breath) + 수면 슬롯에 배치.
 */

export type SoundCategory =
  // 자연 소리
  | "nature-rain" | "nature-ocean" | "nature-forest" | "nature-water"
  | "nature-wind" | "nature-cave" | "nature-fire" | "nature-night"
  | "nature-beach" | "nature-mountain"
  // 앰비언트 음악
  | "music-ambient" | "music-ethereal" | "music-drone" | "music-piano"
  | "music-meditation" | "music-cosmic" | "music-dreamy"
  // 장르 음악
  | "music-jazz" | "music-lofi" | "music-bossa" | "music-japan" | "music-tropical"
  // 효과음
  | "sfx-glass" | "sfx-breath" | "sfx-ui" | "sfx-fire"
  // ASMR
  | "asmr-cafe" | "asmr-typing" | "asmr-page" | "asmr-brush"
  // 미분류
  | "reserve";

/**
 * 파일명 기반 자동 분류.
 * 우선순위: 효과음 → 자연 → 장르 음악 → 앰비언트 → reserve
 */
export const classifyFilename = (filename: string): SoundCategory => {
  const f = filename.toLowerCase();

  // ── 효과음 (우선순위 최상) ────────────────────
  if (/glass|shatter|crystal[-_]break|ice[-_]crack|tinkling|window[-_]break/.test(f)) return "sfx-glass";
  if (/breath|inhale|exhale|breathing[-_]in|breathing[-_]out/.test(f)) return "sfx-breath";
  if (/chime|bell[-_]soft|ding|tick|notification/.test(f)) return "sfx-ui";

  // ── 자연 소리 ───────────────────────────────
  if (/rain|drizzle|downpour|shower|raindrops/.test(f)) return "nature-rain";
  if (/ocean|sea[-_]wave|beach[-_]wave|shore|surf|tide/.test(f)) return "nature-ocean";
  if (/beach|tropical|palm|island/.test(f)) return "nature-beach";
  if (/forest|jungle|tree|leaves|woodland/.test(f)) return "nature-forest";
  if (/bird|chirp|songbird|dove|sparrow/.test(f)) return "nature-forest";
  if (/waterfall|stream|river|creek|brook|flow/.test(f)) return "nature-water";
  if (/cave|drip|echo[-_]cavern/.test(f)) return "nature-cave";
  if (/wind|breeze|gust|whistle/.test(f)) return "nature-wind";
  if (/fire|campfire|fireplace|bonfire|crackle|burning/.test(f)) return "sfx-fire";
  if (/cricket|frog|night[-_]ambient|nocturnal|owl/.test(f)) return "nature-night";
  if (/mountain|alpine|highland/.test(f)) return "nature-mountain";
  if (/thunder|storm|rainstorm/.test(f)) return "nature-rain";

  // ── 장르 음악 (키워드 구체적) ──────────────────
  if (/jazz|saxophone|smooth[-_]jazz|noir/.test(f)) return "music-jazz";
  if (/lofi|lo[-_]fi|chillhop|study[-_]beats|chill[-_]hop/.test(f)) return "music-lofi";
  if (/bossa|brazil|samba/.test(f)) return "music-bossa";
  if (/japan|koto|shakuhachi|tokyo|kyoto|city[-_]pop/.test(f)) return "music-japan";
  if (/ukulele|caribbean|reggae|tropical[-_]music/.test(f)) return "music-tropical";

  // ── 앰비언트 음악 ───────────────────────────
  if (/ethereal|celestial|angelic|heavenly/.test(f)) return "music-ethereal";
  if (/cosmic|space|galaxy|stellar|aurora|universe/.test(f)) return "music-cosmic";
  if (/drone|deep[-_]space|sub[-_]bass/.test(f)) return "music-drone";
  if (/meditation|mindful|zen|tibetan|singing[-_]bowl|om/.test(f)) return "music-meditation";
  if (/piano[-_]ambient|piano[-_]peaceful|piano[-_]gentle|solo[-_]piano/.test(f)) return "music-piano";
  if (/dreamy|dream|mystical|magical|fantasy/.test(f)) return "music-dreamy";
  if (/ambient|atmospheric|peaceful|calm/.test(f)) return "music-ambient";

  // ── ASMR ────────────────────────────────────
  if (/cafe|coffee[-_]shop|bistro/.test(f)) return "asmr-cafe";
  if (/typing|keyboard|typewriter/.test(f)) return "asmr-typing";
  if (/page|book[-_]turn|paper/.test(f)) return "asmr-page";
  if (/brush|bristle|sweep/.test(f)) return "asmr-brush";

  return "reserve";
};

// ─── 상황 → 최적 카테고리 조합 매핑 ─────────────────────

export interface SituationMix {
  situationId: string;
  primaryCategories: SoundCategory[]; // 핵심 레이어 (보통 음악)
  ambienceCategories: SoundCategory[]; // 자연·배경 레이어
  /** Web Audio로 합성될 주파수 Hz (파일 아님). */
  syntheticFrequency?: { type: "binaural" | "tone" | "noise"; hz: number };
}

/**
 * 15개 상황 × 최적 사운드 카테고리 매핑.
 * 파일 업로드 후 이 매핑대로 자동 재생됨.
 */
export const SITUATION_MIXES: Record<string, SituationMix> = {
  // Core 6
  relax: {
    situationId: "relax",
    primaryCategories: ["music-ambient", "music-piano", "music-dreamy"],
    ambienceCategories: ["nature-ocean", "nature-rain"],
    syntheticFrequency: { type: "tone", hz: 432 },
  },
  meditate: {
    situationId: "meditate",
    primaryCategories: ["music-meditation", "music-ethereal"],
    ambienceCategories: ["nature-forest", "nature-wind"],
    syntheticFrequency: { type: "binaural", hz: 5 },
  },
  focus: {
    situationId: "focus",
    primaryCategories: ["music-lofi", "music-ambient"],
    ambienceCategories: ["asmr-cafe", "nature-rain"],
    syntheticFrequency: { type: "binaural", hz: 40 },
  },
  nap: {
    situationId: "nap",
    primaryCategories: ["music-piano", "music-dreamy"],
    ambienceCategories: ["nature-rain"],
    syntheticFrequency: { type: "binaural", hz: 10 },
  },
  wake: {
    situationId: "wake",
    primaryCategories: ["music-ambient", "music-piano"],
    ambienceCategories: ["nature-forest", "nature-beach"],
    syntheticFrequency: { type: "binaural", hz: 15 },
  },
  sleep: {
    situationId: "sleep",
    primaryCategories: ["music-drone", "music-cosmic"],
    ambienceCategories: ["nature-ocean", "nature-night"],
    syntheticFrequency: { type: "binaural", hz: 2 },
  },

  // Mood 4
  reading: {
    situationId: "reading",
    primaryCategories: ["music-piano", "music-lofi"],
    ambienceCategories: ["asmr-cafe", "nature-rain"],
    syntheticFrequency: { type: "binaural", hz: 10 },
  },
  wine: {
    situationId: "wine",
    primaryCategories: ["music-jazz", "music-bossa"],
    ambienceCategories: ["sfx-fire"],
    syntheticFrequency: { type: "binaural", hz: 8 },
  },
  date: {
    situationId: "date",
    primaryCategories: ["music-jazz", "music-bossa"],
    ambienceCategories: ["sfx-fire"],
    syntheticFrequency: { type: "tone", hz: 528 },
  },
  candle: {
    situationId: "candle",
    primaryCategories: ["music-ambient", "music-dreamy"],
    ambienceCategories: ["sfx-fire"],
    syntheticFrequency: { type: "binaural", hz: 6 },
  },

  // Travel 5 🌴
  tropical: {
    situationId: "tropical",
    primaryCategories: ["music-tropical", "music-bossa"],
    ambienceCategories: ["nature-beach", "nature-ocean"],
    syntheticFrequency: { type: "binaural", hz: 8 },
  },
  resort: {
    situationId: "resort",
    primaryCategories: ["music-bossa", "music-tropical"],
    ambienceCategories: ["nature-beach"],
    syntheticFrequency: { type: "binaural", hz: 10 },
  },
  sunset: {
    situationId: "sunset",
    primaryCategories: ["music-jazz"],
    ambienceCategories: ["nature-ocean"],
    syntheticFrequency: { type: "tone", hz: 528 },
  },
  mountain: {
    situationId: "mountain",
    primaryCategories: ["music-ambient", "music-piano"],
    ambienceCategories: ["nature-forest", "sfx-fire", "nature-mountain"],
    syntheticFrequency: { type: "tone", hz: 7.83 },
  },
  tokyo: {
    situationId: "tokyo",
    primaryCategories: ["music-japan", "music-lofi"],
    ambienceCategories: ["nature-rain"],
    syntheticFrequency: { type: "binaural", hz: 10 },
  },
};

// ─── 수면 슬롯 7개 매핑 ─────────────────────────────

export const SLEEP_SLOTS: Array<{
  id: string;
  title: string;
  subtitle: string;
  categories: SoundCategory[];
  freq?: { type: "binaural" | "tone"; hz: number };
}> = [
  {
    id: "deep-waves",
    title: "깊은 파도",
    subtitle: "40Hz 델타파 + 바다",
    categories: ["nature-ocean", "music-drone"],
    freq: { type: "binaural", hz: 2 },
  },
  {
    id: "calm-rain",
    title: "잔잔한 빗소리",
    subtitle: "비 + 432Hz",
    categories: ["nature-rain", "music-ambient"],
    freq: { type: "tone", hz: 432 },
  },
  {
    id: "forest-night",
    title: "숲의 밤",
    subtitle: "풀벌레 + 새벽 공기",
    categories: ["nature-night", "nature-forest"],
  },
  {
    id: "sleep-asmr",
    title: "수면 ASMR",
    subtitle: "로파이 + 화이트노이즈",
    categories: ["music-lofi", "asmr-cafe"],
  },
  {
    id: "delta-meditation",
    title: "델타파 명상",
    subtitle: "0.5~4Hz 바이노럴",
    categories: ["music-meditation", "music-drone"],
    freq: { type: "binaural", hz: 2.5 },
  },
  {
    id: "lullaby",
    title: "자장가",
    subtitle: "부드러운 피아노 + 528Hz",
    categories: ["music-piano", "music-dreamy"],
    freq: { type: "tone", hz: 528 },
  },
  {
    id: "cosmic-ambient",
    title: "우주 앰비언트",
    subtitle: "딥 드론 사운드",
    categories: ["music-cosmic", "music-drone"],
  },
];

// ─── 효과음 슬롯 ─────────────────────────────────────

export const GLASS_BREAK_SFX: SoundCategory[] = ["sfx-glass"];
export const BREATH_SFX: SoundCategory[] = ["sfx-breath"];
export const UI_SFX: SoundCategory[] = ["sfx-ui"];

// ─── 런타임에 /public/sounds/ 리스트를 받아서 각 카테고리로 배치 ─

export interface SoundFile {
  filename: string;
  url: string; // /sounds/{filename}
  category: SoundCategory;
}

/**
 * 업로드된 파일 배열을 카테고리로 분류.
 * 각 SoundFile은 여러 카테고리에 매핑된 상황에서 재사용 가능.
 */
export const buildLibrary = (filenames: string[]): Map<SoundCategory, SoundFile[]> => {
  const lib = new Map<SoundCategory, SoundFile[]>();
  for (const filename of filenames) {
    const category = classifyFilename(filename);
    const file: SoundFile = {
      filename,
      url: `/sounds/${filename}`,
      category,
    };
    if (!lib.has(category)) lib.set(category, []);
    lib.get(category)!.push(file);
  }
  return lib;
};

/**
 * 특정 상황에 맞는 트랙들 추출.
 * primary 1개 + ambience 1~2개 랜덤 선택.
 */
export const pickTracksForSituation = (
  lib: Map<SoundCategory, SoundFile[]>,
  situationId: string
): { primary: SoundFile | null; ambience: SoundFile[] } => {
  const mix = SITUATION_MIXES[situationId];
  if (!mix) return { primary: null, ambience: [] };

  const pickFromCategories = (cats: SoundCategory[]): SoundFile | null => {
    for (const cat of cats) {
      const files = lib.get(cat);
      if (files && files.length > 0) {
        return files[Math.floor(Math.random() * files.length)];
      }
    }
    return null;
  };

  const primary = pickFromCategories(mix.primaryCategories);
  const ambience: SoundFile[] = [];
  for (const cat of mix.ambienceCategories) {
    const files = lib.get(cat);
    if (files && files.length > 0) {
      ambience.push(files[Math.floor(Math.random() * files.length)]);
    }
  }

  return { primary, ambience };
};

/**
 * 랜덤 유리 깨짐 효과음 선택.
 * 탭할 때마다 다른 소리 재생.
 */
export const pickRandomGlassSfx = (lib: Map<SoundCategory, SoundFile[]>): SoundFile | null => {
  const files = lib.get("sfx-glass");
  if (!files || files.length === 0) return null;
  return files[Math.floor(Math.random() * files.length)];
};
