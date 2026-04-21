import { cn } from "@/lib/utils";

type MoodieSize = "small" | "medium" | "large";
type MoodieFace = "default" | "happy" | "sad" | "surprised" | "calm";
type MoodieEmotion =
  | MoodieFace
  | "anxious" | "angry" | "sleepy" | "panic" | "focused"
  | "excited" | "confident" | "fluttering" | "loved" | "grounded" | "energetic";

const SIZE_PX: Record<MoodieSize, number> = {
  small: 60,
  medium: 120,
  large: 240,
};

/** Map any emotion → one of the 5 available face SVGs */
const EMOTION_TO_FACE: Record<MoodieEmotion, MoodieFace> = {
  default: "default",
  happy: "happy",
  sad: "sad",
  surprised: "surprised",
  calm: "calm",
  // Calm-down group
  anxious: "calm",
  angry: "surprised",
  sleepy: "calm",
  panic: "surprised",
  focused: "calm",
  // Boost group
  excited: "happy",
  confident: "happy",
  fluttering: "happy",
  loved: "happy",
  grounded: "calm",
  energetic: "happy",
};

const FACE_TO_FILE: Record<MoodieFace, string> = {
  default: "/mascot/moodie-default.svg",
  happy: "/mascot/moodie-happy.svg",
  sad: "/mascot/moodie-sad.svg",
  surprised: "/mascot/moodie-surprised.svg",
  calm: "/mascot/moodie-calm.svg",
};

interface MoodieProps {
  size?: MoodieSize | number;
  emotion?: MoodieEmotion;
  float?: boolean;
  className?: string;
}

/**
 * Moodie — 반짝이는 블루 젤리 슬라임 + 고양이 눈 마스코트.
 * - 부유 모션(translateY ±8px, 2초)
 * - 몸체 호흡 모션(scale 1↔1.03)
 * - 눈 깜빡임(4초)
 * - 별 sparkle 깜빡임(2초, 각각 살짝 다른 위상)
 */
export const Moodie = ({
  size = "medium",
  emotion = "default",
  float = true,
  className,
}: MoodieProps) => {
  const px = typeof size === "number" ? size : SIZE_PX[size];
  const face = EMOTION_TO_FACE[emotion] ?? "default";
  const src = FACE_TO_FILE[face];
  // Aspect of SVG is 240x260 → keep proportions
  const h = Math.round((px * 260) / 240);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center select-none moodie",
        float && "animate-mascot-float",
        className
      )}
      style={{ width: px, height: h }}
      aria-hidden
    >
      <object
        type="image/svg+xml"
        data={src}
        width={px}
        height={h}
        className="w-full h-full pointer-events-none drop-shadow-[0_10px_24px_rgba(26,63,85,0.18)]"
        aria-hidden
      />
    </div>
  );
};
