"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-blue-500 text-white text-2xl">
      로딩 중...
    </div>
  );
}
