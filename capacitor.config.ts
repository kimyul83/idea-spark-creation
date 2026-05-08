import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mintwave.app",
  appName: "Mint Wave",
  webDir: "dist",
  // 빌드 후 정적 파일 서빙 — 인터넷 없이도 앱 실행
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    cleartext: false,
  },
  ios: {
    // WebView 배경 — 페이지 로드 전 깜빡임 방지. 페이지 실제 배경(라이트 테마 cream)에 맞춤.
    // 청록(#5FCDD0)은 스플래시에서만 사용, 앱 안에선 페이지가 자체 배경 가짐.
    backgroundColor: "#F2FBFC",
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: "#5FCDD0",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#5FCDD0",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // overlaysWebView: true → 페이지가 status bar 아래까지 확장 (네이티브 모던 룩)
      // backgroundColor 안 지정 → 기존 청록 띠 사라지고 페이지 자체 배경이 보임
      style: "DEFAULT",
      overlaysWebView: true,
    },
  },
};

export default config;
