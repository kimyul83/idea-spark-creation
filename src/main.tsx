import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";  // i18next 초기화 (20개국 언어)
import { ThemeProvider } from "./contexts/ThemeContext";
import { TesterGate } from "./components/TesterGate";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <TesterGate>
      <App />
    </TesterGate>
  </ThemeProvider>
);
