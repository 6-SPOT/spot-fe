import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.spot.app",
  appName: "Spot Project",
  webDir: "out", // Next.js 빌드 폴더
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    url: "http://172.16.24.186:3000", // Next.js 개발 서버 연결
    cleartext: true, // HTTP 허용 (Android에서 필요)
  },
  android: {
    backgroundColor: "#ffffff", // ✅ Android 앱의 배경색 설정 (필수 아님)
    overrideUserAgent:
      "Mozilla/5.0 (Linux; Android 10; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.104 Mobile Safari/537.36",
    appendUserAgent: " Capacitor",
    resolveServiceWorkerRequests: true, // ✅ 서비스 워커 지원
  },
  ios: {
    overrideUserAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1",
    appendUserAgent: " Capacitor",
    scrollEnabled: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true, // ✅ Capacitor의 HTTP 요청 기능 활성화
    },
    StatusBar: {
      overlaysWebView: false, // ✅ 올바른 속성 사용하여 WebView와 상태바가 겹치지 않도록 설정
      style: "dark", // ✅ 상태바 스타일 다크 모드 지원
      backgroundColor: "#ffffff", // ✅ 상태바 배경색 설정
    },
  },
};

export default config;
