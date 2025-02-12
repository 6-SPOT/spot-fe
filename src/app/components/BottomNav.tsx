"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Briefcase, MessageCircle, User } from "lucide-react";

const tabs = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/tasks", label: "작업현황", icon: ClipboardList },
  { href: "/recruit", label: "구인등록", icon: Briefcase },
  { href: "/chat", label: "채팅", icon: MessageCircle },
  { href: "/mypage", label: "마이페이지", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 z-50">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center text-sm ${pathname === href ? "text-blue-500" : "text-gray-500"}`}
        >
          <Icon className="w-6 h-6" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
