import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type ThemeMode = "dawn" | "dusk";
export type ThemePref = "auto" | "dawn" | "dusk";

interface ThemeContextValue {
  mode: ThemeMode;        // resolved (dawn/dusk)
  pref: ThemePref;        // user preference
  setPref: (p: ThemePref) => void;
}

const STORAGE_KEY = "moodie_theme_pref";

const ThemeContext = createContext<ThemeContextValue | null>(null);

const computeAutoMode = (): ThemeMode => {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? "dawn" : "dusk";
};

const resolveMode = (pref: ThemePref): ThemeMode =>
  pref === "auto" ? computeAutoMode() : pref;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [pref, setPrefState] = useState<ThemePref>(() => {
    if (typeof window === "undefined") return "auto";
    return (localStorage.getItem(STORAGE_KEY) as ThemePref) ?? "auto";
  });
  const [mode, setMode] = useState<ThemeMode>(() => resolveMode(pref));

  // Apply / remove .dark class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("transition-colors", "duration-700");
    if (mode === "dusk") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [mode]);

  // Re-check every minute when pref is auto
  useEffect(() => {
    setMode(resolveMode(pref));
    if (pref !== "auto") return;
    const id = window.setInterval(() => {
      setMode((curr) => {
        const next = computeAutoMode();
        return next === curr ? curr : next;
      });
    }, 60_000);
    return () => window.clearInterval(id);
  }, [pref]);

  const setPref = (p: ThemePref) => {
    localStorage.setItem(STORAGE_KEY, p);
    setPrefState(p);
  };

  const value = useMemo(() => ({ mode, pref, setPref }), [mode, pref]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
