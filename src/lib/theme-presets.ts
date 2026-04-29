/**
 * Theme presets for Moody — "Premium Pop Aqua" rework.
 *
 * Each preset has a `light` + `dark` palette in HSL strings (`H S% L%`)
 * applied directly to CSS variables.
 *
 * Tone direction:
 *   - Dark = near-black (#050505 ~ #0A0A0A) with a faint blue undertone
 *   - Accent = high-chroma aqua (no muddy navy, no olive)
 *   - All presets cranked up in saturation for a glossy, vivid look.
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
  /* shadow tint */
  shadowHue: string;
  /* swatch preview chips (hex/hsl) */
  swatches: [string, string, string];
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  light: ThemePalette;
  dark: ThemePalette;
}

const t = {
  white: "0 0% 100%",
  black: "0 0% 0%",
};

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  /* ───────────────────────── Aqua (default) ───────────────────────── */
  /* id kept as "tiffany" for backward-compat with stored prefs */
  tiffany: {
    id: "tiffany",
    name: "Aqua",
    description: "쨍한 아쿠아 블루",
    light: {
      background: "190 50% 98%",     // #F0FAFC
      backgroundEnd: "186 67% 92%",
      section: t.white,
      foreground: "0 0% 4%",         // #0A0A0A
      foregroundMuted: "215 19% 35%",// slate-ish but not blueish
      primary: "186 100% 45%",       // #00D9E8
      primarySoft: "186 87% 73%",    // #7FE8F0
      accent: "200 100% 36%",        // #0077B6
      border: "186 60% 86%",
      ring: "186 100% 45%",
      shadowHue: "186 100% 30%",
      swatches: ["#F0FAFC", "#00D9E8", "#0077B6"],
    },
    dark: {
      background: "0 0% 2%",         // #050505
      backgroundEnd: "215 50% 6%",   // hint of blue at bottom
      section: "0 0% 6%",            // #0F0F0F
      foreground: "0 0% 100%",
      foregroundMuted: "212 17% 77%",// #B8C5D1
      primary: "186 95% 64%",        // #4AEBFB
      primarySoft: "186 100% 45%",   // #00D9E8
      accent: "200 100% 36%",        // #0077B6
      border: "186 50% 18%",
      ring: "186 95% 64%",
      shadowHue: "186 100% 45%",
      swatches: ["#050505", "#4AEBFB", "#0077B6"],
    },
  },

  /* ───────────────────────────── Sakura ───────────────────────────── */
  sakura: {
    id: "sakura",
    name: "Sakura",
    description: "선명한 핫핑크",
    light: {
      background: "348 100% 98%",    // #FFF5F7
      backgroundEnd: "344 90% 93%",
      section: t.white,
      foreground: "326 25% 14%",     // #2D1B25
      foregroundMuted: "326 12% 38%",
      primary: "340 100% 68%",       // #FF5C8D
      primarySoft: "340 100% 82%",
      accent: "344 100% 60%",
      border: "344 80% 90%",
      ring: "340 100% 60%",
      shadowHue: "340 100% 45%",
      swatches: ["#FFF5F7", "#FF5C8D", "#FF1F66"],
    },
    dark: {
      background: "0 50% 3%",        // #0A0505
      backgroundEnd: "340 40% 6%",
      section: "340 18% 7%",
      foreground: "0 0% 100%",
      foregroundMuted: "340 18% 78%",
      primary: "340 100% 75%",       // #FF7FA8
      primarySoft: "340 100% 68%",
      accent: "344 100% 60%",
      border: "340 40% 18%",
      ring: "340 100% 75%",
      shadowHue: "340 100% 60%",
      swatches: ["#0A0505", "#FF7FA8", "#FF5C8D"],
    },
  },

  /* ───────────────────────────── Forest (emerald) ───────────────────────────── */
  forest: {
    id: "forest",
    name: "Forest",
    description: "쨍한 에메랄드",
    light: {
      background: "138 76% 97%",     // #F0FDF4
      backgroundEnd: "160 70% 90%",
      section: t.white,
      foreground: "140 40% 7%",      // #0A1A10
      foregroundMuted: "150 12% 35%",
      primary: "160 100% 38%",       // #00C48C
      primarySoft: "158 80% 70%",
      accent: "160 100% 30%",
      border: "158 50% 86%",
      ring: "160 100% 38%",
      shadowHue: "160 100% 30%",
      swatches: ["#F0FDF4", "#00C48C", "#00935F"],
    },
    dark: {
      background: "120 50% 2%",      // #050A05
      backgroundEnd: "150 40% 6%",
      section: "150 22% 7%",
      foreground: "0 0% 100%",
      foregroundMuted: "150 14% 78%",
      primary: "158 88% 49%",        // #10E8A0
      primarySoft: "160 100% 38%",
      accent: "160 100% 36%",
      border: "150 35% 18%",
      ring: "158 88% 49%",
      shadowHue: "158 100% 45%",
      swatches: ["#050A05", "#10E8A0", "#00C48C"],
    },
  },

  /* ───────────────────────────── Lavender ───────────────────────────── */
  lavender: {
    id: "lavender",
    name: "Lavender",
    description: "선명한 바이올렛",
    light: {
      background: "260 100% 97%",    // #F5F0FF
      backgroundEnd: "265 80% 92%",
      section: t.white,
      foreground: "266 50% 12%",     // #1A0F2E
      foregroundMuted: "266 14% 38%",
      primary: "266 100% 65%",       // #9D4EFF
      primarySoft: "266 100% 80%",
      accent: "275 100% 55%",
      border: "266 60% 90%",
      ring: "266 100% 65%",
      shadowHue: "266 100% 50%",
      swatches: ["#F5F0FF", "#9D4EFF", "#7B1FFF"],
    },
    dark: {
      background: "255 60% 3%",      // #050310
      backgroundEnd: "260 50% 6%",
      section: "260 30% 8%",
      foreground: "0 0% 100%",
      foregroundMuted: "266 18% 78%",
      primary: "266 100% 75%",       // #B47FFF
      primarySoft: "266 100% 65%",
      accent: "275 100% 65%",
      border: "260 40% 20%",
      ring: "266 100% 75%",
      shadowHue: "266 100% 60%",
      swatches: ["#050310", "#B47FFF", "#9D4EFF"],
    },
  },

  /* ───────────────────────────── Mono ───────────────────────────── */
  mono: {
    id: "mono",
    name: "Mono",
    description: "순수 흑백",
    light: {
      background: "0 0% 100%",
      backgroundEnd: "0 0% 96%",
      section: t.white,
      foreground: "0 0% 0%",
      foregroundMuted: "0 0% 38%",
      primary: "0 0% 0%",
      primarySoft: "0 0% 30%",
      accent: "0 0% 50%",
      border: "0 0% 90%",
      ring: "0 0% 0%",
      shadowHue: "0 0% 0%",
      swatches: ["#FFFFFF", "#000000", "#9A9A9A"],
    },
    dark: {
      background: "0 0% 0%",
      backgroundEnd: "0 0% 4%",
      section: "0 0% 6%",
      foreground: "0 0% 100%",
      foregroundMuted: "0 0% 72%",
      primary: "0 0% 100%",
      primarySoft: "0 0% 80%",
      accent: "0 0% 60%",
      border: "0 0% 18%",
      ring: "0 0% 100%",
      shadowHue: "0 0% 100%",
      swatches: ["#000000", "#FFFFFF", "#7A7A7A"],
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
    variant === "light" ? "0 0% 100%" : "0 0% 4%",
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

  /* Brand aliases (consumed by surfaces / mascot tint) */
  r.style.setProperty("--tiffany", palette.primary);
  r.style.setProperty("--tiffany-soft", palette.primarySoft);
  r.style.setProperty("--champagne", palette.accent);
  r.style.setProperty("--rose-gold", palette.accent);

  /* Glow shadow — uses primary hue so each preset gets its own glow */
  r.style.setProperty(
    "--shadow-soft",
    `0 2px ${variant === "dark" ? "16px" : "12px"} -4px hsl(${palette.shadowHue} / ${
      variant === "dark" ? 0.35 : 0.10
    })`,
  );
  r.style.setProperty(
    "--shadow-card",
    `0 ${variant === "dark" ? "0 40px" : "8px 32px"} -10px hsl(${palette.shadowHue} / ${
      variant === "dark" ? 0.35 : 0.14
    })`,
  );
  /* Card glow color — used by .liquid-card border + glow */
  r.style.setProperty("--glow", palette.shadowHue);

  /* Toggle the .dark class so any `.dark *` rules still trigger */
  if (variant === "dark") r.classList.add("dark");
  else r.classList.remove("dark");
  r.dataset.variant = variant;
};
