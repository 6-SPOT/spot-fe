"use client";

import { useRouter } from "next/navigation";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center p-4">
      {/* 상단 네비게이션 */}
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold">지역</h1>
        <button onClick={() => router.push("/notification")} className="p-2">
          🔔
        </button>
      </div>

      {/* 컨텐츠 리스트 */}
      <div className="w-full mt-4 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div
            key={id}
            onClick={() => router.push(`/detail/${id}`)}
            className="p-4 bg-gray-200 rounded-lg cursor-pointer"
          >
            <h2 className="font-semibold">이거 해주세요</h2>
            <p>거리: 1.2km</p>
            <p>금액: 10,000원</p>
            <p>예상 소요시간: 30분</p>
          </div>
        ))}
      </div>
    </div>
  );
}
