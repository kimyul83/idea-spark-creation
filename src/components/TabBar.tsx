import { NavLink } from "react-router-dom";
import { Home, Music, Wind, Moon, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 하단 탭바 — 6개.
 * 홈/음악/호흡/수면/깨기/마이.
 * 수면: 타이머 설정 + 자장가 사운드 장시간 재생.
 */
const tabs = [
  { to: "/home", label: "홈", Icon: Home },
  { to: "/music", label: "음악", Icon: Music },
  { to: "/breathing", label: "호흡", Icon: Wind },
  { to: "/sleep", label: "수면", Icon: Moon },
  { to: "/release/glass", label: "깨기", Icon: Sparkles },
  { to: "/me", label: "마이", Icon: User },
];

export const TabBar = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-40">
      <div
        className="mx-3 mb-3 rounded-[28px] bg-white/55 dark:bg-[hsl(217_53%_9%/0.7)] backdrop-blur-2xl border border-white/60 dark:border-white/10"
        style={{
          boxShadow:
            "0 12px 36px -8px hsl(var(--shadow-hue, 217 33% 15%) / 0.18), inset 0 1px 0 hsl(0 0% 100% / 0.5)",
        }}
      >
        <ul className="grid grid-cols-6">
          {tabs.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-300",
                    isActive ? "text-primary" : "text-foreground/55"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "p-2 rounded-2xl transition-all duration-300",
                        isActive && "bg-primary/15 scale-110"
                      )}
                    >
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </div>
                    <span className="text-[10px] font-medium">{label}</span>
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
