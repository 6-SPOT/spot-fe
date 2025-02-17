"use client";

import { useParams, useRouter } from "next/navigation";

// 더미 신청자 데이터
const applicants = [
  { id: "1", nickname: "사용자123", rating: 4.8 },
  { id: "2", nickname: "사용자456", rating: 4.5 },
  { id: "3", nickname: "사용자789", rating: 4.9 },
];

export default function ApplicantsPage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">신청자 목록</h1>

      <div className="w-full mt-4 space-y-4">
        {applicants.map((applicant) => (
          <div key={applicant.id} className="p-4 bg-gray-200 rounded-lg">
            <p>📌 닉네임: {applicant.nickname}</p>
            <p>⭐ 평점: {applicant.rating}</p>
            <div className="flex space-x-2 mt-2">
              <button className="flex-1 bg-blue-500 text-white p-2 rounded-lg">
                1:1 대화
              </button>
              <button className="flex-1 bg-green-500 text-white p-2 rounded-lg">
                선택
              </button>
            </div>
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
