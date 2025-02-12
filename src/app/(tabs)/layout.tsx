"use client";
import BottomNav from "../components/BottomNav";
import { usePathname } from "next/navigation";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ 특정 페이지에서 네비게이션 숨김
  const hideNavPages = [
    "/home/detail",
    "/tasks/detail",
    "/recruit/detail",
    "/chat/detail",
    "/mypage/settings",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 overflow-auto pb-16">{children}</main>
      {!hideNavPages.some((hiddenPath) => pathname.startsWith(hiddenPath)) && <BottomNav />}
    </div>
  );
}
