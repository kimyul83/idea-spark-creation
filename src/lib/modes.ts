/**
 * 윤슬 앱의 3대 기둥 (Pillar).
 *
 * 1. 음악 — 상황에 맞는 주파수 + 심리 진정 음악
 * 2. 호흡 — 감정 컨트롤
 * 3. 깨기 — 스트레스 파괴 (유리 깨기 영상)
 *
 * 홈 화면은 이 3개의 큰 카드만 보여주고,
 * 각 카드 탭 시 해당 하위 페이지로 이동.
 */

import {
  Music, Wind, Sparkles,
  Waves, Brain, Target, Coffee, Sun, Moon,
  BookOpen, Wine, Heart, Flame,
  Palmtree, Mountain, Plane, Sunset,
  type LucideIcon,
} from "lucide-react";

/**
 * 음악 탭 안의 "상황" 카드들.
 * 각 상황마다 추천 주파수 + 자연 소리 + 앰비언트 음악 조합.
 * 과학적 근거 기반 매핑.
 */
export type MusicSituationId =
  | "relax" | "meditate" | "focus"
  | "nap" | "wake" | "sleep"
  | "reading" | "wine" | "date" | "candle"
  | "tropical" | "resort" | "sunset" | "mountain" | "tokyo";

export interface MusicSituation {
  id: MusicSituationId;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: { from: string; to: string };
  defaultMinutes: number;
  /** 상황에 맞는 주파수 추천 (Hz). 과학 근거 기반. */
  recommendedFrequency: {
    hz: number;
    label: string;
    science: string;
  };
  /** 레이어드 사운드 (3개 레이어 믹싱). */
  sounds: Array<{ category: string; name: string; volume: number }>;
  /** 시간대 기반 자동 하이라이트. */
  showHours?: [number, number];
  group: "core" | "mood" | "travel";
}

