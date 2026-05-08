// 이 파일은 원래 Lovable 자동생성이지만, OAuth 가 Lovable cloud-auth 거쳐가는 걸 막기
// 위해 Supabase 직접 호출로 교체. Lovable 이 Onboarding.tsx 자동 재생성해도 안전.

import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft",
      opts?: SignInOptions,
    ) => {
      // microsoft 는 Supabase 미지원 → 무시
      if (provider === "microsoft") {
        return { error: new Error("Microsoft 로그인 미지원") };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri,
        },
      });

      if (error) {
        return { error };
      }
      // signInWithOAuth 성공 시 브라우저가 provider 페이지로 리다이렉트됨
      return { redirected: true };
    },
  },
};
