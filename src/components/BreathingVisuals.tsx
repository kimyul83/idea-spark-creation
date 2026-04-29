/**
 * Five immersive breathing visuals. Each is driven by:
 *  - phase: which breath phase we are in
 *  - seconds: how long the current phase lasts (drives transition speed)
 *  - intensity: 0..1 progress of the current phase (optional)
 *  - mini: render compact preview suited to a card
 *
 * Honors `prefers-reduced-motion` by collapsing to a soft fade.
 * All colours pull from CSS tokens (--primary / --accent / --tiffany / --champagne).
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { BreathingPhase, BreathingVisualId } from "@/lib/breathing";

export interface BreathingVisualProps {
  visual: BreathingVisualId;
  phase: BreathingPhase;
  /** Duration in seconds of the current phase — drives easing speed. */
  seconds: number;
  /** Compact card preview mode. */
  mini?: boolean;
  className?: string;
}

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
};

/* ────────────── shared helpers ────────────── */

const phaseScale = (phase: BreathingPhase) =>
  phase === "inhale" || phase === "hold1" ? 1 : phase === "exhale" ? 0 : 0;

/** Smooth-ish target value in 0..1 representing "fullness of breath". */
const phaseFullness = (phase: BreathingPhase) => {
  switch (phase) {
    case "inhale": return 1;       // travel toward full
    case "hold1":  return 1;       // stay full
    case "exhale": return 0;       // travel toward empty
    case "hold2":  return 0;       // stay empty
  }
};

/* ────────────── 1. Bubble ────────────── */

const Bubble = ({ phase, seconds, mini }: Omit<BreathingVisualProps, "visual">) => {
  const full = phaseFullness(phase);
  const scale = 0.55 + full * 0.55; // 0.55 → 1.10
  const lift  = (full - 0.5) * (mini ? 6 : 24); // gentle up/down
  const dur   = `${seconds}s`;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full h-full",
      )}
      aria-hidden
    >
      <div
        className="absolute rounded-full"
        style={{
          width: mini ? 64 : 260,
          height: mini ? 64 : 260,
          background:
            "radial-gradient(circle at 35% 30%, hsl(0 0% 100% / 0.85) 0%, hsl(var(--primary) / 0.55) 55%, hsl(var(--accent) / 0.4) 100%)",
          boxShadow:
            "inset 0 6px 18px hsl(0 0% 100% / 0.45), 0 20px 50px -15px hsl(var(--primary) / 0.45)",
          transform: `translateY(${-lift}px) scale(${scale})`,
          opacity: 0.4 + full * 0.6,
          transition: `transform ${dur} cubic-bezier(0.4,0,0.2,1), opacity ${dur} ease`,
        }}
      />
      {/* highlight droplet */}
      <div
        className="absolute rounded-full"
        style={{
          width: mini ? 10 : 40,
          height: mini ? 10 : 40,
          top: mini ? "22%" : "26%",
          left: mini ? "30%" : "34%",
          background:
            "radial-gradient(circle, hsl(0 0% 100% / 0.85) 0%, transparent 70%)",
          filter: "blur(2px)",
          transform: `scale(${0.6 + full * 0.6})`,
          transition: `transform ${dur} ease`,
        }}
      />
    </div>
  );
};

/* ────────────── 2. Wave ────────────── */

const Wave = ({ phase, seconds, mini }: Omit<BreathingVisualProps, "visual">) => {
  const full = phaseFullness(phase);
  // wave rises from bottom upward as fullness grows
  const rise = full * (mini ? 60 : 70); // % of container height
  const dur = `${seconds}s`;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[28px]" aria-hidden>
      {/* back wave */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: `${rise * 0.85 + 15}%`,
          background:
            "linear-gradient(to top, hsl(var(--primary) / 0.55), hsl(var(--primary) / 0.15))",
          transition: `height ${dur} cubic-bezier(0.4,0,0.2,1)`,
          maskImage:
            "radial-gradient(120% 120% at 50% 100%, black 70%, transparent 100%)",
        }}
      />
      {/* front wave with svg curl */}
      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 bottom-0 w-full"
        style={{
          height: `${rise + 20}%`,
          transition: `height ${dur} cubic-bezier(0.4,0,0.2,1)`,
        }}
      >
        <defs>
          <linearGradient id="bw-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="hsl(var(--accent))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 C150,20 300,100 450,50 C525,25 575,55 600,40 L600,200 L0,200 Z"
          fill="url(#bw-fill)"
        >
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M0,60 C150,20 300,100 450,50 C525,25 575,55 600,40 L600,200 L0,200 Z;
              M0,40 C150,80 300,30 450,80 C525,55 575,25 600,55 L600,200 L0,200 Z;
              M0,60 C150,20 300,100 450,50 C525,25 575,55 600,40 L600,200 L0,200 Z"
          />
        </path>
      </svg>
      {/* (phase hint removed — was Korean only) */}
    </div>
  );
};

