import { cn } from "@/lib/utils";

export type MonetIntensity = "soft" | "medium" | "strong";
export type MonetEmotionTint =
  | "default"
  | "anxious" | "angry" | "sleepy" | "panic" | "sad" | "focused"
  | "excited" | "confident" | "fluttering" | "loved" | "grounded" | "energetic";

interface MonetBackgroundProps {
  intensity?: MonetIntensity;
  emotion?: MonetEmotionTint;
  className?: string;
}

const INTENSITY_OPACITY: Record<MonetIntensity, number> = {
  soft: 0.55,
  medium: 0.8,
  strong: 1,
};

/**
 * Per-emotion tint overlay (sits above the base mesh).
 * Each tint is a multi-radial-gradient that biases the palette.
 */
const TINT_GRADIENTS: Record<MonetEmotionTint, string | null> = {
  default: null,
  // Calm group
  anxious:
    "radial-gradient(at 30% 30%, hsl(var(--monet-purple) / 0.55) 0px, transparent 55%), radial-gradient(at 70% 70%, hsl(var(--monet-blue) / 0.55) 0px, transparent 55%)",
  angry:
    "radial-gradient(at 25% 25%, hsl(var(--monet-blue-deep) / 0.6) 0px, transparent 55%), radial-gradient(at 75% 75%, hsl(207 30% 35% / 0.45) 0px, transparent 55%)",
  sleepy:
    "radial-gradient(at 40% 30%, hsl(220 40% 25% / 0.55) 0px, transparent 60%), radial-gradient(at 60% 80%, hsl(var(--monet-purple) / 0.55) 0px, transparent 55%)",
  panic:
    "radial-gradient(at 30% 30%, hsl(var(--monet-blue) / 0.55) 0px, transparent 55%), radial-gradient(at 70% 70%, hsl(var(--monet-purple) / 0.45) 0px, transparent 55%)",
  sad:
    "radial-gradient(at 30% 25%, hsl(var(--monet-purple) / 0.5) 0px, transparent 55%), radial-gradient(at 75% 75%, hsl(var(--monet-blue-deep) / 0.45) 0px, transparent 55%)",
  focused:
    "radial-gradient(at 25% 30%, hsl(var(--monet-blue-deep) / 0.55) 0px, transparent 55%), radial-gradient(at 75% 70%, hsl(var(--monet-cream) / 0.55) 0px, transparent 55%)",
  // Boost group
  excited:
    "radial-gradient(at 30% 30%, hsl(var(--monet-pink) / 0.6) 0px, transparent 55%), radial-gradient(at 70% 70%, hsl(var(--monet-cream) / 0.55) 0px, transparent 55%)",
  confident:
    "radial-gradient(at 30% 30%, hsl(40 60% 75% / 0.55) 0px, transparent 55%), radial-gradient(at 70% 70%, hsl(var(--monet-pink) / 0.45) 0px, transparent 55%)",
  fluttering:
    "radial-gradient(at 30% 30%, hsl(var(--monet-pink) / 0.6) 0px, transparent 55%), radial-gradient(at 70% 70%, hsl(var(--monet-purple) / 0.4) 0px, transparent 55%)",
  loved:
    "radial-gradient(at 30% 30%, hsl(var(--monet-pink) / 0.65) 0px, transparent 55%), radial-gradient(at 70% 70%, hsl(322 50% 70% / 0.4) 0px, transparent 55%)",
  grounded:
    "radial-gradient(at 30% 30%, hsl(var(--monet-sage) / 0.65) 0px, transparent 55%), radial-gradient(at 70% 70%, hsl(var(--monet-cream) / 0.55) 0px, transparent 55%)",
  energetic:
    "radial-gradient(at 30% 30%, hsl(var(--monet-cream) / 0.6) 0px, transparent 55%), radial-gradient(at 70% 70%, hsl(var(--monet-sage) / 0.5) 0px, transparent 55%)",
};

/**
 * MonetBackground — three layered painterly background.
 * Layer 1: animated radial-gradient mesh (CSS only, transform/opacity safe).
 * Layer 2: SVG turbulence painterly noise (opacity 0.15).
 * Layer 3: water lily leaves (4 corners) + flowers (3-4) drifting slowly.
 *
 * Uses position: fixed inside the parent app-shell so it covers the viewport
 * but stays scoped to the 500px shell. pointer-events: none throughout.
 */
export const MonetBackground = ({
  intensity = "medium",
  emotion = "default",
  className,
}: MonetBackgroundProps) => {
  const opacity = INTENSITY_OPACITY[intensity];
  const tint = TINT_GRADIENTS[emotion];

  return (
    <div
      className={cn(
        "absolute inset-0 -z-10 overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden
    >
      {/* SVG painterly filter (scoped) */}
      <svg className="absolute w-0 h-0" aria-hidden>
        <defs>
          <filter id="painterly" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale="6" />
          </filter>
          <filter id="grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0.18  0 0 0 0 0.2  0 0 0 0 0.22  0 0 0 0.6 0" />
          </filter>
        </defs>
      </svg>

      {/* === Layer 1: animated mesh === */}
      <div
        className="absolute inset-0 monet-mesh"
        style={{ opacity }}
      />

      {/* === Tint overlay per emotion === */}
      {tint && (
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{ backgroundImage: tint, opacity: 0.85 }}
        />
      )}

      {/* === Layer 2: painterly grain (SVG noise) === */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{ filter: "url(#grain)", opacity: 0.15 }}
      />

      {/* === Layer 3: lilies & flowers === */}
      <img
        src="/assets/waterlily-leaf.svg"
        alt=""
        className="absolute -top-10 -left-10 w-44 h-44 float-slow"
        style={{ opacity: 0.55 }}
      />
      <img
        src="/assets/waterlily-leaf-2.svg"
        alt=""
        className="absolute -top-6 -right-12 w-48 h-40 float-med"
        style={{ opacity: 0.5 }}
      />
      <img
        src="/assets/waterlily-leaf-3.svg"
        alt=""
        className="absolute -bottom-12 -left-12 w-40 h-44 float-fast"
        style={{ opacity: 0.5 }}
      />
      <img
        src="/assets/waterlily-leaf.svg"
        alt=""
        className="absolute -bottom-16 -right-8 w-44 h-44 float-slow"
        style={{ opacity: 0.45, transform: "rotate(140deg)" }}
      />

      <img src="/assets/waterlily-flower.svg" alt=""
        className="absolute top-[22%] right-[18%] w-24 h-24 float-med" style={{ opacity: 0.22 }} />
      <img src="/assets/waterlily-flower-2.svg" alt=""
        className="absolute top-[55%] left-[14%] w-20 h-20 float-slow" style={{ opacity: 0.2 }} />
      <img src="/assets/waterlily-flower-3.svg" alt=""
        className="absolute top-[72%] right-[28%] w-16 h-16 float-fast" style={{ opacity: 0.2 }} />
      <img src="/assets/waterlily-flower-2.svg" alt=""
        className="absolute top-[10%] left-[42%] w-16 h-16 float-slow" style={{ opacity: 0.18 }} />

      {/* readability vignette: subtle cream wash so text on the bg stays legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--cream) / 0.15) 0%, hsl(var(--cream) / 0.05) 50%, hsl(var(--cream) / 0.2) 100%)",
        }}
      />
    </div>
  );
};
