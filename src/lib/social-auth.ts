// 🚨 절대 단순화 X — 민트클로젯에서 4번 깨졌다가 4번 복구된 검증 패턴.
// nonce 빼면 → "Passed nonce and nonce in id_token should either both exist or not"
// APPLE_SERVICE_ID 자리에 Bundle ID 박으면 → invalid_client
// GOOGLE_IOS_CLIENT_ID 자리에 Web Client ID 박으면 → unauthorized
import { Capacitor } from "@capacitor/core";
import { AppleSignIn, SignInScope } from "@capawesome/capacitor-apple-sign-in";
import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";
import { supabase } from "@/integrations/supabase/client";

// .env 에 주입
const APPLE_SERVICE_ID = import.meta.env.VITE_APPLE_SERVICE_ID as string | undefined; // ← Services ID, NOT Bundle ID
const GOOGLE_IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID as string | undefined; // ← iOS Client

export async function signInWithProvider(provider: "apple" | "google") {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    if (provider === "apple") {
      // ━━━ Apple Native ━━━
      if (!APPLE_SERVICE_ID) throw new Error("VITE_APPLE_SERVICE_ID not set");
      await AppleSignIn.initialize({ clientId: APPLE_SERVICE_ID }).catch(() => undefined);
      const result = await AppleSignIn.signIn({
        scopes: [SignInScope.Email, SignInScope.FullName],
      });
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: result.idToken,
      });
      if (error) throw error;
      return;
    }

    // ━━━ Google Native with nonce ━━━
    // 🚨 이 nonce 패턴 제거하면 "Passed nonce and nonce in id_token should
    //    either both exist or not" 에러로 깨짐. SDK v9 이 nonce 를 자동
    //    포함하기 때문에 Supabase 가 검증 가능하도록 raw nonce 도 같이 보내야 함.
    if (!GOOGLE_IOS_CLIENT_ID) throw new Error("VITE_GOOGLE_IOS_CLIENT_ID not set");
    const rawNonce = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const hashedNonce = Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawNonce)),
      ),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await GoogleSignIn.initialize({ clientId: GOOGLE_IOS_CLIENT_ID });
    const result = await (GoogleSignIn as any).signIn({ nonce: hashedNonce });
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: result.idToken,
      nonce: rawNonce,
    });
    if (error) throw error;
    return;
  }

  // ━━━ Web / PWA: Supabase managed OAuth ━━━
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}
