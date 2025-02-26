"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function ClientNav() {
  const pathname = usePathname();
  const hideNavbarRoutes = ["/splash", "/login"]; // 네비게이션 바 숨길 페이지

  if (hideNavbarRoutes.includes(pathname)) return null; // 숨겨야 하는 경우 렌더링 X

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-md z-50">
      <BottomNav />
    </nav>
  );
}
