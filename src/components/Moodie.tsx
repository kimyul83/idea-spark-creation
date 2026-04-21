import { cn } from "@/lib/utils";

type MoodieSize = "small" | "medium" | "large";
type MoodieEmotion =
  | "default"
  | "anxious" | "angry" | "sleepy" | "panic" | "sad" | "focused"
  | "excited" | "confident" | "fluttering" | "loved" | "grounded" | "energetic";

const SIZE_PX: Record<MoodieSize, number> = {
  small: 60,
  medium: 120,
  large: 240,
};

const EMOTION_TO_FILE: Record<MoodieEmotion, string> = {
  default: "/mascot/moodie-default.svg",
  anxious: "/mascot/moodie-default.svg",
  angry: "/mascot/moodie-default.svg",
  sleepy: "/mascot/moodie-default.svg",
  panic: "/mascot/moodie-default.svg",
  sad: "/mascot/moodie-default.svg",
  focused: "/mascot/moodie-default.svg",
  excited: "/mascot/moodie-default.svg",
  confident: "/mascot/moodie-default.svg",
  fluttering: "/mascot/moodie-default.svg",
  loved: "/mascot/moodie-default.svg",
  grounded: "/mascot/moodie-default.svg",
  energetic: "/mascot/moodie-default.svg",
};

interface MoodieProps {
  size?: MoodieSize | number;
  emotion?: MoodieEmotion;
  float?: boolean;
  className?: string;
}

/**
 * Moodie — 반투명 젤리 슬라임 마스코트.
 * 부유 모션(translateY ±8px, 2초)과 4초 깜빡임이 기본 적용됩니다.
 * 추후 감정별 12종 이미지로 EMOTION_TO_FILE만 교체하면 됩니다.
 */
export const Moodie = ({
  size = "medium",
  emotion = "default",
  float = true,
  className,
}: MoodieProps) => {
  const px = typeof size === "number" ? size : SIZE_PX[size];
  const src = EMOTION_TO_FILE[emotion];

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center select-none",
        float && "animate-mascot-float",
        className
      )}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        width={px}
        height={px}
        className="w-full h-full animate-mascot-blink drop-shadow-[0_8px_20px_rgba(45,52,54,0.12)]"
        draggable={false}
      />
    </div>
  );
};
