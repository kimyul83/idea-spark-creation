import { NavLink } from "react-router-dom";
import { Home, Wind, Music, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "홈", Icon: Home },
  { to: "/breathing", label: "호흡", Icon: Wind },
  { to: "/sounds", label: "사운드", Icon: Music },
  { to: "/me", label: "마이", Icon: User },
];

export const TabBar = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-40">
      <div className="mx-3 mb-3 surface rounded-3xl shadow-card">
        <ul className="grid grid-cols-4">
          {tabs.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-1 py-3 transition-all duration-300",
                    isActive ? "text-charcoal" : "text-charcoal/40"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "p-2 rounded-2xl transition-all duration-300",
                        isActive && "bg-sage/50 scale-110"
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <span className="text-[11px] font-medium">{label}</span>
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
