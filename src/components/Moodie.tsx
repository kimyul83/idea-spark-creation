import { useEffect, useState } from "react";
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

const EMOTION_TO_FACE: Record<MoodieEmotion, MoodieFace> = {
  default: "default",
  happy: "happy",
  sad: "sad",
  surprised: "surprised",
  calm: "calm",
  anxious: "calm",
  angry: "surprised",
  sleepy: "calm",
  panic: "surprised",
  focused: "calm",
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

const svgCache = new Map<string, string>();

interface MoodieProps {
  size?: MoodieSize | number;
  emotion?: MoodieEmotion;
  float?: boolean;
  className?: string;
}

/**
 * Moodie — 반짝이는 블루 젤리 슬라임 + 고양이 눈 마스코트.
 * SVG를 인라인으로 주입해서 외부 CSS(호흡/깜빡임/sparkle)가 적용되게 합니다.
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
  const h = Math.round((px * 260) / 240);

  const [svg, setSvg] = useState<string | null>(svgCache.get(src) ?? null);

  useEffect(() => {
    if (svgCache.has(src)) {
      setSvg(svgCache.get(src)!);
      return;
    }
    let cancelled = false;
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        svgCache.set(src, text);
        if (!cancelled) setSvg(text);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [src]);

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
      {svg ? (
        <div
          className="w-full h-full drop-shadow-[0_10px_24px_rgba(26,63,85,0.18)] [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <img src={src} alt="" width={px} height={h} className="w-full h-full" />
      )}
    </div>
  );
};
