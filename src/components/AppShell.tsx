import { Outlet } from "react-router-dom";
import { TabBar } from "./TabBar";

export const AppShell = () => {
  return (
    <div className="app-shell pb-28">
      <Outlet />
      <TabBar />
    </div>
  );
};
