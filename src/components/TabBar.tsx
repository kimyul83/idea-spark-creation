import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Music, Wind, Moon, User } from "lucide-react";
import { cn } from "@/lib/utils";

// v1.0 출시 — 유리깨기(/release/glass) 탭 숨김. 라우트는 살아있지만 진입 경로 없음.
const TAB_DEFS = [
  { to: "/home",         key: "home",      Icon: Home },
  { to: "/music",        key: "music",     Icon: Music },
  { to: "/breathing",    key: "breathing", Icon: Wind },
  { to: "/sleep",        key: "sleep",     Icon: Moon },
  { to: "/me",           key: "me",        Icon: User },
] as const;

export const TabBar = () => {
  const { t } = useTranslation();
  const tabs = TAB_DEFS.map((tab) => ({ ...tab, label: t(`tabs.${tab.key}`) }));
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-40">
      <div
        className="mx-3 mb-2 rounded-[24px] bg-white/55 dark:bg-[hsl(217_53%_9%/0.7)] backdrop-blur-2xl border border-white/60 dark:border-white/10"
        style={{
          boxShadow:
            "0 12px 36px -8px hsl(var(--shadow-hue, 217 33% 15%) / 0.18), inset 0 1px 0 hsl(0 0% 100% / 0.5)",
        }}
      >
        <ul className="grid grid-cols-5">
          {tabs.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1.5 transition-all duration-300",
                    isActive ? "text-primary" : "text-foreground/55"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "p-1.5 rounded-xl transition-all duration-300",
                        isActive && "bg-primary/15 scale-110"
                      )}
                    >
                      <Icon className="w-[16px] h-[16px]" strokeWidth={1.8} />
                    </div>
                    <span className="text-[9px] font-medium">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
