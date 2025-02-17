"use client";

import { useRouter } from "next/navigation";

export default function RecruitPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">구인 등록</h1>

      <div className="w-full mt-4 p-4 bg-gray-200 rounded-lg">
        <p>📌 의뢰 내용</p>
        <p>📍 의뢰 위치</p>
        <p>💰 보수</p>
      </div>

      <button
        onClick={() => router.push("/recruit/select_helper")}
        className="mt-4 p-2 bg-gray-500 text-white rounded-lg"
      >
        해결사 선택
      </button>
    </div>
  );
}