/* ────────────── 3. Moonrise ────────────── */

const Moonrise = ({ phase, seconds, mini }: Omit<BreathingVisualProps, "visual">) => {
  const full = phaseFullness(phase);
  const moonSize = mini ? 36 : 140;
  const travel = mini ? 50 : 220;
  const lift = full * travel;
  const dur = `${seconds}s`;
  const isHold = phase === "hold1" || phase === "hold2";

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[28px]" aria-hidden>
      {/* stars */}
      {!mini && Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            top:    `${(i * 37) % 70}%`,
            left:   `${(i * 53) % 95}%`,
            width:  i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            opacity: 0.4 + ((i * 7) % 5) / 10,
            animationDelay: `${(i * 0.3) % 2}s`,
            animationDuration: "3s",
          }}
        />
      ))}
      {/* moon */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: moonSize,
          height: moonSize,
          bottom: -moonSize * 0.4 + lift,
          background:
            "radial-gradient(circle at 35% 35%, hsl(var(--champagne, 38 70% 80%)) 0%, hsl(var(--accent)) 60%, hsl(var(--primary) / 0.4) 100%)",
          boxShadow: isHold
            ? "0 0 60px 10px hsl(var(--accent) / 0.7), inset 0 4px 16px hsl(0 0% 100% / 0.4)"
            : "0 0 30px 4px hsl(var(--accent) / 0.45), inset 0 4px 16px hsl(0 0% 100% / 0.35)",
          transition: `bottom ${dur} cubic-bezier(0.4,0,0.2,1), box-shadow ${dur} ease`,
        }}
      />
      {/* horizon */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: mini ? 18 : 60,
          background:
            "linear-gradient(to top, hsl(var(--background)) 30%, transparent 100%)",
        }}
      />
    </div>
  );
};

/* ────────────── 4. Orbit (flowing light) ────────────── */

const Orbit = ({ phase, seconds, mini }: Omit<BreathingVisualProps, "visual">) => {
  const dur = `${seconds}s`;
  const r = mini ? 26 : 110;
  const dot = mini ? 6 : 16;
  // angle in degrees: inhale 180→0 (top half), exhale 0→180 via -180 (bottom half)
  const angle =
    phase === "inhale" ? 0 :
    phase === "hold1"  ? 0 :   // stay at top
    phase === "exhale" ? 180 :
    180;                       // hold2 stays at bottom
  const isHold = phase === "hold1" || phase === "hold2";

  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden>
      {/* orbit ring */}
      <div
        className="rounded-full border border-primary/25"
        style={{ width: r * 2, height: r * 2 }}
      />
      {/* center pulse */}
      <div
        className="absolute rounded-full"
        style={{
          width: mini ? 10 : 36,
          height: mini ? 10 : 36,
          background:
            "radial-gradient(circle, hsl(0 0% 100% / 0.9) 0%, hsl(var(--primary) / 0.5) 60%, transparent 80%)",
          filter: "blur(1px)",
          opacity: 0.4 + (isHold ? 0.5 : 0.25),
          transition: `opacity ${dur} ease`,
        }}
      />
      {/* moving dot */}
      <div
        className="absolute"
        style={{
          width: 0,
          height: 0,
          transform: `rotate(${angle}deg)`,
          transition: `transform ${dur} cubic-bezier(0.4,0,0.2,1)`,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: dot,
            height: dot,
            transform: `translate(${r}px, -${dot / 2}px)`,
            background:
              "radial-gradient(circle, hsl(0 0% 100%) 0%, hsl(var(--accent)) 60%, transparent 80%)",
            boxShadow: isHold
              ? "0 0 30px 6px hsl(var(--accent) / 0.9)"
              : "0 0 18px 3px hsl(var(--accent) / 0.7)",
            transition: `box-shadow ${dur} ease`,
          }}
        />
      </div>
    </div>
  );
};

/* ────────────── 5. Bloom (flower) ────────────── */

