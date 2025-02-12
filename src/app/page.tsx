"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return <div className="p-5 text-center text-xl">로딩 중...</div>;
}
