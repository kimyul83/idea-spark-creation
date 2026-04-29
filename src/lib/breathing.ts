import {
  Anchor, Bed, Flame, Heart, Moon, Square, Waves, Wind, Zap,
  type LucideIcon,
} from "lucide-react";

export type BreathingPhase = "inhale" | "hold1" | "exhale" | "hold2";

export type BreathingCategory = "calm" | "emergency" | "energize" | "sleep";

/**
 * `cycle`-style patterns (Wim Hof, Kapalabhati, Bhastrika) are rendered with
 * a faster repeating inhale↔exhale rhythm. Their `phases` describe ONE micro
 * cycle and the runner repeats it `cycleReps` times before moving on.
 */
export type BreathingStyle = "phase" | "cycle";

export interface BreathingPattern {
  /** Stable string id used in URLs / DB. */
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: BreathingCategory;
  icon: LucideIcon;
  /** Phases in seconds. */
  phases: { phase: BreathingPhase; seconds: number }[];
  premium: boolean;
  style?: BreathingStyle;
  /** For `cycle` style: how many micro-cycles count as one rep. */
  cycleReps?: number;
  /** Short origin / credit blurb. */
  origin?: string;
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  // ── Calm ─────────────────────────────────────────────
  {
    id: "4-7-8",
    title: "4-7-8 호흡",
    subtitle: "들숨 4 · 참기 7 · 날숨 8",
    description: "수면·불안 완화 (숙련자용)",
    category: "calm",
    icon: Moon,
    phases: [
      { phase: "inhale", seconds: 4 },
      { phase: "hold1", seconds: 7 },
      { phase: "exhale", seconds: 8 },
    ],
    premium: false,
    origin: "웨일 박사 · 숙련자 기준",
  },
  {
    id: "4-7-8-easy",
    title: "4-4-6 호흡 (초보)",
    subtitle: "들숨 4 · 참기 4 · 날숨 6",
    description: "수면·불안 완화 (부담 없이)",
    category: "calm",
    icon: Moon,
    phases: [
      { phase: "inhale", seconds: 4 },
      { phase: "hold1", seconds: 4 },
      { phase: "exhale", seconds: 6 },
    ],
    premium: false,
    origin: "4-7-8 초보자 버전",
  },
  {
    id: "box",
    title: "박스 호흡",
    subtitle: "4-4-4-4",
    description: "집중·안정",
    category: "calm",
    icon: Square,
    phases: [
      { phase: "inhale", seconds: 4 },
      { phase: "hold1", seconds: 4 },
      { phase: "exhale", seconds: 4 },
      { phase: "hold2", seconds: 4 },
    ],
    premium: false,
    origin: "Navy SEALs",
  },
  {
    id: "5-5",
    title: "5-5 코히어런트",
    subtitle: "들숨 5 · 날숨 5",
    description: "심박변이도 개선",
    category: "calm",
    icon: Heart,
    phases: [
      { phase: "inhale", seconds: 5 },
      { phase: "exhale", seconds: 5 },
    ],
    premium: false,
    origin: "분당 6회 최적 리듬",
  },
  {
    id: "6-6",
    title: "6-6 깊은 호흡",
    subtitle: "들숨 6 · 날숨 6",
    description: "이완·명상",
    category: "calm",
    icon: Waves,
    phases: [
      { phase: "inhale", seconds: 6 },
      { phase: "exhale", seconds: 6 },
    ],
    premium: true,
    origin: "부교감신경 활성화",
  },

  // ── Emergency ────────────────────────────────────────
  {
    id: "8-2-8",
    title: "6-2-6 진정 호흡",
    subtitle: "들숨 6 · 참기 2 · 날숨 6",
    description: "공황·과각성 (현실적)",
    category: "emergency",
    icon: Wind,
    phases: [
      { phase: "inhale", seconds: 6 },
      { phase: "hold1", seconds: 2 },
      { phase: "exhale", seconds: 6 },
    ],
    premium: false,
    origin: "급성 스트레스 대응 · 초보자 친화",
  },
  {
    id: "3-3-3",
    title: "3-3-3 그라운딩",
    subtitle: "들숨 3 · 참기 3 · 날숨 3",
    description: "즉각 안정",
    category: "emergency",
    icon: Anchor,
    phases: [
      { phase: "inhale", seconds: 3 },
      { phase: "hold1", seconds: 3 },
      { phase: "exhale", seconds: 3 },
    ],
    premium: true,
    origin: "과호흡 대응",
  },

