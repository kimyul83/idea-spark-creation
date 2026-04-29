import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toCdnUrl } from "@/lib/situation-tracks";

type MoodySize = "small" | "medium" | "large";
type MoodyFace = "default" | "happy" | "sad" | "surprised" | "calm" | "love" | "focus";
type MoodyEmotion =
  | MoodyFace
  | "anxious" | "angry" | "sleepy" | "panic" | "focused"
  | "excited" | "confident" | "fluttering" | "loved" | "grounded" | "energetic";

const SIZE_PX: Record<MoodySize, number> = {
  small: 60,
  medium: 120,
  large: 240,
};

const EMOTION_TO_FACE: Record<MoodyEmotion, MoodyFace> = {
  default: "default",
  happy: "happy",
  sad: "sad",
  surprised: "surprised",
  calm: "calm",
  love: "love",
  focus: "focus",
  anxious: "calm",
  angry: "surprised",
  sleepy: "calm",
  panic: "surprised",
  focused: "focus",
  excited: "happy",
  confident: "focus",
  fluttering: "love",
  loved: "love",
  grounded: "calm",
  energetic: "happy",
};

const FACE_TO_SVG: Record<MoodyFace, string> = {
  default: "/mascot/moody-default.svg",
  happy: "/mascot/moody-happy.svg",
  sad: "/mascot/moody-sad.svg",
  surprised: "/mascot/moody-surprised.svg",
  calm: "/mascot/moody-calm.svg",
  love: "/mascot/moody-love.svg",
  focus: "/mascot/moody-focus.svg",
};

/**
 * 애니메이션 WebP — 진짜 투명 알파, 모든 모던 브라우저 네이티브 지원.
 * APNG 대비 88% 작음 + 모바일 디코딩 빠름.
 * `<img>` 태그로 단순 렌더링 → stacking context / blend mode 문제 없음.
 */
const FACE_TO_APNG: Record<MoodyFace, string> = {
  default:   "/mascot/videos/moody-main.apng",
  happy:     "/mascot/videos/moody-main.apng",
  sad:       "/mascot/videos/moody-main.apng",
  surprised: "/mascot/videos/moody-main.apng",
  calm:      "/mascot/videos/moody-main.apng",
  love:      "/mascot/videos/moody-main.apng",
  focus:     "/mascot/videos/moody-main.apng",
};

const svgCache = new Map<string, string>();
const apngStatus = new Map<string, "ok" | "missing">();

interface MoodyProps {
  size?: MoodySize | number;
  emotion?: MoodyEmotion;
  float?: boolean;
  className?: string;
  /** 클릭/탭 핸들러 — 있으면 hover/active 효과 추가 */
  onClick?: () => void;
}

/**
 * Moody 캐릭터.
 * 우선순위: APNG (투명, 애니) → SVG (정적 폴백).
 * APNG가 CDN에 있으면 자동 사용. 로딩 실패 시 SVG.
 */
export const Moody = ({
  size = "medium",
  emotion = "default",
  float = true,
  className,
  onClick,
}: MoodyProps) => {
  const px = typeof size === "number" ? size : SIZE_PX[size];
  const face = EMOTION_TO_FACE[emotion] ?? "default";
  const svgSrc = FACE_TO_SVG[face];
  const apngSrc = FACE_TO_APNG[face];
  // APNG 활성 시 정사각형 (캐릭터 가운데 가득 보이게), SVG 폴백 시 240:260 비율
  // h는 useState 보다 아래로 옮겨서 apngUrl 의존성에 따라 계산

  const [apngUrl, setApngUrl] = useState<string | null>(() => {
    const cached = apngStatus.get(apngSrc);
    if (cached === "ok") return toCdnUrl(apngSrc);
    return null;
  });
  const [svg, setSvg] = useState<string | null>(svgCache.get(svgSrc) ?? null);

  // APNG 가용 확인 (1회)
  useEffect(() => {
    if (apngStatus.has(apngSrc)) return;
    let cancelled = false;
    const url = toCdnUrl(apngSrc);
    fetch(url, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        if (r.ok) {
          apngStatus.set(apngSrc, "ok");
          setApngUrl(url);
        } else {
          apngStatus.set(apngSrc, "missing");
        }
      })
      .catch(() => {
        if (cancelled) return;
        apngStatus.set(apngSrc, "missing");
      });
    return () => { cancelled = true; };
  }, [apngSrc]);

  // SVG 미리 로드 (폴백)
  useEffect(() => {
    if (svgCache.has(svgSrc)) {
      setSvg(svgCache.get(svgSrc)!);
      return;
    }
    let cancelled = false;
    fetch(svgSrc)
      .then((r) => r.text())
      .then((text) => {
        svgCache.set(svgSrc, text);
        if (!cancelled) setSvg(text);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [svgSrc]);

  // APNG가 있으면 2:1 비율(영상에 맞게), 폴백 SVG는 240:260 비율
  const h = apngUrl ? Math.round(px / 2) : Math.round((px * 260) / 240);
  const wrapperClass = cn(
    "inline-flex items-center justify-center select-none moody",
    float && "animate-mascot-float",
    onClick && "cursor-pointer transition-transform active:scale-90 hover:scale-105",
    className,
  );
  const wrapperStyle = { width: px, height: h };
  const dropShadow =
    "drop-shadow(0 0 20px hsl(var(--primary) / 0.45)) drop-shadow(0 10px 24px hsl(var(--glow) / 0.25))";

  // APNG 모드 — 진짜 투명, blend mode 불필요
  if (apngUrl) {
    return (
      <div className={wrapperClass} style={wrapperStyle} onClick={onClick} role={onClick ? "button" : undefined} aria-hidden={!onClick}>
        <img
          src={apngUrl}
          alt=""
          className="w-full h-full object-contain"
          style={{ filter: dropShadow }}
        />
      </div>
    );
  }

  // 영상 로딩 중엔 자리만 — SVG 폴백 안 보여줌 (옛 캐릭터 깜빡임 방지)
  return (
    <div
      className={wrapperClass}
      style={wrapperStyle}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-hidden={!onClick}
    />
  );
};
