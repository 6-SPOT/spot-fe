"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import API_Manager from "../../../lib/API_Manager"; // API_Manager의 경로에 맞게 수정

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const fetchHealthCheck = async () => {
    const endpoint = "/health/exception"; // 요청할 엔드포인트
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`; // 전체 URL 조합
  
    try {
      const response = await API_Manager.get(
        endpoint,
        {}, // GET 요청에서는 params
        {}, // 추가적인 헤더
        { skipAuth: true, useSerializer: true } // 인증 없이 요청
      );
  
      console.log(`(호출한 주소 : "${fullUrl}" | 결과상태값 : ${response?.status || "200 OK"})`);
    } catch (error) {
      console.error(`(호출한 주소 : "${fullUrl}" | 오류 발생)`, error);
    }
  };
  
  const handleRegionClick = () => {
    window.location.href = "http://ilmatch.net/api/member/login/kakao";
  };

  // 임시 데이터 리스트
  const tasks = [
    { id: 1, title: "이거 해주세요", distance: "거리", price: "금액", time: "예상 소요시간" },
    { id: 2, title: "이거 해주세요", distance: "거리", price: "금액", time: "예상 소요시간" },
    { id: 3, title: "이거 해주세요", distance: "거리", price: "금액", time: "예상 소요시간" },
    { id: 4, title: "이거 해주세요", distance: "거리", price: "금액", time: "예상 소요시간" },
  ];

  return (
    <div className="flex flex-col items-center p-4 w-full">
      {/* 상단 네비게이션 */}
      <div className="w-full flex justify-between items-center py-2">
        {/* "지역" 텍스트 클릭 시 fetchHealthCheck 실행 */}
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={handleRegionClick} // 클릭 시 API 호출
        >
          지역
        </h1>
        <button onClick={() => router.push("/notification")} className="p-2">
          🔔
        </button>
      </div>

      {/* 검색창 */}
      <div className="w-full flex items-center border-b pb-2">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-2 py-1 border rounded-md"
        />
        <button className="p-2">🔍</button>
      </div>

      {/* 리스트 */}
      <div className="w-full mt-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex justify-between items-center p-4 border-b cursor-pointer"
            onClick={() => router.push(`/detail/${task.id}`)}
          >
            <div className="flex-1">
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-gray-500">{task.price}</p>
              <p className="text-sm text-gray-500">{task.time}</p>
            </div>
            <div className="w-24 h-24 bg-gray-300 flex items-center justify-center">
              <Image src={require("@/assets/image/chillguy.png")} alt="작업 이미지" width={96} height={96} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
