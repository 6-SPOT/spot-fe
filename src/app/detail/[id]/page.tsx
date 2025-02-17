"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// 더미 데이터
const dummyData: Record<string, any> = {
  "1": {
    title: "이거 해주세요",
    nickname: "사용자123",
    rating: 4.8,
    address: "서울특별시 강남구",
    description: "급하게 도와주실 분을 찾고 있습니다!",
  },
  "2": {
    title: "택배 찾아주세요",
    nickname: "사용자456",
    rating: 4.5,
    address: "부산광역시 해운대구",
    description: "택배를 대신 찾아다 주실 분을 구합니다!",
  },
  "3": {
    title: "청소 도와주세요",
    nickname: "사용자789",
    rating: 4.9,
    address: "대구광역시 중구",
    description: "간단한 청소 도움을 요청합니다.",
  },
};

export default function DetailScreen() {
  const router = useRouter();
  const params = useParams(); // ✅ useParams()로 params 가져오기
  const [id, setId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  useEffect(() => {
    if (params?.id) {
      setId(params.id as string);
      setDetailData(dummyData[params.id as string] || null);
    }
  }, [params]);

  if (!id) {
    return <div className="p-4 text-center">🔄 로딩 중...</div>;
  }

  if (!detailData) {
    return <div className="p-4 text-center">❌ 해당 글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">{detailData.title}</h1>

      <div className="w-full mt-4 p-4 bg-gray-200 rounded-lg">
        <p>📌 닉네임: {detailData.nickname}</p>
        <p>⭐ 평점: {detailData.rating}</p>
        <p>📍 주소: {detailData.address}</p>
        <p>📝 상세 내용: {detailData.description}</p>
      </div>

      <div className="mt-4 flex space-x-2">
        <button className="flex-1 bg-gray-300 p-2 rounded-lg">담아두기</button>
        <button className="flex-1 bg-blue-500 text-white p-2 rounded-lg">1:1 대화</button>
        <button className="flex-1 bg-green-500 text-white p-2 rounded-lg">신청하기</button>
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
