/**
 * 방문 추적 — 익명 방문자 + 가입자 모두 카운트.
 *
 * 디바이스마다 localStorage 에 영구 session_id 저장.
 * 앱 마운트 시 한 번 호출 → Supabase RPC track_visit() 가 (session_id, visit_date)
 * 페어로 하루 1 row, visit_count 만 증가시키는 upsert.
 */
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "moody_visit_session_id";
const LAST_TRACKED_KEY = "moody_visit_last_tracked";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id || id.length < 16) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/** 같은 페이지 라이프사이클 안에서 중복 호출 방지. */
let trackedThisSession = false;

export async function trackVisit(opts?: { force?: boolean }) {
  if (typeof window === "undefined") return;
  if (trackedThisSession && !opts?.force) return;

  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;

  // 같은 날에 이미 트래킹했으면 스킵 (페이지 이동 노이즈 방지) — 단, 자정 넘으면 다시 트래킹
  const today = new Date().toISOString().slice(0, 10);
  try {
    const lastDate = localStorage.getItem(LAST_TRACKED_KEY);
    if (lastDate === today && !opts?.force) {
      trackedThisSession = true;
      return;
    }
  } catch {}

  // 현재 사용자 (있으면)
  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    userId = data.session?.user.id ?? null;
  } catch {}

  try {
    await supabase.rpc("track_visit" as any, {
      p_session_id: sessionId,
      p_user_id: userId,
      p_user_agent: navigator.userAgent.slice(0, 500),
      p_referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      p_language: (navigator.language ?? "").slice(0, 16),
    });
    localStorage.setItem(LAST_TRACKED_KEY, today);
    trackedThisSession = true;
  } catch (err) {
    // 마이그레이션 미적용이거나 RLS 문제 — 조용히 실패
    console.warn("[trackVisit] failed:", err);
  }
}
