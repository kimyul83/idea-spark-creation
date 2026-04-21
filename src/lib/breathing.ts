import { BookOpen, Moon, Square, Wind, type LucideIcon } from "lucide-react";

export type BreathingPhase = "inhale" | "hold1" | "exhale" | "hold2";

export interface BreathingPattern {
  id: "4-7-8" | "box" | "8-2-8";
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  /** Phases in seconds. hold2=0 means no second hold. */
  phases: { phase: BreathingPhase; seconds: number }[];
  premium: boolean;
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: "4-7-8",
    title: "4-7-8 호흡",
    subtitle: "들숨 4 · 참기 7 · 날숨 8",
    description: "수면과 불안 진정에 좋아요",
    icon: Moon,
    phases: [
      { phase: "inhale", seconds: 4 },
      { phase: "hold1", seconds: 7 },
      { phase: "exhale", seconds: 8 },
    ],
    premium: false,
  },
  {
    id: "box",
    title: "박스 호흡 (4-4-4-4)",
    subtitle: "들숨·참기·날숨·참기 각 4초",
    description: "집중과 안정에 좋아요",
    icon: Square,
    phases: [
      { phase: "inhale", seconds: 4 },
      { phase: "hold1", seconds: 4 },
      { phase: "exhale", seconds: 4 },
      { phase: "hold2", seconds: 4 },
    ],
    premium: true,
  },
  {
    id: "8-2-8",
    title: "8-2-8 호흡",
    subtitle: "들숨 8 · 참기 2 · 날숨 8",
    description: "공황·과각성 진정에 좋아요",
    icon: Wind,
    phases: [
      { phase: "inhale", seconds: 8 },
      { phase: "hold1", seconds: 2 },
      { phase: "exhale", seconds: 8 },
    ],
    premium: true,
  },
];

export const PHASE_LABEL: Record<BreathingPhase, string> = {
  inhale: "들이마시기",
  hold1: "참기",
  exhale: "내쉬기",
  hold2: "참기",
};

export const getPatternById = (id: string) =>
  BREATHING_PATTERNS.find((p) => p.id === id) ?? BREATHING_PATTERNS[0];

/** Map an emotion (Korean name) to a recommended breathing pattern id. */
export const emotionToBreathingId = (name?: string | null): BreathingPattern["id"] => {
  if (!name) return "box";
  if (name === "분노" || name === "에너지 충전") return "4-7-8";
  if (name === "공황") return "8-2-8";
  return "box";
};
