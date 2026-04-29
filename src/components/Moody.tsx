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
 * 영상 마스코트 경로.
 * WebM (VP9 alpha) — 투명 배경 지원, 작은 용량 (204KB).
 * Chrome/Firefox/Safari 16+ 지원.
 * /public/mascot/videos/moody-{face}.webm 있으면 영상, 없으면 default.webm,
 * 그것도 없으면 SVG 폴백.
 */
const FACE_TO_VIDEO: Record<MoodyFace, string> = {
  default:   "/mascot/videos/moody-main.mp4",
  happy:     "/mascot/videos/moody-happy.mp4",
  sad:       "/mascot/videos/moody-sad.mp4",
  surprised: "/mascot/videos/moody-surprised.mp4",
  calm:      "/mascot/videos/moody-calm.mp4",
  love:      "/mascot/videos/moody-love.mp4",
  focus:     "/mascot/videos/moody-focus.mp4",
};

const svgCache = new Map<string, string>();
// 영상 존재 여부 캐시 (HEAD 요청 1번 후 재사용)
const videoStatus = new Map<string, "ok" | "missing">();

interface MoodyProps {
  size?: MoodySize | number;
  emotion?: MoodyEmotion;
  float?: boolean;
  className?: string;
}

/**
 * Moody — 마스코트 캐릭터.
 * 우선순위: 영상(mp4) → SVG → img 태그 폴백.
 * 영상이 CDN에 있으면 자동으로 사용. 없으면 정적 SVG.
 */
export const Moody = ({
  size = "medium",
  emotion = "default",
  float = true,
  className,
}: MoodyProps) => {
  const px = typeof size === "number" ? size : SIZE_PX[size];
  const face = EMOTION_TO_FACE[emotion] ?? "default";
  const svgSrc = FACE_TO_SVG[face];
  const videoSrc = FACE_TO_VIDEO[face];
  const defaultVideoSrc = FACE_TO_VIDEO.default;
  const h = Math.round((px * 260) / 240);

  // 영상 사용 여부 — null=확인중, true/false=확정
  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
    const cached = videoStatus.get(face);
    if (cached === "ok") return toCdnUrl(videoSrc);
    if (cached === "missing") return null;
    return null;
  });
  const [checking, setChecking] = useState<boolean>(!videoStatus.has(face));

  const [svg, setSvg] = useState<string | null>(svgCache.get(svgSrc) ?? null);

  // 영상 존재 확인 (HEAD)
  useEffect(() => {
    const cached = videoStatus.get(face);
    if (cached !== undefined) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    const cdnUrl = toCdnUrl(videoSrc);
    fetch(cdnUrl, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        if (r.ok) {
          videoStatus.set(face, "ok");
          setVideoUrl(cdnUrl);
        } else {
          // emotion별 영상 없으면 default 영상 시도
          if (face !== "default") {
            return fetch(toCdnUrl(defaultVideoSrc), { method: "HEAD" }).then((r2) => {
              if (cancelled) return;
              if (r2.ok) {
                videoStatus.set(face, "ok");
                setVideoUrl(toCdnUrl(defaultVideoSrc));
              } else {
                videoStatus.set(face, "missing");
                setVideoUrl(null);
              }
            });
          }
          videoStatus.set(face, "missing");
          setVideoUrl(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        videoStatus.set(face, "missing");
        setVideoUrl(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => { cancelled = true; };
  }, [face, videoSrc, defaultVideoSrc]);

  // SVG 미리 로드 (영상 폴백 대비)
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

  const wrapperClass = cn(
    "inline-flex items-center justify-center select-none moody",
    float && "animate-mascot-float",
    className,
  );
  const wrapperStyle = { width: px, height: h };
  const dropShadow =
    "drop-shadow(0 0 20px hsl(var(--primary) / 0.45)) drop-shadow(0 10px 24px hsl(var(--glow) / 0.25))";

  // 영상 모드 — Kling 영상은 검정 배경.
  // mix-blend-mode: screen 을 wrapper에 적용 (영상에 직접 걸면 transform stacking context로 격리됨).
  // 영상은 object-cover로 캐릭터가 wrapper 가득 차게.
  if (videoUrl) {
    return (
      <div
        className={wrapperClass}
        style={{
          ...wrapperStyle,
          mixBlendMode: "screen",
        }}
        aria-hidden
      >
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: dropShadow }}
        />
      </div>
    );
  }

  // 영상 확인 중인데 SVG 캐시 있으면 SVG 노출 (깜빡임 방지)
  return (
    <div className={wrapperClass} style={wrapperStyle} aria-hidden>
      {svg ? (
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
          style={{ filter: dropShadow }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <img src={svgSrc} alt="" width={px} height={h} className="w-full h-full" />
      )}
    </div>
  );
};
