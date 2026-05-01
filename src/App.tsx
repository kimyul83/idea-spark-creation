import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Breathing from "./pages/Breathing";
import BreathingSession from "./pages/BreathingSession";
import Music from "./pages/Music";
import MusicPlay from "./pages/MusicPlay";
import Me from "./pages/Me";
import Sleep from "./pages/Sleep";
import Session from "./pages/Session";
import Adhd from "./pages/Adhd";
import GlassBreak from "./pages/GlassBreak";
import Subscribe from "./pages/Subscribe";
import AuthCallback from "./pages/AuthCallback";
import ThemeSettings from "./pages/ThemeSettings";
import LanguageSettings from "./pages/LanguageSettings";
import Admin from "./pages/Admin";
import { AppShell } from "./components/AppShell";
import { InstallPrompt } from "./components/InstallPrompt";
import { useEffect } from "react";
import { trackVisit } from "@/lib/track-visit";
import { initRevenueCat, setRevenueCatUser } from "@/lib/revenuecat";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

/** 방문 추적 트리거 — 앱 마운트 시 1회. */
const VisitTracker = () => {
  useEffect(() => { trackVisit(); }, []);
  return null;
};

/** RevenueCat 초기화 — 네이티브 환경 + API 키 있을 때만. 웹에선 no-op. */
const RevenueCatInitializer = () => {
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id ?? null;
      if (!mounted) return;
      const ok = await initRevenueCat(userId);
      if (!ok) return;
      // 로그인 상태 변경 시 RevenueCat 사용자 동기화
      supabase.auth.onAuthStateChange((_e, sess) => {
        setRevenueCatUser(sess?.user.id ?? null);
      });
    })();
    return () => { mounted = false; };
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" />
      <VisitTracker />
      <RevenueCatInitializer />
      <InstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/session/:type/:id" element={<div className="app-shell"><Session /></div>} />
          <Route path="/breathing/session/:id" element={<div className="app-shell"><BreathingSession /></div>} />
          <Route path="/focus/adhd" element={<div className="app-shell"><Adhd /></div>} />
          <Route path="/music/:id" element={<div className="app-shell"><MusicPlay /></div>} />
          <Route path="/subscribe" element={<div className="app-shell"><Subscribe /></div>} />
          <Route path="/settings/theme" element={<ThemeSettings />} />
          <Route path="/settings/language" element={<div className="app-shell"><LanguageSettings /></div>} />
          <Route path="/admin" element={<div className="app-shell"><Admin /></div>} />
          <Route element={<AppShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/music" element={<Music />} />
            <Route path="/breathing" element={<Breathing />} />
            <Route path="/release/glass" element={<GlassBreak />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/me" element={<Me />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
