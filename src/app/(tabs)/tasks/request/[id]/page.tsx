"use client";

import { useParams, useRouter } from "next/navigation";

export default function TaskRequestPage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">이거 해주세요</h1>

      <div className="w-full mt-4 p-4 bg-gray-200 rounded-lg">
        <p>📌 닉네임</p>
        <p>⭐ 평점</p>
        <p>📍 이 일의 주소는 여기입니다</p>
        <p>📝 상세 내용</p>
      </div>

      <div className="mt-4 flex space-x-2">
        <button className="flex-1 bg-red-500 text-white p-2 rounded-lg">취소</button>
        <button
          onClick={() => router.push(`/tasks/applicants/${id}`)}
          className="flex-1 bg-blue-500 text-white p-2 rounded-lg"
        >
          신청자 목록
        </button>
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
