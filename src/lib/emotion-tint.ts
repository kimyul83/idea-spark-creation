import { MonetEmotionTint } from "@/components/MonetBackground";

/** Map DB emotion name (Korean) → MonetBackground tint key */
export const emotionNameToTint = (name?: string | null): MonetEmotionTint => {
  switch (name) {
    case "불안": return "anxious";
    case "분노": return "angry";
    case "불면": return "sleepy";
    case "공황": return "panic";
    case "우울": return "sad";
    case "집중": return "focused";
    case "신남": return "excited";
    case "자신감": return "confident";
    case "설렘": return "fluttering";
    case "사랑받음": return "loved";
    case "자연인": return "grounded";
    case "에너지 충전": return "energetic";
    default: return "default";
  }
};
