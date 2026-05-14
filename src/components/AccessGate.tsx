import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Moody } from "@/components/Moody";
import { MonetBackground } from "@/components/MonetBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ACCESS_KEY = "mintwave_access";
const ACCESS_CODE = "mint";

export const AccessGate = ({ children }: { children: React.ReactNode }) => {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return true;
    if (Capacitor.isNativePlatform()) return true;
    return localStorage.getItem(ACCESS_KEY) === "1";
  });
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!unlocked) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [unlocked]);

  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toLowerCase() === ACCESS_CODE) {
      localStorage.setItem(ACCESS_KEY, "1");
      setUnlocked(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setCode("");
    }
  };

  return (
    <div className="app-shell flex flex-col items-center justify-center relative min-h-[100dvh] px-8">
      <MonetBackground intensity="strong" />
      <Moody size="large" />
      <p className="mt-6 text-xs tracking-[0.3em] uppercase text-primary font-medium font-serif">
        MINT WAVE
      </p>
      <h1 className="mt-3 text-2xl font-bold text-foreground text-center">
        Private Beta
      </h1>
      <p className="mt-3 text-sm text-foreground/60 text-center max-w-xs">
        초대 코드를 입력해 주세요
      </p>
      <form
        onSubmit={submit}
        className={`mt-8 w-full max-w-xs space-y-3 ${shake ? "animate-shake" : ""}`}
      >
        <Input
          autoFocus
          type="text"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="access code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-12 rounded-2xl bg-section/90 border-border text-foreground text-center tracking-widest"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          Enter
        </Button>
      </form>
    </div>
  );
};
