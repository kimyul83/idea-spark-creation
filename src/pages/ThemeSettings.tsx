import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Moon, Palette, Sun, Wand2 } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { useTheme } from "@/contexts/ThemeContext";
import { PRESET_LIST, ThemePresetId, ThemeVariant } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

type ModeOption = {
  id: "auto" | "light" | "dark" | "custom";
  label: string;
  desc: string;
  Icon: typeof Sun;
};

const MODES: ModeOption[] = [
  { id: "auto", label: "자동", desc: "시간대에 맞춰 자동 전환", Icon: Wand2 },
  { id: "light", label: "라이트", desc: "항상 밝게", Icon: Sun },
  { id: "dark", label: "다크", desc: "항상 어둡게", Icon: Moon },
  { id: "custom", label: "커스텀", desc: "원하는 색감으로", Icon: Palette },
];

const ThemeSettings = () => {
  const navigate = useNavigate();
  const { mode, preset, customVariant, label, setMode, setPreset, setCustomVariant } =
    useTheme();

  return (
    <div className="app-shell relative min-h-[100dvh] pb-16">
      <MonetBackground intensity="soft" />

      {/* Header */}
      <header className="px-5 pt-10 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="w-10 h-10 rounded-2xl surface flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/50 font-serif">
            Settings
          </p>
          <h1 className="text-[22px] font-bold text-foreground leading-tight">
            테마
          </h1>
        </div>
        <span className="text-[10px] tracking-widest uppercase text-primary font-medium">
          {label}
        </span>
      </header>

      {/* Mode list */}
      <section className="px-5 mt-6 space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-foreground/40 px-1 mb-1">
          모드
        </p>
        {MODES.map(({ id, label: l, desc, Icon }) => {
          const selected = mode === id;
          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-3xl border transition-all text-left",
                selected
                  ? "bg-primary/10 border-primary/40 shadow-soft"
                  : "surface border-transparent",
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                  selected ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70",
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-[15px]">{l}</p>
                <p className="text-xs text-foreground/55 mt-0.5">{desc}</p>
              </div>
              {selected && (
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* Custom-only options */}
      {mode === "custom" && (
        <section className="px-5 mt-6 space-y-3 animate-fade-up">
          <p className="text-[11px] uppercase tracking-widest text-foreground/40 px-1">
            컬러 테마
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESET_LIST.map((p) => (
              <PresetCard
                key={p.id}
                presetId={p.id}
                variant={customVariant}
                selected={preset === p.id}
                onSelect={() => setPreset(p.id)}
              />
            ))}
          </div>

          {/* Light / Dark segment */}
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-widest text-foreground/40 px-1 mb-2">
              밝기
            </p>
            <div className="grid grid-cols-2 gap-1.5 bg-foreground/5 p-1 rounded-2xl">
              {(["light", "dark"] as ThemeVariant[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setCustomVariant(v)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                    customVariant === v
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/60",
                  )}
                >
                  {v === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {v === "light" ? "라이트" : "다크"}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live tip */}
      <p className="px-5 mt-8 text-[11px] text-foreground/45 leading-relaxed">
        선택은 즉시 앱 전체에 적용돼요. 로그인 상태라면 다른 기기에서도 같은 테마로
        이어집니다.
      </p>
    </div>
  );
};

interface PresetCardProps {
  presetId: ThemePresetId;
  variant: ThemeVariant;
  selected: boolean;
  onSelect: () => void;
}

const PresetCard = ({ presetId, variant, selected, onSelect }: PresetCardProps) => {
  const preset = PRESET_LIST.find((p) => p.id === presetId)!;
  const palette = variant === "dark" ? preset.dark : preset.light;
  const [bg, accent1, accent2] = palette.swatches;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative rounded-3xl p-3 border-2 transition-all text-left overflow-hidden",
        selected
          ? "border-primary shadow-card scale-[1.01]"
          : "border-transparent surface",
      )}
      style={{ background: bg }}
    >
      {/* Preview gradient */}
      <div
        className="h-16 rounded-2xl mb-3"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent1}66, transparent 70%), radial-gradient(circle at 70% 70%, ${accent2}66, transparent 70%), ${bg}`,
        }}
      />
      {/* Swatches */}
      <div className="flex items-center gap-1.5 mb-2">
        {palette.swatches.map((c, i) => (
          <span
            key={i}
            className="w-4 h-4 rounded-full ring-1 ring-black/10"
            style={{ background: c }}
          />
        ))}
      </div>
      <p
        className="text-sm font-semibold leading-tight"
        style={{ color: `hsl(${palette.foreground})` }}
      >
        {preset.name}
      </p>
      <p
        className="text-[10px] mt-0.5"
        style={{ color: `hsl(${palette.foregroundMuted})` }}
      >
        {preset.description}
      </p>

      {selected && (
        <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-soft">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

export default ThemeSettings;
