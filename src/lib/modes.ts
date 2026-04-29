/**
 * 민트무디 앱의 3대 기둥 (Pillar).
 *
 * 1. 음악 — 상황에 맞는 자연 소리
 * 2. 호흡 — 감정 컨트롤
 * 3. 깨기 — 스트레스 파괴 (유리 깨기 영상)
 */

import {
  Music, Wind, Sparkles,
  Waves, Target, Moon,
  Palmtree, Mountain, BookOpen,
  type LucideIcon,
} from "lucide-react";

/**
 * 음악 탭의 "상황" 카드 — 5개로 축소.
 * 자연 소리 풀에서 variant(δ θ α β γ) 매칭 재생.
 */
export type MusicSituationId =
  | "sleep" | "relax" | "focus" | "mountain" | "tropical" | "reading";

export interface MusicSituation {
  id: MusicSituationId;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: { from: string; to: string };
  defaultMinutes: number;
  recommendedFrequency: {
    hz: number;
    label: string;
    science: string;
  };
  sounds: Array<{ category: string; name: string; volume: number }>;
  showHours?: [number, number];
  group: "core" | "mood" | "travel";
}

export const MUSIC_SITUATIONS: MusicSituation[] = [
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
    sounds: [{ category: "nature", name: "밤 풀벌레", volume: 0.5 }],
    showHours: [20, 6],
    group: "core",
  },
  {
    id: "relax",
    title: "Water Healing",
    subtitle: "물소리 힐링",
    description: "흐르는 물 · 파도 · 시냇물",
    icon: Waves,
    gradient: { from: "#5BA8C9", to: "#0077B6" },
    defaultMinutes: 30,
    recommendedFrequency: {
      hz: 432, label: "432Hz",
      science: "HRV 개선 · 부교감신경 활성",
    },
    sounds: [{ category: "nature", name: "바다 파도", volume: 0.55 }],
    group: "core",
  },
  {
    id: "focus",
    title: "Focus",
    subtitle: "몰입하기",
    description: "감마파 · 작업 집중도 향상",
    icon: Target,
    gradient: { from: "#D4A574", to: "#8B5A2B" },
    defaultMinutes: 45,
    recommendedFrequency: {
      hz: 40, label: "Gamma 40Hz",
      science: "MIT 알츠하이머 임상 · 신경 동조",
    },
    sounds: [{ category: "nature", name: "빗소리", volume: 0.5 }],
    group: "core",
  },
  {
    id: "mountain",
    title: "In Nature",
    subtitle: "자연에 머물기",
    description: "숲 · 바람 · 모닥불의 고요",
    icon: Mountain,
    gradient: { from: "#5A6B52", to: "#2D3E2A" },
    defaultMinutes: 60,
    recommendedFrequency: {
      hz: 7.83, label: "7.83Hz",
      science: "Schumann 지구 공명 · 자연 동조",
    },
    sounds: [{ category: "nature", name: "숲속", volume: 0.4 }],
    group: "core",
  },
  {
    id: "tropical",
    title: "Meadow",
    subtitle: "풀밭에 누워 힐링",
    description: "햇살 · 풀밭 · 새소리",
    icon: Palmtree,
    gradient: { from: "#7FE8F0", to: "#00A896" },
    defaultMinutes: 30,
    recommendedFrequency: {
      hz: 8, label: "Alpha 8Hz",
      science: "Beach Therapy · 스트레스 -50%",
    },
    sounds: [{ category: "nature", name: "풀밭", volume: 0.5 }],
    group: "core",
  },
  {
    id: "reading",
    title: "Reading",
    subtitle: "조용히 책읽기",
    description: "약한 빗소리·새 지저귐",
    icon: BookOpen,
    gradient: { from: "#7FA89E", to: "#4A6F5C" },
    defaultMinutes: 30,
    recommendedFrequency: {
      hz: 10, label: "Alpha 10Hz",
      science: "독서 최적 뇌파 · 카페 masking",
    },
    sounds: [{ category: "nature", name: "약한 빗소리", volume: 0.4 }],
    group: "core",
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
    subtitle: "상황에 맞는 자연 사운드",
    description: "δ θ α β γ 변주로 자연 소리를 큐레이팅",
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
