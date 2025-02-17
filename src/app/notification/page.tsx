"use client";

import { useRouter } from "next/navigation";

export default function NotificationScreen() {
  const router = useRouter();

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">알림 페이지</h1>

      <div className="w-full mt-4 space-y-4">
        {[1, 2, 3].map((id) => (
          <div key={id} className="p-4 border-b">
            <h2 className="font-semibold">알림 제목 {id}</h2>
            <p>알림 내용</p>
          </div>
        ))}
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
