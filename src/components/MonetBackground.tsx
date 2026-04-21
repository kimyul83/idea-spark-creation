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
  soft: 0.45,
  medium: 0.75,
  strong: 1,
};

/**
 * Tiffany Dawn/Dusk emotion tint — only abstract blurred orbs,
 * uses brand tokens (tiffany / tiffany-soft / champagne / rose-gold).
 * No flora, no muddy tones. Looks great on both themes.
 */
const TINT_GRADIENTS: Record<MonetEmotionTint, string | null> = {
  default: null,
  anxious:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--tiffany-soft) / 0.45) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--tiffany) / 0.30) 0%, transparent 72%)",
  angry:
    "radial-gradient(50% 45% at 30% 30%, hsl(var(--tiffany) / 0.50) 0%, transparent 72%), radial-gradient(45% 40% at 75% 75%, hsl(var(--rose-gold) / 0.40) 0%, transparent 72%)",
  sleepy:
    "radial-gradient(50% 45% at 40% 30%, hsl(var(--tiffany) / 0.40) 0%, transparent 75%), radial-gradient(45% 40% at 60% 80%, hsl(var(--rose-gold) / 0.35) 0%, transparent 75%)",
  panic:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--tiffany-soft) / 0.50) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--tiffany) / 0.35) 0%, transparent 72%)",
  sad:
    "radial-gradient(50% 45% at 30% 25%, hsl(var(--tiffany) / 0.40) 0%, transparent 75%), radial-gradient(45% 40% at 75% 75%, hsl(var(--tiffany-soft) / 0.40) 0%, transparent 72%)",
  focused:
    "radial-gradient(45% 40% at 25% 30%, hsl(var(--tiffany) / 0.45) 0%, transparent 72%), radial-gradient(45% 40% at 75% 70%, hsl(var(--tiffany-soft) / 0.40) 0%, transparent 72%)",
  excited:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--rose-gold) / 0.45) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--champagne) / 0.40) 0%, transparent 72%)",
  confident:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--champagne) / 0.50) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--tiffany) / 0.30) 0%, transparent 72%)",
  fluttering:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--rose-gold) / 0.45) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--tiffany-soft) / 0.35) 0%, transparent 72%)",
  loved:
    "radial-gradient(50% 45% at 30% 30%, hsl(var(--rose-gold) / 0.55) 0%, transparent 75%), radial-gradient(45% 40% at 70% 70%, hsl(var(--champagne) / 0.35) 0%, transparent 72%)",
  grounded:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--tiffany-soft) / 0.50) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--champagne) / 0.40) 0%, transparent 72%)",
  energetic:
    "radial-gradient(45% 40% at 30% 30%, hsl(var(--champagne) / 0.45) 0%, transparent 72%), radial-gradient(45% 40% at 70% 70%, hsl(var(--tiffany-soft) / 0.40) 0%, transparent 72%)",
};

/**
 * MonetBackground — Tiffany Dawn/Dusk.
 * Abstract blurred orbs only (no flora). Adapts via CSS variables
 * across .dark and light themes.
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
      {/* Layer 1: signature drifting orbs */}
      <div className="absolute inset-0 tiffany-mesh" style={{ opacity }} />

      {/* Layer 2: emotion tint */}
      {tint && (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: tint, opacity: 0.85 }}
        />
      )}
    </div>
  );
};
