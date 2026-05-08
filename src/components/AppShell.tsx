import { Outlet } from "react-router-dom";
import { TabBar } from "./TabBar";

export const AppShell = () => {
  return (
    <div className="app-shell" style={{ paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))" }}>
      <main className="flex flex-col" style={{ minHeight: "calc(100dvh - 92px)" }}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
};