export const MUSIC_SITUATIONS: MusicSituation[] = [
  // ── Core 6개 ────────────────────────────────────────
  {
    id: "relax",
    title: "Relax",
    subtitle: "이완·스트레스 해소",
    description: "긴장을 풀고 심장박동을 늦춰요",
    icon: Waves,
    gradient: { from: "#5BA8C9", to: "#0077B6" },
    defaultMinutes: 15,
    recommendedFrequency: {
      hz: 432, label: "432Hz",
      science: "심박변이도(HRV) 개선 · 부교감신경 활성",
    },
    sounds: [
      { category: "nature", name: "바다 파도", volume: 0.55 },
      { category: "frequency", name: "432Hz", volume: 0.18 },
    ],
    group: "core",
  },
  {
    id: "meditate",
    title: "Meditate",
    subtitle: "명상·마음챙김",
    description: "Theta파로 깊은 명상 상태",
    icon: Brain,
    gradient: { from: "#9D4EFF", to: "#5A2A8A" },
    defaultMinutes: 10,
    recommendedFrequency: {
      hz: 5, label: "Theta 5Hz",
      science: "명상·창의력 뇌파 (EEG 연구 검증)",
    },
    sounds: [
      { category: "nature", name: "숲속", volume: 0.4 },
      { category: "frequency", name: "528Hz", volume: 0.15 },
    ],
    group: "core",
  },
  {
    id: "focus",
    title: "Focus",
    subtitle: "집중·몰입",
    description: "감마파로 뇌 각성도를 높여요",
    icon: Target,
    gradient: { from: "#D4A574", to: "#8B5A2B" },
    defaultMinutes: 45,
    recommendedFrequency: {
      hz: 40, label: "Gamma 40Hz",
      science: "MIT 알츠하이머 임상시험 · 집중력·기억력",
    },
    sounds: [
      { category: "frequency", name: "40Hz 감마파", volume: 0.12 },
      { category: "frequency", name: "브라운 노이즈", volume: 0.3 },
    ],
    group: "core",
  },
  {
    id: "nap",
    title: "Power Nap",
    subtitle: "짧은 낮잠 15~20분",
    description: "과학적 수면 낮잠으로 리프레시",
    icon: Coffee,
    gradient: { from: "#E8C4B0", to: "#A8826E" },
    defaultMinutes: 20,
    recommendedFrequency: {
      hz: 10, label: "Alpha 10Hz",
      science: "이완·얕은 수면 유도",
    },
    sounds: [
      { category: "nature", name: "빗소리", volume: 0.45 },
      { category: "frequency", name: "432Hz", volume: 0.12 },
    ],
    group: "core",
  },
  {
    id: "wake",
    title: "Wake Up",
    subtitle: "상쾌한 기상",
    description: "부드럽게 각성도를 높여요",
    icon: Sun,
    gradient: { from: "#FFE89E", to: "#D4A574" },
    defaultMinutes: 10,
    recommendedFrequency: {
      hz: 15, label: "Beta 15Hz",
      science: "각성·활력 상태 유도",
    },
    sounds: [
      { category: "nature", name: "새소리", volume: 0.5 },
      { category: "nature", name: "따뜻한 햇살", volume: 0.3 },
    ],
    showHours: [5, 11],
    group: "core",
  },
  {
    id: "sleep",
    title: "Sleep",
    subtitle: "깊은 수면",
    description: "델타파로 깊은 잠에 빠져요",
    icon: Moon,
    gradient: { from: "#1B3A5C", to: "#0A1525" },
    defaultMinutes: 60,
    recommendedFrequency: {
      hz: 2, label: "Delta 2Hz",
      science: "Northwestern 임상 · 수면 질 향상",
    },
    sounds: [
      { category: "nature", name: "바다 파도", volume: 0.5 },
      { category: "frequency", name: "브라운 노이즈", volume: 0.25 },
    ],
    showHours: [20, 6],
    group: "core",
  },

  // ── Mood 라이프스타일 ────────────────────────────────
  {
    id: "reading",
    title: "Reading",
    subtitle: "독서의 시간",
    description: "책장 넘기는 카페처럼",
    icon: BookOpen,
    gradient: { from: "#7FA89E", to: "#4A6F5C" },
    defaultMinutes: 30,
    recommendedFrequency: {
      hz: 10, label: "Alpha 10Hz",
      science: "차분한 집중 상태",
    },
    sounds: [
      { category: "asmr", name: "카페 분위기", volume: 0.4 },
      { category: "nature", name: "빗소리", volume: 0.3 },
    ],
    group: "mood",
  },
  {
    id: "wine",
    title: "Wine",
    subtitle: "와인과 함께",
    description: "은은한 재즈로 저녁을 물들여요",
    icon: Wine,
    gradient: { from: "#8B2635", to: "#3D1218" },
    defaultMinutes: 45,
    recommendedFrequency: {
      hz: 8, label: "Alpha 8Hz",
      science: "릴렉스 상태",
    },
    sounds: [],
    showHours: [18, 24],
    group: "mood",
  },
  {
    id: "date",
    title: "Date Night",
    subtitle: "둘만의 시간",
    description: "로맨틱한 분위기를 만들어요",
    icon: Heart,
    gradient: { from: "#E8C4B0", to: "#C49EBE" },
    defaultMinutes: 60,
    recommendedFrequency: {
      hz: 528, label: "528Hz",
      science: "사랑 주파수 · 옥시토신 분비 유도",
    },
    sounds: [],
    showHours: [18, 24],
    group: "mood",
  },
  {
    id: "candle",
    title: "Candle Light",
    subtitle: "캔들 라이트",
    description: "불빛처럼 흔들리는 앰비언트",
    icon: Flame,
    gradient: { from: "#D4A574", to: "#5A2A1F" },
    defaultMinutes: 30,
    recommendedFrequency: {
      hz: 6, label: "Theta 6Hz",
      science: "깊은 이완",
    },
    sounds: [],
    showHours: [18, 24],
    group: "mood",
  },

  // ── Travel 5개 (휴양지·여행 바이브) 🌴 ───────────────
  {
    id: "tropical",
    title: "Tropical",
    subtitle: "트로피컬 해변",
    description: "야자수 그늘과 파도 속 휴양지",
    icon: Palmtree,
    gradient: { from: "#7FE8F0", to: "#00A896" },
    defaultMinutes: 30,
    recommendedFrequency: {
      hz: 8, label: "Alpha 8Hz",
      science: "릴렉스·바캉스 바이브",
    },
    sounds: [{ category: "nature", name: "바다 파도", volume: 0.55 }],
    group: "travel",
  },
  {
    id: "resort",
    title: "Resort Pool",
    subtitle: "리조트 수영장",
    description: "칵테일과 풀사이드 라운지",
    icon: Waves,
    gradient: { from: "#FFE89E", to: "#FF8C42" },
    defaultMinutes: 45,
    recommendedFrequency: {
      hz: 10, label: "Alpha 10Hz",
      science: "가벼운 이완",
    },
    sounds: [],
    group: "travel",
  },
  {
    id: "sunset",
    title: "Sunset Bar",
    subtitle: "노을 지는 바닷가 바",
    description: "해 질 녘의 여유, 선셋 라운지",
    icon: Sunset,
    gradient: { from: "#FF6B6B", to: "#8B4513" },
    defaultMinutes: 60,
    recommendedFrequency: {
      hz: 528, label: "528Hz",
      science: "로맨틱·따뜻함",
    },
    sounds: [],
    showHours: [17, 21],
    group: "travel",
  },
  {
    id: "mountain",
    title: "Mountain Cabin",
    subtitle: "산장의 밤",
    description: "벽난로·침엽수 숲의 고요",
    icon: Mountain,
    gradient: { from: "#5A6B52", to: "#2D3E2A" },
    defaultMinutes: 60,
    recommendedFrequency: {
      hz: 7.83, label: "7.83Hz",
      science: "Schumann 지구 주파수",
    },
    sounds: [{ category: "nature", name: "숲속", volume: 0.4 }],
    group: "travel",
  },
  {
    id: "tokyo",
    title: "Tokyo Night",
    subtitle: "도쿄의 밤",
    description: "네온 사인과 시티팝 라운지",
    icon: Plane,
    gradient: { from: "#E83E8C", to: "#2D1B4E" },
    defaultMinutes: 45,
    recommendedFrequency: {
      hz: 10, label: "Alpha 10Hz",
      science: "설렘·여행 감성",
    },
    sounds: [],
    showHours: [18, 26],
    group: "travel",
  },
];