  // ── Energize ─────────────────────────────────────────
  {
    id: "wim-hof",
    title: "Wim Hof",
    subtitle: "빠른 호흡 30회 · 참기 · 회복",
    description: "면역력·에너지",
    category: "energize",
    icon: Zap,
    style: "cycle",
    cycleReps: 30,
    phases: [
      { phase: "inhale", seconds: 1.5 },
      { phase: "exhale", seconds: 1.5 },
    ],
    premium: true,
    origin: "Wim Hof Method",
  },
  {
    id: "kapalabhati",
    title: "카팔라바티",
    subtitle: "강한 날숨 30회",
    description: "각성·집중력",
    category: "energize",
    icon: Flame,
    style: "cycle",
    cycleReps: 30,
    phases: [
      { phase: "inhale", seconds: 0.8 },
      { phase: "exhale", seconds: 0.6 },
    ],
    premium: true,
    origin: "요가 프라나야마",
  },
  {
    id: "bhastrika",
    title: "바스트리카",
    subtitle: "강한 들숨·날숨 20회",
    description: "에너지 폭발",
    category: "energize",
    icon: Flame,
    style: "cycle",
    cycleReps: 20,
    phases: [
      { phase: "inhale", seconds: 1 },
      { phase: "exhale", seconds: 1 },
    ],
    premium: true,
    origin: "요가 풀무 호흡",
  },

  // ── Sleep ────────────────────────────────────────────
  {
    id: "4-8",
    title: "4-8 수면 호흡",
    subtitle: "들숨 4 · 날숨 8",
    description: "깊은 이완",
    category: "sleep",
    icon: Bed,
    phases: [
      { phase: "inhale", seconds: 4 },
      { phase: "exhale", seconds: 8 },
    ],
    premium: false,
    origin: "초보자 친화적",
  },
];

export const PHASE_LABEL: Record<BreathingPhase, string> = {
  inhale: "들이마시기",
  hold1: "참기",
  exhale: "내쉬기",
  hold2: "참기",
};

export const CATEGORY_META: Record<
  BreathingCategory,
  { label: string; tagline: string }
> = {
  calm:      { label: "진정",     tagline: "Calm Down" },
  emergency: { label: "긴급 진정", tagline: "Emergency" },
  energize:  { label: "활력",     tagline: "Energize" },
  sleep:     { label: "수면",     tagline: "Sleep" },
};

export const getPatternById = (id: string) =>
  BREATHING_PATTERNS.find((p) => p.id === id) ?? BREATHING_PATTERNS[0];

/** Map an emotion (Korean name) to a recommended breathing pattern id. */
export const emotionToBreathingId = (name?: string | null): string => {
  if (!name) return "box";
  if (name === "분노" || name === "에너지 충전") return "4-7-8";
  if (name === "공황") return "8-2-8";
  return "box";
};

// ────── Visual styles ────────────────────────────────────
export type BreathingVisualId = "bubble" | "wave" | "moonrise" | "orbit" | "bloom";

export interface BreathingVisualMeta {
  id: BreathingVisualId;
  emoji: string;
  name: string;
  description: string;
}

export const BREATHING_VISUALS: BreathingVisualMeta[] = [
  { id: "bubble",   emoji: "🫧", name: "버블",        description: "유기적인 물방울이 부드럽게 호흡해요" },
  { id: "wave",     emoji: "🌊", name: "웨이브",      description: "잔잔한 파도가 차오르고 빠져요" },
  { id: "moonrise", emoji: "🌙", name: "떠오르는 달", description: "달이 뜨고 지며 별이 깜빡여요" },
  { id: "orbit",    emoji: "⭕", name: "흐르는 광륜", description: "빛이 궤도를 돌며 명상을 도와요" },
  { id: "bloom",    emoji: "🌸", name: "피어나는 꽃", description: "꽃잎이 활짝 열리고 닫혀요" },
];

const VISUAL_PREF_KEY = "moody_breathing_visual";
export const getStoredVisual = (): BreathingVisualId => {
  if (typeof window === "undefined") return "bubble";
  const v = localStorage.getItem(VISUAL_PREF_KEY) as BreathingVisualId | null;
  return v && BREATHING_VISUALS.some((x) => x.id === v) ? v : "bubble";
};
export const setStoredVisual = (v: BreathingVisualId) => {
  try { localStorage.setItem(VISUAL_PREF_KEY, v); } catch { /* ignore */ }
};
