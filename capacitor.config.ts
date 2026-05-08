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
    backgroundColor: "#F2FBFC",
    // \"never\" — WebView 가 자체 스크롤 (contentInset 자동 안 깔림). 페이지가 직접 safe-area 처리.
    contentInset: "never",
    limitsNavigationsToAppBoundDomains: false,
    // 스크롤 시 바운스 효과 (iOS 네이티브 느낌)
    scrollEnabled: true,
  },
  android: {
    backgroundColor: "#5FCDD0",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      // 스플래시 화면 ❌ — 즉시 앱 진입
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#F2FBFC",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
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
