/**
 * Glass-break video library.
 * Videos are referenced by path under /public/videos/glass/{category}/{id}.mp4
 * but are NOT yet shipped — the player gracefully falls back to a generated
 * gradient + crack overlay when the file is missing ("곧 출시" badge).
 */
import { Scissors, Hammer, Sparkles, type LucideIcon } from "lucide-react";
import type { GlassCategory } from "./sfx";

export type GlassClip = {
  id: string;
  category: GlassCategory;
  /** Korean display title */
  title: string;
  /** Short hint shown on card */
  hint: string;
  /** Hue used for placeholder gradient + ambient lighting (0–360) */
  hue: number;
  /** Optional badge */
  badge?: "NEW" | "HOT";
  /** Premium gating */
  premium?: boolean;
  /** Source video path (may not exist yet — player handles 404) */
  videoSrc: string;
};

export const GLASS_CATEGORIES: Array<{
  id: GlassCategory;
  label: string;
  Icon: LucideIcon;
  tagline: string;
}> = [
  { id: "slice", label: "슬라이싱", Icon: Scissors, tagline: "자르기·슬라이싱 쾌감" },
  { id: "smash", label: "파괴",     Icon: Hammer,   tagline: "분노 해소·폭발" },
  { id: "asmr",  label: "ASMR",     Icon: Sparkles, tagline: "터치 쾌감·ASMR" },
];

export const GLASS_CLIPS: GlassClip[] = [
  // ── 1. 크리스탈 과일 슬라이싱 ──
  { id: "slice_apple",      category: "slice", title: "크리스탈 사과", hint: "사각, 산뜻하게",       hue: 350, badge: "NEW", videoSrc: "/videos/glass/slice/crystal_apple.mp4" },
  { id: "slice_orange",     category: "slice", title: "유리 오렌지",    hint: "주황빛 결정",          hue: 28,                videoSrc: "/videos/glass/slice/glass_orange.mp4" },
  { id: "slice_watermelon", category: "slice", title: "황금 수박",      hint: "묵직한 절단",          hue: 50,  badge: "HOT", premium: true, videoSrc: "/videos/glass/slice/golden_watermelon.mp4" },
  { id: "slice_grapes",     category: "slice", title: "얼음 포도",      hint: "투명한 알알",          hue: 280, premium: true,        videoSrc: "/videos/glass/slice/ice_grapes.mp4" },

  // ── 2. 보석 낙하 파괴 ──
  { id: "smash_diamond",  category: "smash", title: "다이아몬드 계단", hint: "쏟아지는 빛의 계단",   hue: 200, badge: "HOT", videoSrc: "/videos/glass/smash/diamond_stairs.mp4" },
  { id: "smash_ruby",     category: "smash", title: "루비 폭포",      hint: "붉은 결정의 낙하",     hue: 350, premium: true, videoSrc: "/videos/glass/smash/ruby_falls.mp4" },
  { id: "smash_sapphire", category: "smash", title: "사파이어 구슬",  hint: "푸른 충돌",            hue: 220,                videoSrc: "/videos/glass/smash/sapphire_marbles.mp4" },
  { id: "smash_emerald",  category: "smash", title: "에메랄드 꽃병",  hint: "산산조각의 카타르시스", hue: 150, premium: true, videoSrc: "/videos/glass/smash/emerald_vase.mp4" },

  // ── 3. 인터랙티브 ASMR ──
  { id: "asmr_bubbles", category: "asmr", title: "유리 거품",     hint: "또르륵 터지는 소리",   hue: 186, badge: "NEW", videoSrc: "/videos/glass/asmr/glass_bubbles.mp4" },
  { id: "asmr_ice",     category: "asmr", title: "얼음 벽",       hint: "차가운 표면 두드림",   hue: 210,                videoSrc: "/videos/glass/asmr/ice_wall.mp4" },
  { id: "asmr_gold",    category: "asmr", title: "황금 방울",     hint: "묵직한 광택의 톡",     hue: 45,  premium: true, videoSrc: "/videos/glass/asmr/golden_drops.mp4" },
  { id: "asmr_garden",  category: "asmr", title: "크리스탈 정원", hint: "맑은 풀잎의 흔들림",   hue: 165, premium: true, videoSrc: "/videos/glass/asmr/crystal_garden.mp4" },
];

export const findClip = (id: string) => GLASS_CLIPS.find((c) => c.id === id);
