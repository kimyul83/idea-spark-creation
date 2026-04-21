import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  applyPalette,
  PRESET_LIST,
  THEME_PRESETS,
  ThemePresetId,
  ThemeVariant,
} from "@/lib/theme-presets";
import { supabase } from "@/integrations/supabase/client";

/**
 * Theme system
 * ─────────────
 * `mode`   = how to choose a variant
 *    auto    → time-of-day flips between dawn(light) and dusk(dark)
 *    light   → always light variant
 *    dark    → always dark variant
 *    custom  → user-picked preset + variant
 *
 * `preset` = one of 5 brand-locked palettes (used in all modes)
 * `customVariant` = light/dark choice when mode === "custom"
 *
 * Persisted: localStorage + (when signed in) profiles.user_preferences jsonb.
 */
export type ThemeMode = "auto" | "light" | "dark" | "custom";

interface ThemeContextValue {
  mode: ThemeMode;
  preset: ThemePresetId;
  customVariant: ThemeVariant;
  resolvedVariant: ThemeVariant;
  setMode: (m: ThemeMode) => void;
  setPreset: (p: ThemePresetId) => void;
  setCustomVariant: (v: ThemeVariant) => void;
  /** Human label for current state — for badges. */
  label: string;
}

const STORAGE = {
  mode: "moodie_theme_mode",
  preset: "moodie_theme_preset",
  customVariant: "moodie_theme_custom_variant",
  /** legacy key from previous version */
  legacyPref: "moodie_theme_pref",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const computeAutoVariant = (): ThemeVariant => {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? "light" : "dark";
};

const readStored = <T extends string>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  return (localStorage.getItem(key) as T | null) ?? fallback;
};

/** One-time migration of the previous "auto / dawn / dusk" preference. */
const migrateLegacyPref = (): { mode: ThemeMode } | null => {
  if (typeof window === "undefined") return null;
  const legacy = localStorage.getItem(STORAGE.legacyPref);
  if (!legacy) return null;
  const map: Record<string, ThemeMode> = { auto: "auto", dawn: "light", dusk: "dark" };
  const next = map[legacy] ?? "auto";
  localStorage.setItem(STORAGE.mode, next);
  localStorage.removeItem(STORAGE.legacyPref);
  return { mode: next };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const migrated = migrateLegacyPref();
    if (migrated) return migrated.mode;
    return readStored<ThemeMode>(STORAGE.mode, "auto");
  });
  const [preset, setPresetState] = useState<ThemePresetId>(() =>
    readStored<ThemePresetId>(STORAGE.preset, "tiffany"),
  );
  const [customVariant, setCustomVariantState] = useState<ThemeVariant>(() =>
    readStored<ThemeVariant>(STORAGE.customVariant, "light"),
  );
  const [autoVariant, setAutoVariant] = useState<ThemeVariant>(() => computeAutoVariant());
  const hasHydratedFromCloud = useRef(false);

  /* Resolve which variant to actually render */
  const resolvedVariant: ThemeVariant = useMemo(() => {
    if (mode === "auto") return autoVariant;
    if (mode === "light") return "light";
    if (mode === "dark") return "dark";
    return customVariant;
  }, [mode, autoVariant, customVariant]);

  /* Apply palette → CSS vars */
  useEffect(() => {
    const p = THEME_PRESETS[preset] ?? THEME_PRESETS.tiffany;
    const palette = resolvedVariant === "dark" ? p.dark : p.light;
    /* Smooth transition */
    document.documentElement.classList.add("transition-colors", "duration-700");
    applyPalette(palette, resolvedVariant);
  }, [preset, resolvedVariant]);

  /* Auto-mode: poll once a minute */
  useEffect(() => {
    if (mode !== "auto") return;
    const tick = () => setAutoVariant(computeAutoVariant());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [mode]);

  /* Hydrate from profiles.user_preferences once a session is available */
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (!session?.user || hasHydratedFromCloud.current) return;
      hasHydratedFromCloud.current = true;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("user_preferences")
          .eq("id", session.user.id)
          .maybeSingle();
        const prefs = (data?.user_preferences as any) ?? {};
        if (prefs.theme_mode) setModeState(prefs.theme_mode);
        if (prefs.theme_preset) setPresetState(prefs.theme_preset);
        if (prefs.theme_custom_variant) setCustomVariantState(prefs.theme_custom_variant);
      } catch {
        /* silent — fall back to local */
      }
    });
    /* Also try immediately for already-signed-in users */
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user || hasHydratedFromCloud.current) return;
      hasHydratedFromCloud.current = true;
      const { data: row } = await supabase
        .from("profiles")
        .select("user_preferences")
        .eq("id", data.session.user.id)
        .maybeSingle();
      const prefs = (row?.user_preferences as any) ?? {};
      if (prefs.theme_mode) setModeState(prefs.theme_mode);
      if (prefs.theme_preset) setPresetState(prefs.theme_preset);
      if (prefs.theme_custom_variant) setCustomVariantState(prefs.theme_custom_variant);
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  /* Persist + push to cloud on change */
  const persist = (patch: {
    mode?: ThemeMode;
    preset?: ThemePresetId;
    customVariant?: ThemeVariant;
  }) => {
    if (patch.mode !== undefined) localStorage.setItem(STORAGE.mode, patch.mode);
    if (patch.preset !== undefined) localStorage.setItem(STORAGE.preset, patch.preset);
    if (patch.customVariant !== undefined)
      localStorage.setItem(STORAGE.customVariant, patch.customVariant);

    /* fire-and-forget cloud sync */
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) return;
      const next = {
        theme_mode: patch.mode ?? mode,
        theme_preset: patch.preset ?? preset,
        theme_custom_variant: patch.customVariant ?? customVariant,
      };
      supabase
        .from("profiles")
        .update({ user_preferences: next as any })
        .eq("id", uid)
        .then(() => {});
    });
  };

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    persist({ mode: m });
  };
  const setPreset = (p: ThemePresetId) => {
    setPresetState(p);
    persist({ preset: p });
  };
  const setCustomVariant = (v: ThemeVariant) => {
    setCustomVariantState(v);
    persist({ customVariant: v });
  };

  const label = useMemo(() => {
    const presetName = THEME_PRESETS[preset]?.name ?? "Tiffany";
    if (mode === "auto") return `자동 · ${resolvedVariant === "light" ? "Dawn" : "Dusk"}`;
    if (mode === "light") return `라이트 · ${presetName}`;
    if (mode === "dark") return `다크 · ${presetName}`;
    return `커스텀 · ${presetName} ${customVariant === "light" ? "라이트" : "다크"}`;
  }, [mode, preset, customVariant, resolvedVariant]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      preset,
      customVariant,
      resolvedVariant,
      setMode,
      setPreset,
      setCustomVariant,
      label,
    }),
    [mode, preset, customVariant, resolvedVariant, label],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};

export { PRESET_LIST };
