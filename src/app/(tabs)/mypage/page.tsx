"use client";

import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold">마이 페이지</h1>

      <div className="w-full mt-4 p-4 bg-gray-200 rounded-lg">
        <p>📌 닉네임</p>
        <p>⭐ 평점</p>
        <p>📊 구인 횟수 | 구직 횟수</p>
      </div>

      <div className="mt-4 space-y-2">
        <button onClick={() => router.push("/mypage/history")} className="w-full text-left p-2 border-b">
          히스토리
        </button>
        <button onClick={() => router.push("/mypage/reviews")} className="w-full text-left p-2 border-b">
          리뷰 확인
        </button>
        <button onClick={() => router.push("/mypage/favorites")} className="w-full text-left p-2 border-b">
          찜 목록
        </button>
        <button className="w-full text-left p-2 border-b">로그아웃</button>
        <button className="w-full text-left p-2 border-b text-red-500">회원 탈퇴</button>
      </div>
    </div>
  );
}
