import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mintmoody.app",
  appName: "MintMoody",
  webDir: "dist",
  // 빌드 후 정적 파일 서빙 — 인터넷 없이도 앱 실행
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    cleartext: false,
  },
  ios: {
    // 흰 배경 깜빡임 방지: 앱 배경을 글래스 청록으로
    backgroundColor: "#5FCDD0",
    // WebView 가 자체 스크롤 — pull-to-refresh 비활성화
    contentInset: "always",
    // 외부 링크는 in-app browser 가 아니라 Safari 로 열어 (App Store 정책)
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
      style: "DEFAULT",        // 라이트 테마면 검정 텍스트, 다크면 자동
      backgroundColor: "#5FCDD0",
      overlaysWebView: false,
    },
  },
};

export default config;
