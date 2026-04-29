import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Moody } from "@/components/Moody";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * 베타 테스터 코드 게이트.
 *
 * 4명만 테스트할 수 있도록 4개의 고유 코드를 발급.
 * 각 친구한테 다른 코드를 주면, 코드별로 어느 친구가 어떻게 썼는지 구분 가능.
 *
 * 코드는 입력하면 localStorage에 저장 → 다음 방문엔 게이트 안 뜸.
 * Supabase 등 서버 기록은 안 함 (베타 테스트 단순화 목적).
 */
const VALID_CODES: Record<string, string> = {
  "MINT": "친구 1 (민트)",
  "AQUA": "친구 2 (아쿠아)",
  "MOON": "친구 3 (문)",
  "STAR": "친구 4 (스타)",
};

const STORAGE_KEY = "moody_tester_code";

export const isTesterUnlocked = (): boolean => {
  if (typeof window === "undefined") return false;
  const code = localStorage.getItem(STORAGE_KEY);
  return code !== null && Object.keys(VALID_CODES).includes(code);
};

interface TesterGateProps {
  children: React.ReactNode;
}

export const TesterGate = ({ children }: TesterGateProps) => {
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUnlocked(isTesterUnlocked());
    setChecking(false);
  }, []);

  if (checking) {
    return null;
  }

  if (unlocked) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = input.trim().toUpperCase();
    if (code in VALID_CODES) {
      localStorage.setItem(STORAGE_KEY, code);
      setUnlocked(true);
    } else {
      setError(t("tester.wrongCode"));
      setInput("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#050505] via-[#0A1525] to-[#0A0A0A] text-white">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-up">
        <Moody size={320} emotion="default" />

        <p className="text-[11px] tracking-[0.3em] uppercase text-[#4AEBFB] font-serif mt-6">
          {t("tester.label")}
        </p>
        <h1 className="text-3xl font-bold mt-2">
          {t("tester.title")}
        </h1>
        <p className="text-sm text-white/60 mt-3 leading-relaxed">
          {t("tester.betaInfo")}<br />
          {t("tester.inviteOnly")} 🫧
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-8 space-y-3">
          <Input
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            placeholder={t("tester.codeInput")}
            value={input}
            onChange={(e) => { setInput(e.target.value); if (error) setError(null); }}
            maxLength={6}
            className="h-14 text-center text-xl tracking-[0.4em] font-bold uppercase
              bg-white/5 border-white/10 text-white
              placeholder:text-white/30 placeholder:tracking-[0.2em] placeholder:text-sm
              focus-visible:ring-[#00D9E8] focus-visible:ring-2 focus-visible:border-transparent"
          />
          {error && (
            <p className="text-xs text-red-400 -mt-1">{error}</p>
          )}
          <Button
            type="submit"
            disabled={input.trim().length < 3}
            className="w-full h-14 rounded-2xl text-base font-bold
              bg-gradient-to-br from-[#00D9E8] to-[#0077B6]
              hover:brightness-110 transition
              shadow-[0_0_24px_-4px_rgba(0,217,232,0.5)]
              disabled:opacity-30 disabled:bg-white/5 disabled:bg-none disabled:shadow-none"
          >
            {t("tester.enter")}
          </Button>
        </form>

        <p className="text-xs text-white/40 mt-6">
          {t("tester.noCode")}
        </p>
      </div>
    </div>
  );
};
