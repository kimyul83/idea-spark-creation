import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Breathing from "./pages/Breathing";
import Sounds from "./pages/Sounds";
import Me from "./pages/Me";
import Session from "./pages/Session";
import { AppShell } from "./components/AppShell";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/session/:type/:id" element={<div className="app-shell"><Session /></div>} />
          <Route element={<AppShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/breathing" element={<Breathing />} />
            <Route path="/sounds" element={<Sounds />} />
            <Route path="/me" element={<Me />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
