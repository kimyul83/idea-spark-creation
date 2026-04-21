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
  medium: 0.85,
  strong: 1,
};

/**
 * Per-emotion tint overlay — uses ONLY the approved morning-pond palette
 * (sky / pink / mint / lilac / cream). No sage, no deep purple in the wash
 * — those previously caused the moldy/khaki tone when blended.
 */
const TINT_GRADIENTS: Record<MonetEmotionTint, string | null> = {
  default: null,
  anxious:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--monet-lilac) / 0.55) 0%, transparent 70%), radial-gradient(45% 40% at 70% 70%, hsl(var(--monet-sky) / 0.55) 0%, transparent 70%)",
  angry:
    "radial-gradient(50% 45% at 30% 30%, hsl(var(--monet-sky) / 0.7) 0%, transparent 70%), radial-gradient(45% 40% at 75% 75%, hsl(var(--monet-mint) / 0.5) 0%, transparent 70%)",
  sleepy:
    "radial-gradient(50% 45% at 40% 30%, hsl(var(--monet-lilac) / 0.6) 0%, transparent 72%), radial-gradient(45% 40% at 60% 80%, hsl(var(--monet-sky) / 0.5) 0%, transparent 72%)",
  panic:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--monet-sky) / 0.6) 0%, transparent 70%), radial-gradient(45% 40% at 70% 70%, hsl(var(--monet-lilac) / 0.5) 0%, transparent 70%)",
  sad:
    "radial-gradient(50% 45% at 30% 25%, hsl(var(--monet-lilac) / 0.55) 0%, transparent 72%), radial-gradient(45% 40% at 75% 75%, hsl(var(--monet-sky) / 0.5) 0%, transparent 70%)",
  focused:
    "radial-gradient(45% 40% at 25% 30%, hsl(var(--monet-sky) / 0.6) 0%, transparent 70%), radial-gradient(45% 40% at 75% 70%, hsl(var(--monet-cream-soft) / 0.7) 0%, transparent 72%)",
  excited:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--monet-pink) / 0.65) 0%, transparent 70%), radial-gradient(45% 40% at 70% 70%, hsl(var(--monet-cream-soft) / 0.7) 0%, transparent 72%)",
  confident:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--monet-cream-soft) / 0.75) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--monet-pink) / 0.5) 0%, transparent 70%)",
  fluttering:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--monet-pink) / 0.6) 0%, transparent 70%), radial-gradient(45% 40% at 70% 70%, hsl(var(--monet-lilac) / 0.45) 0%, transparent 70%)",
  loved:
    "radial-gradient(50% 45% at 30% 30%, hsl(var(--monet-pink) / 0.7) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--monet-pink) / 0.4) 0%, transparent 70%)",
  grounded:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--monet-mint) / 0.65) 0%, transparent 70%), radial-gradient(45% 40% at 70% 70%, hsl(var(--monet-cream-soft) / 0.7) 0%, transparent 72%)",
  energetic:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--monet-cream-soft) / 0.7) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--monet-mint) / 0.55) 0%, transparent 70%)",
};

/**
 * MonetBackground — clean morning-pond palette.
 * Layer 1: 3 separated radial gradients on cream base (no muddy blending).
 * Layer 2: emotion tint overlay (palette-safe).
 * Layer 3: water lily leaves & flowers as the only deeper accents.
 *
 * Removed (vs prior version): SVG turbulence noise, painterly grain filter,
 * and sage/deep-purple in the wash — these caused the moldy/khaki tone.
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
      {/* Layer 1: clean separated mesh */}
      <div className="absolute inset-0 monet-mesh" style={{ opacity }} />

      {/* Emotion tint overlay */}
      {tint && (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: tint, opacity: 0.9 }}
        />
      )}

      {/* Layer 3: water lilies (only deeper accents) */}
      <img src="/assets/waterlily-leaf.svg" alt=""
        className="absolute -top-10 -left-10 w-44 h-44 float-slow" style={{ opacity: 0.25 }} />
      <img src="/assets/waterlily-leaf-2.svg" alt=""
        className="absolute -top-6 -right-12 w-48 h-40 float-med" style={{ opacity: 0.25 }} />
      <img src="/assets/waterlily-leaf-3.svg" alt=""
        className="absolute -bottom-12 -left-12 w-40 h-44 float-fast" style={{ opacity: 0.25 }} />
      <img src="/assets/waterlily-leaf.svg" alt=""
        className="absolute -bottom-16 -right-8 w-44 h-44 float-slow"
        style={{ opacity: 0.22, transform: "rotate(140deg)" }} />

      <img src="/assets/waterlily-flower.svg" alt=""
        className="absolute top-[22%] right-[18%] w-24 h-24 float-med" style={{ opacity: 0.3 }} />
      <img src="/assets/waterlily-flower-2.svg" alt=""
        className="absolute top-[55%] left-[14%] w-20 h-20 float-slow" style={{ opacity: 0.3 }} />
      <img src="/assets/waterlily-flower-3.svg" alt=""
        className="absolute top-[72%] right-[28%] w-16 h-16 float-fast" style={{ opacity: 0.28 }} />
      <img src="/assets/waterlily-flower-2.svg" alt=""
        className="absolute top-[10%] left-[42%] w-16 h-16 float-slow" style={{ opacity: 0.25 }} />
    </div>
  );
};
