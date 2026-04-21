export type EmotionRow = {
  id: string;
  name: string;
  category: "calm" | "boost";
  emoji: string | null;
  icon_name: string | null;
  gradient_from: string;
  gradient_to: string;
  recommended_breathing: "4-7-8" | "4-4-4-4" | "8-2-8" | null;
  recommended_video_url: string | null;
  recommended_sound_ids: string[] | null;
  sort_order: number | null;
};

export type SoundRow = {
  id: string;
  name: string;
  category: "nature" | "frequency" | "asmr";
  source_type: "web_audio" | "url";
  audio_url: string | null;
  frequency_hz: number | null;
  is_premium: boolean;
  icon_name: string | null;
};

export type FocusMode = {
  id: "adhd" | "work" | "study" | "deepwork" | "meeting";
  title: string;
  durationMin: number;
  recommend: string;
  icon: string;
};

export const FOCUS_MODES: FocusMode[] = [
  { id: "adhd", title: "ADHD 모드", durationMin: 25, recommend: "집중이 잘 안될 때", icon: "Brain" },
  { id: "work", title: "작업 모드", durationMin: 60, recommend: "일에 몰입할 때", icon: "Briefcase" },
  { id: "study", title: "공부 모드", durationMin: 90, recommend: "시험 준비할 때", icon: "BookOpen" },
  { id: "deepwork", title: "딥워크 모드", durationMin: 90, recommend: "깊은 몰입이 필요할 때", icon: "Focus" },
  { id: "meeting", title: "회의 전 준비", durationMin: 3, recommend: "긴장될 때", icon: "Users" },
];
