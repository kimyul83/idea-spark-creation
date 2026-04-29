import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Heart, Lock, Share2, Sparkles, Star, X } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { Button } from "@/components/ui/button";
import { Moody } from "@/components/Moody";
import { ParticleCanvas, type ParticleHandle } from "@/components/ParticleCanvas";
import { playGlassFx, playRealGlass, vibrate } from "@/lib/sfx";
import {
  GLASS_CATEGORIES,
  GLASS_CLIPS,
  type GlassClip,
} from "@/lib/glass-clips";
import { toCdnUrl } from "@/lib/situation-tracks";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "slice" | "smash" | "asmr";

const COMBO_WINDOW_MS = 1000;
const TODAY_KEY = "moody_glass_today";

/** Read today's tap counter from localStorage. */
function readTodayCount(): number {
  try {
    const raw = localStorage.getItem(TODAY_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    if (date !== new Date().toDateString()) return 0;
    return count || 0;
  } catch { return 0; }
}
function writeTodayCount(n: number) {
  localStorage.setItem(
    TODAY_KEY,
    JSON.stringify({ date: new Date().toDateString(), count: n }),
  );
}

const GlassBreak = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const [tab, setTab] = useState<Tab>("slice");
  const [active, setActive] = useState<GlassClip | null>(null);
  const [taps, setTaps] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [todayCount, setTodayCount] = useState(0);

  const lastTapRef = useRef(0);
  const comboTimerRef = useRef<number>();
  const particlesRef = useRef<ParticleHandle | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionStartRef = useRef(0);

  useEffect(() => { setTodayCount(readTodayCount()); }, []);

  // Load favorites
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("favorites")
        .select("content_id")
        .eq("user_id", user.id)
        .eq("content_type", "glass_clip");
      if (data) setFavorites(new Set(data.map((f) => f.content_id)));
    })();
  }, []);

  const visible = useMemo(
    () => GLASS_CLIPS.filter((c) => c.category === tab),
    [tab],
  );

  const open = (c: GlassClip) => {
    if (c.premium && !isPremium) {
      toast.info(t("glass.premiumTitle"), {
        description: t("glass.premiumSub"),
        action: { label: t("glass.subscribe"), onClick: () => navigate("/subscribe") },
      });
      return;
    }
    setActive(c);
    setTaps(0);
    setCombo(0);
    setRating(0);
    setShowRating(false);
    sessionStartRef.current = Date.now();
  };

  const close = () => {
    setActive(null);
    setShowRating(false);
    if (comboTimerRef.current) window.clearTimeout(comboTimerRef.current);
  };

  const finishWithRating = async (saveRating: number | null) => {
    if (!active) return;
    const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("sessions").insert({
        user_id: user.id,
        session_type: "glass",
        duration_seconds: duration,
        completed: true,
      });
    }
    if (saveRating !== null) {
      const newTotal = todayCount + taps;
      writeTodayCount(newTotal);
      setTodayCount(newTotal);
    }
    close();
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (!active) return;
    let x = 0, y = 0;
    if ("touches" in e && e.touches.length > 0) {
      x = e.touches[0].clientX; y = e.touches[0].clientY;
    } else if ("clientX" in e) {
      x = e.clientX; y = e.clientY;
    }
    particlesRef.current?.spawn(x, y);

    // Combo bookkeeping
    const now = performance.now();
    const inWindow = now - lastTapRef.current < COMBO_WINDOW_MS;
    lastTapRef.current = now;
    setCombo((c) => (inWindow ? c + 1 : 1));
    if (comboTimerRef.current) window.clearTimeout(comboTimerRef.current);
    comboTimerRef.current = window.setTimeout(() => setCombo(0), COMBO_WINDOW_MS + 100);

    // Volume scales gently with combo
    const vol = Math.min(0.7, 0.4 + combo * 0.02);
    // 실제 Epidemic 유리 깨짐 녹음 (8개 중 랜덤)
    playRealGlass(active.category, vol);
    vibrate(active.category === "smash" ? [40, 25, 40] : 25);
    setTaps((t) => t + 1);
  };

  const toggleFav = async (clip: GlassClip) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(t("glass.loginRequired"));
      return;
    }
    const next = new Set(favorites);
    if (next.has(clip.id)) {
      await supabase.from("favorites").delete()
        .eq("user_id", user.id)
        .eq("content_type", "glass_clip")
        .eq("content_id", clip.id);
      next.delete(clip.id);
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id, content_type: "glass_clip", content_id: clip.id,
      });
      next.add(clip.id);
      toast.success(t("glass.favoriteAdded"));
    }
    setFavorites(next);
  };

  return (
    <div className="min-h-screen relative">
      <MonetBackground intensity="medium" emotion="angry" />

      {/* Header */}
      <div className="px-5 pt-12 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full surface flex items-center justify-center"
          aria-label="뒤로"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="chip-primary text-[14px] tracking-[0.3em] uppercase font-serif">
            Release
          </p>
          <h1 className="text-[28px] font-bold text-foreground leading-tight">유리 깨기</h1>
        </div>
        <div className="liquid-card px-3 py-2 text-right">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("glass.today")}</div>
          <div className="text-base font-bold text-primary leading-none">{todayCount}</div>
        </div>
      </div>

      {/* Moody intro */}
      <div className="px-5 mt-5 flex items-center gap-3">
        <Moody size={120} emotion="surprised" />
        <div className="text-sm text-foreground/80">
          <p className="font-medium">{t("glass.intro")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("glass.introSub")}
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-5 mt-6">
        <div className="liquid-card p-1 grid grid-cols-3 gap-1">
          {GLASS_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              className={cn(
                "py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                tab === c.id
                  ? "bg-primary text-primary-foreground shadow-[0_0_18px_-4px_hsl(var(--glow)/0.6)]"
                  : "text-foreground/70 hover:text-foreground",
              )}
            >
              <c.Icon className="w-4 h-4" strokeWidth={1.8} />{t(`glass.tabs.${c.id}`, { defaultValue: c.label })}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 px-1">
          {t(`glass.tagline.${tab}`, { defaultValue: GLASS_CATEGORIES.find((c) => c.id === tab)?.tagline })}
        </p>
      </div>

      {/* Grid */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3 pb-12">
        {visible.map((c) => {
          const locked = c.premium && !isPremium;
          const isFav = favorites.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => open(c)}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-card transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] text-left liquid-card-hover"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(160deg, hsl(${c.hue} 55% 82% / 0.55) 0%, hsl(${c.hue + 20} 45% 72% / 0.35) 100%)`,
                  backdropFilter: "blur(16px)",
                }}
              />
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M50 50 L20 10 M50 50 L80 15 M50 50 L90 60 M50 50 L60 95 M50 50 L10 80" stroke="white" strokeWidth="0.5" fill="none" />
                <path d="M50 50 L35 30 M50 50 L70 40 M50 50 L65 70 M50 50 L30 60" stroke="white" strokeWidth="0.3" fill="none" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/15" />

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                {c.badge && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider",
                    c.badge === "HOT" ? "bg-rose-500 text-white" : "bg-primary text-primary-foreground",
                  )}>
                    {c.badge}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-white/20 backdrop-blur-sm text-white tracking-wider">
                  {t("common.coming")}
                </span>
              </div>

              {locked && (
                <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {!locked && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(c); }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
                  aria-label="즐겨찾기"
                >
                  <Heart className={cn("w-3.5 h-3.5", isFav ? "fill-rose-400 text-rose-400" : "text-white")} />
                </button>
              )}

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="font-bold text-[15px] drop-shadow">{c.title}</div>
                <div className="text-[11px] opacity-80 drop-shadow">{c.hint}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fullscreen player */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden select-none">
          {/* Background — video w/ fallback gradient.
              videoSrc는 /videos/glass/.../foo.mp4 로컬 경로 → CDN URL 로 변환 (Lovable 서빙 제한 우회). */}
          <video
            ref={videoRef}
            src={toCdnUrl(active.videoSrc)}
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            onError={() => { /* missing file → fallback gradient stays */ }}
          />
          <div
            className="absolute inset-0 -z-0"
            style={{
              background: `radial-gradient(circle at 50% 45%, hsl(${active.hue} 65% 55%) 0%, hsl(${active.hue} 40% 12%) 65%, #050505 100%)`,
            }}
          />
          {/* Combo glow ring */}
          {combo > 1 && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle at 50% 50%, hsl(${active.hue} 100% 70% / ${Math.min(0.35, combo * 0.04)}) 0%, transparent 60%)`,
              }}
            />
          )}

          {/* Tap surface + particles */}
          <div
            className="absolute inset-0 z-10"
            onClick={handleTap}
            onTouchStart={handleTap}
          >
            <ParticleCanvas
              category={active.category}
              hue={active.hue}
              handleRef={particlesRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </div>

          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 flex items-center gap-2 pointer-events-none">
            <button
              onClick={(e) => { e.stopPropagation(); setShowRating(true); }}
              className="pointer-events-auto w-11 h-11 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <button
              onClick={(e) => { e.stopPropagation(); toggleFav(active); }}
              className="pointer-events-auto w-11 h-11 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white"
              aria-label="즐겨찾기"
            >
              <Heart className={cn("w-5 h-5", favorites.has(active.id) ? "fill-rose-400 text-rose-400" : "")} />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  if (navigator.share) {
                    await navigator.share({ title: active.title, text: "유리 깨기 – Moody" });
                  } else {
                    toast.info(t("glass.shareUnsupported"));
                  }
                } catch { /* user cancel */ }
              }}
              className="pointer-events-auto w-11 h-11 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white"
              aria-label="공유"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Combo HUD */}
          {combo > 1 && (
            <div className="absolute top-28 right-5 z-20 pointer-events-none animate-fade-in">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/70">Combo</div>
                <div
                  className="font-extrabold text-3xl text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                  style={{ color: `hsl(${active.hue} 100% 80%)` }}
                >
                  ×{combo}
                </div>
              </div>
            </div>
          )}

          {/* Bottom hint */}
          <div className="absolute bottom-8 left-0 right-0 z-20 text-center pointer-events-none">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t("glass.tapHint", { count: taps })}</span>
            </div>
          </div>

          {/* Rating modal */}
          {showRating && (
            <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="liquid-card w-full max-w-sm p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Moody size={180} emotion="happy" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t("glass.rateTitle")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("glass.rateSub", { count: taps })}
                </p>

                <div className="flex items-center justify-center gap-1.5 mt-5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className="p-1"
                      aria-label={`${n}점`}
                    >
                      <Star
                        className={cn(
                          "w-7 h-7 transition-all",
                          n <= rating ? "fill-yellow-400 text-yellow-400 scale-110" : "text-foreground/30",
                        )}
                      />
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    onClick={() => { setTaps(0); setShowRating(false); }}
                    variant="ghost"
                    className="w-full h-12 rounded-2xl"
                  >
                    {t("glass.again")}
                  </Button>
                  <Button
                    onClick={() => { finishWithRating(rating || null); }}
                    className="w-full h-12 rounded-2xl btn-primary text-primary-foreground font-semibold"
                  >
                    {t("glass.watchOther")}
                  </Button>
                  <Button
                    onClick={() => { finishWithRating(rating || null); navigate("/home"); }}
                    variant="ghost"
                    className="w-full h-12 rounded-2xl text-muted-foreground"
                  >
                    {t("glass.home")}
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                  {t("glass.afterMessage")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlassBreak;
