"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Newspaper, MapPin, MessageSquare, User } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white touch-none">
      <div className="mx-auto grid h-[72px] max-w-lg grid-cols-5">
        <Link
          href="/home"
          className={`flex flex-col items-center justify-center ${
            isActive("/home") ? "text-primary" : "text-gray-600"
          }`}
        >
          <Home strokeWidth={1.5} className="h-6 w-6" />
          <span className="mt-1 text-xs">홈</span>
        </Link>

        <Link
          href="/tasks"
          className={`flex flex-col items-center justify-center ${
            isActive("/tasks") ? "text-primary" : "text-gray-600"
          }`}
        >
          <Newspaper strokeWidth={1.5} className="h-6 w-6" />
          <span className="mt-1 text-xs">작업현황</span>
        </Link>

        <Link
          href="/recruit"
          className={`flex flex-col items-center justify-center ${
            isActive("/recruit") ? "text-primary" : "text-gray-600"
          }`}
        >
          <MapPin strokeWidth={1.5} className="h-6 w-6" />
          <span className="mt-1 text-xs">구인등록</span>
        </Link>

        <Link
          href="/chat"
          className={`flex flex-col items-center justify-center ${
            isActive("/chat") ? "text-primary" : "text-gray-600"
          }`}
        >
          <MessageSquare strokeWidth={1.5} className="h-6 w-6" />
          <span className="mt-1 text-xs">채팅</span>
        </Link>

        <Link
          href="/mypage"
          className={`flex flex-col items-center justify-center ${
            isActive("/mypage") ? "text-primary" : "text-gray-600"
          }`}
        >
          <User strokeWidth={1.5} className="h-6 w-6" />
          <span className="mt-1 text-xs">마이페이지</span>
        </Link>
      </div>
    </nav>
  )
}

