import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TesterGate } from "./components/TesterGate";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <TesterGate>
      <App />
    </TesterGate>
  </ThemeProvider>
);
