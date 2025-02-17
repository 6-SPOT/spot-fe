"use client";

import { useRouter } from "next/navigation";

// 더미 리뷰 데이터
const reviews = [
  { id: "1", rating: "⭐⭐⭐⭐⭐", reviewer: "사용자123", comment: "좋았어요!" },
  { id: "2", rating: "⭐⭐⭐⭐", reviewer: "사용자456", comment: "괜찮았습니다." },
  { id: "3", rating: "⭐⭐⭐⭐⭐", reviewer: "사용자789", comment: "완벽했습니다!" },
];

export default function ReviewsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold">리뷰 목록</h1>

      <div className="w-full mt-4 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-gray-200 rounded-lg">
            <p>{review.rating}</p>
            <p>리뷰 등록인: {review.reviewer}</p>
            <p>리뷰 내용: {review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
