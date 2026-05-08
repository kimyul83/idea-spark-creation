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
      // 600ms 로 줄임 — 무디 캐릭터만 살짝 보이고 빠르게 앱 진입.
      launchShowDuration: 600,
      // 페이지 배경(cream/light)에 맞춰 자연스럽게 트랜지션.
      backgroundColor: "#F2FBFC",
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
