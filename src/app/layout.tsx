import { ReactNode } from "react";
import "../styles/globals.css";
import BottomNav from "@/components/BottomNav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="h-full w-full flex flex-col">
        {/* 뷰 컨테이너: 스크롤 가능 영역 */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>

        {/* 하단 네비게이션 (고정) */}
        <nav className="fixed bottom-0 left-0 w-full bg-white shadow-md z-50">
          <BottomNav />
        </nav>
      </body>
    </html>
  );
}
