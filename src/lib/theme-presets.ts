/**
 * Theme presets for Moodie.
 *
 * Each preset has a `light` + `dark` palette expressed as HSL strings
 * (`H S% L%`) so they can be assigned directly to CSS variables and used
 * with the `hsl(var(--token))` pattern across Tailwind tokens.
 *
 * Adding a preset → add an entry here. Everything else (UI grid, persisted
 * value, runtime application) picks it up automatically.
 */

export type ThemePresetId = "tiffany" | "sakura" | "forest" | "lavender" | "mono";
export type ThemeVariant = "light" | "dark";

export interface ThemePalette {
  /* core surfaces */
  background: string;
  backgroundEnd: string;
  section: string;
  foreground: string;
  foregroundMuted: string;
  /* brand */
  primary: string;
  primarySoft: string;
  accent: string;
  /* derived */
  border: string;
  ring: string;
  /* shadow tint (foreground hue, used in shadow alpha calc) */
  shadowHue: string;
  /* swatch preview chips */
  swatches: [string, string, string]; // hex / hsl strings for the preset card preview
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  light: ThemePalette;
  dark: ThemePalette;
}

/* Helpers — keep palette declarations tidy */
const t = {
  white: "0 0% 100%",
  black: "0 0% 0%",
};

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  /* ─────────────────────────── Tiffany ─────────────────────────── */
  tiffany: {
    id: "tiffany",
    name: "Tiffany",
    description: "민트 블루의 차분함",
    light: {
      background: "40 47% 96%",
      backgroundEnd: "173 47% 91%",
      section: t.white,
      foreground: "217 33% 15%",
      foregroundMuted: "215 9% 40%",
      primary: "174 89% 39%",
      primarySoft: "174 50% 67%",
      accent: "34 41% 71%",
      border: "173 30% 88%",
      ring: "174 89% 39%",
      shadowHue: "217 33% 15%",
      swatches: ["#FAF7F0", "#0ABAB5", "#D4B896"],
    },
    dark: {
      background: "217 53% 9%",
      backgroundEnd: "217 33% 15%",
      section: "217 38% 13%",
      foreground: "35 38% 93%",
      foregroundMuted: "215 17% 76%",
      primary: "174 89% 39%",
      primarySoft: "174 50% 67%",
      accent: "19 60% 80%",
      border: "217 25% 22%",
      ring: "174 89% 39%",
      shadowHue: "0 0% 0%",
      swatches: ["#0A1525", "#0ABAB5", "#E8C4B0"],
    },
  },

  /* ─────────────────────────── Sakura ─────────────────────────── */
  sakura: {
    id: "sakura",
    name: "Sakura",
    description: "벚꽃의 부드러움",
    light: {
      background: "10 65% 97%",     // #FEF6F4
      backgroundEnd: "345 60% 93%",
      section: t.white,
      foreground: "330 18% 20%",    // #3D2B35
      foregroundMuted: "330 9% 42%",
      primary: "344 60% 78%",       // #E8A5B8
      primarySoft: "344 70% 88%",
      accent: "20 50% 80%",
      border: "345 35% 90%",
      ring: "344 60% 70%",
      shadowHue: "330 18% 20%",
      swatches: ["#FEF6F4", "#E8A5B8", "#F5C9D4"],
    },
    dark: {
      background: "330 28% 9%",     // #1F1218
      backgroundEnd: "330 22% 14%",
      section: "330 25% 13%",
      foreground: "350 80% 95%",    // #FDE8EC
      foregroundMuted: "345 25% 78%",
      primary: "350 80% 83%",       // #F5B5C5
      primarySoft: "344 60% 78%",
      accent: "19 60% 80%",
      border: "330 18% 22%",
      ring: "350 80% 75%",
      shadowHue: "0 0% 0%",
      swatches: ["#1F1218", "#F5B5C5", "#E8A5B8"],
    },
  },

  /* ─────────────────────────── Forest ─────────────────────────── */
  forest: {
    id: "forest",
    name: "Forest",
    description: "숲의 평온함",
    light: {
      background: "85 30% 95%",     // #F4F7F0
      backgroundEnd: "140 25% 90%",
      section: t.white,
      foreground: "140 22% 15%",    // #1E2E22
      foregroundMuted: "140 8% 40%",
      primary: "140 22% 52%",       // #6B9E7F
      primarySoft: "140 30% 67%",
      accent: "40 35% 70%",
      border: "140 18% 86%",
      ring: "140 22% 45%",
      shadowHue: "140 22% 15%",
      swatches: ["#F4F7F0", "#6B9E7F", "#A8C9B5"],
    },
    dark: {
      background: "140 25% 8%",     // #0F1A14
      backgroundEnd: "140 18% 14%",
      section: "140 20% 12%",
      foreground: "100 30% 92%",    // #E8F0E4
      foregroundMuted: "120 10% 75%",
      primary: "140 30% 67%",       // #8FC4A3
      primarySoft: "140 22% 52%",
      accent: "40 35% 70%",
      border: "140 15% 22%",
      ring: "140 30% 60%",
      shadowHue: "0 0% 0%",
      swatches: ["#0F1A14", "#8FC4A3", "#6B9E7F"],
    },
  },

  /* ─────────────────────────── Lavender ─────────────────────────── */
  lavender: {
    id: "lavender",
    name: "Lavender",
    description: "라벤더의 우아함",
    light: {
      background: "265 50% 97%",    // #F7F4FB
      backgroundEnd: "270 40% 92%",
      section: t.white,
      foreground: "265 22% 18%",    // #2E2438
      foregroundMuted: "265 10% 42%",
      primary: "265 38% 64%",       // #9B7FC4
      primarySoft: "265 50% 78%",
      accent: "320 35% 78%",
      border: "265 30% 90%",
      ring: "265 38% 58%",
      shadowHue: "265 22% 18%",
      swatches: ["#F7F4FB", "#9B7FC4", "#C4B0E0"],
    },
    dark: {
      background: "260 38% 12%",    // #18132A
      backgroundEnd: "260 28% 18%",
      section: "260 32% 16%",
      foreground: "280 50% 93%",    // #EDE4F5
      foregroundMuted: "275 18% 78%",
      primary: "265 50% 75%",       // #B9A2DC
      primarySoft: "265 38% 64%",
      accent: "320 35% 78%",
      border: "260 22% 25%",
      ring: "265 50% 70%",
      shadowHue: "0 0% 0%",
      swatches: ["#18132A", "#B9A2DC", "#9B7FC4"],
    },
  },

  /* ─────────────────────────── Mono ─────────────────────────── */
  mono: {
    id: "mono",
    name: "Mono",
    description: "절제된 모노크롬",
    light: {
      background: "0 0% 100%",
      backgroundEnd: "0 0% 96%",
      section: t.white,
      foreground: "0 0% 0%",
      foregroundMuted: "0 0% 40%",
      primary: "0 0% 10%",
      primarySoft: "0 0% 35%",
      accent: "0 0% 60%",
      border: "0 0% 90%",
      ring: "0 0% 10%",
      shadowHue: "0 0% 0%",
      swatches: ["#FFFFFF", "#1A1A1A", "#9A9A9A"],
    },
    dark: {
      background: "0 0% 4%",
      backgroundEnd: "0 0% 9%",
      section: "0 0% 8%",
      foreground: "0 0% 100%",
      foregroundMuted: "0 0% 70%",
      primary: "0 0% 96%",
      primarySoft: "0 0% 70%",
      accent: "0 0% 50%",
      border: "0 0% 18%",
      ring: "0 0% 96%",
      shadowHue: "0 0% 0%",
      swatches: ["#0A0A0A", "#F5F5F5", "#7A7A7A"],
    },
  },
};

