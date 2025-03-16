"use client";

import { useEffect } from "react";
import useFCM from "@/hooks/useFCM";

export default function ClientFCM() {
  useFCM();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("✅ Service Worker 등록 성공:", registration);
        })
        .catch((err) => console.log("❌ Service Worker 등록 실패:", err));
    }
  }, []);

  return null; // UI 요소 없이 실행만 하는 컴포넌트
}
