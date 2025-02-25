import { ReactNode } from "react";
import "../styles/globals.css";
import Script from "next/script";
import ClientNav from "@/components/ClientNav"; // 클라이언트 전용 네비게이션 컴포넌트

export default function Layout({ children }: { children: ReactNode }) {
  const TMAP_API_KEY = process.env.NEXT_PUBLIC_TMAP_API_KEY;

  return (
    <html lang="en" className="h-full w-full">
      <head>
        {/* ✅ jQuery 추가 */}
        <Script src="https://code.jquery.com/jquery-3.2.1.min.js" strategy="beforeInteractive" />
        {/* ✅ Tmap API 스크립트 추가 */}
        <script
          type="text/javascript"
          src={`https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${TMAP_API_KEY}`}
        />
      </head>
      <body className="h-full w-full flex flex-col">
        {/* 뷰 컨테이너: 스크롤 가능 영역 */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>

        {/* 하단 네비게이션 (ClientNav로 제어) */}
        <ClientNav />
      </body>
    </html>
  );
}
