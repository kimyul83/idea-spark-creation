import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check } from "lucide-react";
import { MonetBackground } from "@/components/MonetBackground";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";
import { cn } from "@/lib/utils";

const LanguageSettings = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const change = (code: string) => {
    i18n.changeLanguage(code);
    // 즉시 페이지 새로고침으로 텍스트 갱신 (i18next는 보통 즉시 반영되지만 안전장치)
    setTimeout(() => navigate("/me"), 250);
  };

  return (
    <div className="px-5 pt-12 pb-6 relative flex-1 flex flex-col gap-4">
      <MonetBackground intensity="soft" />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full liquid-card flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <p className="chip-primary text-[12px] tracking-[0.3em] uppercase font-serif">Language</p>
          <h1 className="text-[28px] font-bold text-foreground mt-1 leading-tight">
            {t("me.language")}
          </h1>
        </div>
      </div>

      <div className="grid gap-2 mt-2">
        {SUPPORTED_LANGUAGES.map((l) => {
          const active = i18n.resolvedLanguage === l.code || i18n.language === l.code;
          return (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className={cn(
                "liquid-card liquid-card-hover w-full p-4 flex items-center gap-3 text-left",
                active && "ring-2 ring-primary/60",
              )}
            >
              <span className="text-[28px] shrink-0">{l.flag}</span>
              <span className="flex-1 font-semibold text-foreground text-[16px]">{l.name}</span>
              {active && <Check className="w-5 h-5 text-primary" strokeWidth={2.4} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSettings;
