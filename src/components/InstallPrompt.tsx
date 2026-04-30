import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Share, Plus, X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "moody_install_dismissed";
const DISMISS_DAYS = 14; // 14일 동안 다시 안 띄움

type Platform = "ios" | "android" | "desktop" | "unknown";

const detectPlatform = (): Platform => {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  // iPadOS 13+ 가 macOS 처럼 위장 → touch 로 추가 검사
  if (ua.includes("mac") && navigator.maxTouchPoints > 1) return "ios";
  if (ua.includes("android")) return "android";
  return "desktop";
};

const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  // iOS Safari: navigator.standalone, 그 외: matchMedia
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches
  );
};

const isDismissed = (): boolean => {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    if (!v) return false;
    const ts = parseInt(v, 10);
    if (isNaN(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

export const InstallPrompt = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [platform] = useState<Platform>(() => detectPlatform());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 이미 PWA 모드 / 최근 dismiss / 모바일 아닌 데스크탑 → 안 띄움
    if (isStandalone() || isDismissed()) return;
    if (platform === "desktop" || platform === "unknown") return;

    // Android/Chrome: beforeinstallprompt 이벤트 캡쳐
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // 5초 후에 띄우기 (즉시 X 누르는 거 방지 + 사용자가 앱 살짝 둘러보고 나서)
    const timer = window.setTimeout(() => setShow(true), 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(timer);
    };
  }, [platform]);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setShow(false);
    setShowSheet(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android: 네이티브 설치 프롬프트 트리거
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") dismiss();
      setDeferredPrompt(null);
    } else {
      // iOS: 직접 설치 못 하니까 가이드 시트 띄움
      setShowSheet(true);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* 하단 배너 — 탭바 위에 floating */}
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-30",
          "w-[calc(100%-24px)] max-w-[480px]",
          "bottom-[calc(96px+env(safe-area-inset-bottom,0px))]",
          "animate-fade-up",
        )}
      >
        <div className="liquid-card flex items-center gap-3 p-3 pl-4 pr-2 backdrop-blur-2xl bg-primary/10 border-primary/30">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-primary" strokeWidth={1.9} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground leading-tight">
              {t("installPrompt.title")}
            </p>
            <p className="text-[10px] text-foreground/60 mt-0.5 leading-tight line-clamp-1">
              {t("installPrompt.subtitle")}
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold shrink-0 active:scale-95 transition-transform"
          >
            {t("installPrompt.install")}
          </button>
          <button
            onClick={dismiss}
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/70 shrink-0"
            aria-label={t("common.close")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS 가이드 시트 */}
      {showSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center p-5"
          onClick={() => setShowSheet(false)}
        >
          <div
            className="liquid-card w-full max-w-sm p-6 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-primary" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <h2 className="text-[18px] font-bold text-foreground leading-tight">
                  {t("installPrompt.iosTitle")}
                </h2>
                <p className="text-[12px] text-foreground/60 mt-1">
                  {t("installPrompt.iosSubtitle")}
                </p>
              </div>
              <button
                onClick={() => setShowSheet(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3">
              <Step
                n={1}
                Icon={Share}
                text={t("installPrompt.step1")}
              />
              <Step
                n={2}
                Icon={Plus}
                text={t("installPrompt.step2")}
              />
              <Step
                n={3}
                Icon={Smartphone}
                text={t("installPrompt.step3")}
              />
            </ol>

            <button
              onClick={dismiss}
              className="w-full mt-5 h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              {t("installPrompt.gotIt")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const Step = ({ n, Icon, text }: { n: number; Icon: any; text: string }) => (
  <li className="flex items-start gap-3">
    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-[11px] font-bold text-primary">
      {n}
    </div>
    <div className="flex-1 flex items-center gap-2 pt-0.5">
      <Icon className="w-4 h-4 text-foreground/60 shrink-0" strokeWidth={1.8} />
      <p className="text-[13px] text-foreground/85 leading-snug">{text}</p>
    </div>
  </li>
);
