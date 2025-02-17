"use client";

import { useRouter } from "next/navigation";

export default function SelectHelperPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">해결사 선택</h1>

      <div className="w-full mt-4 p-4 bg-gray-200 rounded-lg">
        <p>✅ 해결사 목록 표시 예정</p>
      </div>

      <button
        onClick={() => alert("공고가 등록되었습니다!")}
        className="mt-4 p-2 bg-gray-500 text-white rounded-lg"
      >
        공고 올리기
      </button>
    </div>
  );
}