const Bloom = ({ phase, seconds, mini }: Omit<BreathingVisualProps, "visual">) => {
  const full = phaseFullness(phase);
  const open = full;          // 0..1 petal openness
  const dur = `${seconds}s`;
  const isHold = phase === "hold1";
  const size = mini ? 70 : 240;

  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden>
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const baseRot = i * 60;
          // petals translate outward + rotate slightly as they open
          const tx = open * (mini ? 14 : 50);
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: mini ? 18 : 60,
                height: mini ? 28 : 100,
                marginLeft: mini ? -9 : -30,
                marginTop:  mini ? -14 : -50,
                background:
                  "radial-gradient(ellipse at 50% 20%, hsl(0 0% 100% / 0.85), hsl(var(--primary) / 0.7) 60%, hsl(var(--accent) / 0.5) 100%)",
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                transform: `rotate(${baseRot}deg) translateY(-${tx}px) scale(${0.55 + open * 0.55})`,
                transformOrigin: "center bottom",
                opacity: 0.4 + open * 0.6,
                boxShadow: "inset 0 4px 8px hsl(0 0% 100% / 0.35)",
                transition: `transform ${dur} cubic-bezier(0.4,0,0.2,1), opacity ${dur} ease`,
              }}
            />
          );
        })}
        {/* center sparkle */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: mini ? 10 : 36,
            height: mini ? 10 : 36,
            marginLeft: mini ? -5 : -18,
            marginTop:  mini ? -5 : -18,
            background:
              "radial-gradient(circle, hsl(0 0% 100%) 0%, hsl(var(--accent)) 70%, transparent 100%)",
            boxShadow: isHold
              ? "0 0 24px 6px hsl(var(--accent) / 0.9)"
              : "0 0 10px 2px hsl(var(--accent) / 0.5)",
            opacity: 0.5 + open * 0.5,
            transition: `box-shadow ${dur} ease, opacity ${dur} ease`,
          }}
        />
        {/* pollen particles when open & not mini */}
        {!mini && open > 0.5 && Array.from({ length: 6 }).map((_, i) => (
          <span
            key={`p-${i}`}
            className="absolute rounded-full bg-white/70"
            style={{
              width: 3, height: 3,
              left: `${50 + Math.cos((i / 6) * Math.PI * 2) * 40}%`,
              top:  `${50 + Math.sin((i / 6) * Math.PI * 2) * 40}%`,
              animation: `dropletRise ${4 + i}s ease-out infinite`,
              animationDelay: `${i * 0.4}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ────────────── public component ────────────── */

export const BreathingVisual = ({
  visual, phase, seconds, mini, className,
}: BreathingVisualProps) => {
  const reduced = usePrefersReducedMotion();
  const safeSeconds = Math.max(0.4, seconds);

  if (reduced) {
    // Soft fade fallback
    const full = phaseFullness(phase);
    return (
      <div className={cn("relative flex items-center justify-center w-full h-full", className)} aria-hidden>
        <div
          className="rounded-full"
          style={{
            width: mini ? 60 : 220,
            height: mini ? 60 : 220,
            background: "radial-gradient(circle, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.3))",
            opacity: 0.3 + full * 0.6,
            transition: `opacity ${safeSeconds}s ease`,
          }}
        />
      </div>
    );
  }

  const inner = (() => {
    switch (visual) {
      case "wave":     return <Wave     phase={phase} seconds={safeSeconds} mini={mini} />;
      case "moonrise": return <Moonrise phase={phase} seconds={safeSeconds} mini={mini} />;
      case "orbit":    return <Orbit    phase={phase} seconds={safeSeconds} mini={mini} />;
      case "bloom":    return <Bloom    phase={phase} seconds={safeSeconds} mini={mini} />;
      case "bubble":
      default:         return <Bubble   phase={phase} seconds={safeSeconds} mini={mini} />;
    }
  })();

  return <div className={cn("relative w-full h-full", className)}>{inner}</div>;
};

/**
 * Mini preview that auto-loops between inhale and exhale every 3s.
 * Used in animation-style picker cards.
 */
export const BreathingVisualPreview = ({
  visual,
  className,
}: { visual: BreathingVisualId; className?: string }) => {
  const [phase, setPhase] = useState<BreathingPhase>("inhale");
  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      setPhase((p) => (p === "inhale" ? "exhale" : "inhale"));
    };
    const t = window.setInterval(tick, 2600);
    return () => { mounted = false; window.clearInterval(t); };
  }, []);
  return (
    <div className={cn("relative", className)}>
      <BreathingVisual visual={visual} phase={phase} seconds={2.4} mini />
    </div>
  );
};
