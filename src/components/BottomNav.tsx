"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-100 p-4 shadow-md flex justify-around items-center">
      <Link href="/home" className={pathname === "/home" ? "text-blue-500" : ""}>🏠 홈</Link>
      <Link href="/tasks" className={pathname === "/tasks" ? "text-blue-500" : ""}>📋 업무</Link>
      <Link href="/recruit" className={pathname === "/recruit" ? "text-blue-500" : ""}>🔍 모집</Link>
      <Link href="/chat" className={pathname === "/chat" ? "text-blue-500" : ""}>⌨️채팅</Link>
      <Link href="/mypage" className={pathname === "/mypage" ? "text-blue-500" : ""}>👤 마이페이지</Link>
    </div>
  );
}
