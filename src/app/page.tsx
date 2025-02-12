"use client";
import { useEffect } from "react";
import { StatusBar } from "@capacitor/status-bar";

export default function Home() {
  useEffect(() => {
    const setStatusBarAndScroll = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });

        // ✅ iOS에서 강제 스크롤 활성화
        document.body.style.overflow = "auto";
        document.body.style.height = "200vh"; // ✅ 강제로 스크롤 가능하도록 확장
        document.documentElement.style.overflow = "auto";
        document.documentElement.style.height = "200vh";
      } catch (error) {
        console.error("Error setting status bar:", error);
      }
    };
    setStatusBarAndScroll();
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      ✅ Next.js + Tailwind CSS + Capacitor 적용됨!  
      <br />
      스크롤이 되는지 확인하세요.
    </div>
  );
}
