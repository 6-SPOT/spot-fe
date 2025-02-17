"use client";

import { useParams, useRouter } from "next/navigation";

export default function TaskInProgressPage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">이거 해주세요</h1>

      <div className="w-full mt-4 p-4 bg-gray-200 rounded-lg">
        <p>📌 해야 할 일</p>
        <p>📷 사진 인증</p>
      </div>

      <div className="mt-4 flex space-x-2">
        <button className="flex-1 bg-blue-500 text-white p-2 rounded-lg">채팅 이동</button>
        <button className="flex-1 bg-green-500 text-white p-2 rounded-lg">완료</button>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-4 p-2 bg-gray-300 rounded-lg"
      >
        뒤로 가기
      </button>
    </div>
  );
}