export const getSituationById = (id: string): MusicSituation | undefined =>
  MUSIC_SITUATIONS.find((m) => m.id === id);

/**
 * 3대 기둥 (홈 화면 메인 카드).
 */
export interface Pillar {
  id: "music" | "breathing" | "release";
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: { from: string; to: string };
  route: string;
}

export const PILLARS: Pillar[] = [
  {
    id: "music",
    title: "Music",
    subtitle: "상황에 맞는 심리 음악",
    description: "주파수 + 자연 소리 + 앰비언트로 마음을 다독여요",
    icon: Music,
    gradient: { from: "#00D9E8", to: "#0077B6" },
    route: "/music",
  },
  {
    id: "breathing",
    title: "Breath",
    subtitle: "호흡으로 감정 컨트롤",
    description: "4-7-8, 박스, 코히어런트 호흡법으로 안정을",
    icon: Wind,
    gradient: { from: "#9D4EFF", to: "#5A2A8A" },
    route: "/breathing",
  },
  {
    id: "release",
    title: "Release",
    subtitle: "유리 깨기 스트레스 해소",
    description: "터치해서 깨부수는 시각적 카타르시스",
    icon: Sparkles,
    gradient: { from: "#FF4D88", to: "#8B1A3F" },
    route: "/release/glass",
  },
];