export const PRESET_LIST: ThemePreset[] = [
  THEME_PRESETS.tiffany,
  THEME_PRESETS.sakura,
  THEME_PRESETS.forest,
  THEME_PRESETS.lavender,
  THEME_PRESETS.mono,
];

/**
 * Apply a palette to `:root` via CSS variables.
 * Tailwind tokens (`hsl(var(--background))` etc.) pick this up immediately.
 */
export const applyPalette = (palette: ThemePalette, variant: ThemeVariant) => {
  const r = document.documentElement;
  r.style.setProperty("--background", palette.background);
  r.style.setProperty("--background-end", palette.backgroundEnd);
  r.style.setProperty("--section", palette.section);
  r.style.setProperty("--foreground", palette.foreground);
  r.style.setProperty("--foreground-muted", palette.foregroundMuted);

  r.style.setProperty("--card", palette.section);
  r.style.setProperty("--card-foreground", palette.foreground);
  r.style.setProperty("--popover", palette.section);
  r.style.setProperty("--popover-foreground", palette.foreground);

  r.style.setProperty("--primary", palette.primary);
  r.style.setProperty(
    "--primary-foreground",
    variant === "light" ? "0 0% 100%" : palette.background,
  );
  r.style.setProperty("--secondary", palette.backgroundEnd);
  r.style.setProperty("--secondary-foreground", palette.foreground);
  r.style.setProperty("--muted", palette.backgroundEnd);
  r.style.setProperty("--muted-foreground", palette.foregroundMuted);
  r.style.setProperty("--accent", palette.accent);
  r.style.setProperty("--accent-foreground", palette.foreground);

  r.style.setProperty("--border", palette.border);
  r.style.setProperty("--input", palette.border);
  r.style.setProperty("--ring", palette.ring);

  /* Brand aliases (still consumed by some surfaces / mascot) */
  r.style.setProperty("--tiffany", palette.primary);
  r.style.setProperty("--tiffany-soft", palette.primarySoft);
  r.style.setProperty("--champagne", palette.accent);
  r.style.setProperty("--rose-gold", palette.accent);

  /* Shadow tint */
  r.style.setProperty(
    "--shadow-soft",
    `0 2px ${variant === "dark" ? "16px" : "12px"} -4px hsl(${palette.shadowHue} / ${
      variant === "dark" ? 0.4 : 0.08
    })`,
  );
  r.style.setProperty(
    "--shadow-card",
    `0 ${variant === "dark" ? "12px 40px" : "8px 32px"} -16px hsl(${palette.shadowHue} / ${
      variant === "dark" ? 0.55 : 0.12
    })`,
  );

  /* Toggle the .dark class so any `.dark *` rules still trigger */
  if (variant === "dark") r.classList.add("dark");
  else r.classList.remove("dark");
  r.dataset.variant = variant;
};
